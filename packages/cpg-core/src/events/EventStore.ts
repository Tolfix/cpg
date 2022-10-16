/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Event from "./Event";
import Logger from "@cpg/logger";
import MessageBus from "../infrastructure/MessageBus";
import EventStorage from "../infrastructure/EventStorage";
import InMemorySnapshotStorage from "../infrastructure/InMemorySnapshatStorage";
import EventStream from "./EventStream";
import { Aggregate } from "../aggregate";

const log = new Logger(`cpg-core-events-eventstore`)

function validateEvent(event: Event)
{
  if (typeof event !== 'object' || !event) throw new TypeError('event must be an Object');
  if (typeof event.type !== 'string' || !event.type.length) throw new TypeError('event.type must be a non-empty String');
}

function setupOneTimeEmitterSubscription(emitter: MessageBus, messageTypes: string | string[], filter: (event: Event) => boolean, handler: (event: Event) => void)
{
  if (typeof emitter !== 'object' || !emitter)
    throw new TypeError('emitter argument must be an Object');
  if (!Array.isArray(messageTypes) || messageTypes.some(m => !m || typeof m !== 'string'))
    throw new TypeError('messageTypes argument must be an Array of non-empty Strings');
  if (handler && typeof handler !== 'function')
    throw new TypeError('handler argument, when specified, must be a Function');
  if (filter && typeof filter !== 'function')
    throw new TypeError('filter argument, when specified, must be a Function');

  return new Promise(resolve =>
  {

    // handler will be invoked only once,
    // even if multiple events have been emitted before subscription was destroyed
    // https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener
    let handled = false;

    function filteredHandler(event: Event)
    {
      if (filter && !filter(event)) return;
      if (handled) return;
      handled = true;

      for (const messageType of messageTypes)
        emitter.off(messageType);

      log.debug(`'${event.type}' received, one-time subscription to '${messageTypes}' removed`);

      if (handler)
        handler(event);

      resolve(event);
    }

    for (const messageType of messageTypes)
      emitter.on(messageType, filteredHandler);

    log.debug(`set up one-time to '${messageTypes.join(',')}'`);
  });
}

/**
 * Use mongoose and rabbitMQ to store events
 */
export default class EventStore
{
  private eventEmitter: MessageBus;
  private publishTo: MessageBus;
  private storage: EventStorage;
  private snapshotStorage: InMemorySnapshotStorage;
  snapshotsSupported: any;
  validator: (event: Event<Record<string, any>>) => void;

  constructor(mongoConnectionString: string = process.env.MONGO_URI || '')
  {
    this.eventEmitter = new MessageBus();
    this.publishTo = new MessageBus();
    this.storage = new EventStorage(process.env.MONGO_URI || '');
    this.snapshotStorage = new InMemorySnapshotStorage();
    this.validator = validateEvent;
  }

  async getNewId()
  {
    return this.storage.getNewId();
  }

  async* getAllEvents(eventTypes: Event['type'])
  {
    if (eventTypes && !Array.isArray(eventTypes)) throw new TypeError('eventTypes, if specified, must be an Array');

    log.debug(`retrieving ${eventTypes ? eventTypes.join(', ') : 'all'} events...`);
    const eventsIterable = await this.storage.getEvents(eventTypes);

    yield* eventsIterable;

    log.debug(`${eventTypes ? eventTypes.join(', ') : 'all'} events retrieved`);
  }

  async getAggregateEvents(aggregateId: string)
  {
    if (!aggregateId) throw new TypeError('aggregateId argument required');

    log.debug(`retrieving event stream for aggregate ${aggregateId}...`);

    const snapshot = this.snapshotsSupported ?
      await this.snapshotStorage.getAggregateSnapshot(aggregateId) :
      undefined;

    const events = [];
    if (snapshot)
      events.push(snapshot);

    const eventsIterable = await this.storage.getAggregateEvents(aggregateId, { snapshot });
    for await (const event of eventsIterable)
      events.push(event);

    const eventStream = new EventStream(events);
    log.debug(`${eventStream} retrieved`);

    return eventStream;
  }

  async commit(events: Event[])
  {
    if (!Array.isArray(events)) throw new TypeError('events argument must be an Array');

    const eventStreamWithoutSnapshots = await this.save(events);

    // after events are saved to the persistent storage,
    // publish them to the event bus (i.e. RabbitMq)
    if (this.publishTo)
      await this.publish(eventStreamWithoutSnapshots);

    return eventStreamWithoutSnapshots;
  }

  async save(events: Event[])
  {
    if (!Array.isArray(events)) throw new TypeError('events argument must be an Array');

    const snapshotEvents = events.filter(e => e.type === 'snapshot' as any);
    if (snapshotEvents.length > 1)
      throw new Error(`cannot commit a stream with more than 1 ${'snapshot'} event`);
    if (snapshotEvents.length && !this.snapshotsSupported)
      throw new Error(`${'snapshot'} event type is not supported by the storage`);

    const snapshot = snapshotEvents[0];
    const eventStream = new EventStream(events.filter(e => e !== snapshot));

    log.debug(`validating ${eventStream}...`);
    eventStream.forEach(this.validator);
    log.debug(`saving ${eventStream}...`);
    await Promise.all([
      this.storage.commitEvents(eventStream),
      snapshot ?
        this.snapshotStorage.saveAggregateSnapshot(snapshot) :
        undefined
    ]);

    return eventStream;
  }

  async saveAggregate(aggregate: Aggregate)
  {
    if (typeof aggregate !== 'object' || !aggregate) throw new TypeError('aggregate argument must be an Object');
    if (typeof aggregate.id !== 'string' || !aggregate.id.length) throw new TypeError('aggregate.id argument must be a non-empty String');
    if (typeof aggregate.version !== 'number') throw new TypeError('aggregate.version argument must be a Number');

    const saved = await this.storage.saveAggregate(aggregate)

    return saved;
  }

  async publish(eventStream: EventStream)
  {
    const publishEvents = () =>
      Promise.all(eventStream.map(event => this.publishTo.publish(event)))
        .then(() =>
        {
          log.debug(`${eventStream} published`);
        }, error =>
        {
          log.error(`${eventStream} publishing failed: ${error.message}`);
          throw error;
        });


    log.debug(`publishing ${eventStream} asynchronously...`);
    setImmediate(publishEvents);

  }

  on(messageType: string, handler: (event: Event) => any)
  {
    if (typeof messageType !== 'string' || !messageType.length) throw new TypeError('messageType argument must be a non-empty String');
    if (typeof handler !== 'function') throw new TypeError('handler argument must be a Function');
    if (arguments.length !== 2) throw new TypeError(`2 arguments are expected, but ${arguments.length} received`);

    this.eventEmitter.on(messageType, handler);
  }

  once(messageTypes: string | string[], handler: (event: Event) => void, filter: (event: Event) => boolean)
  {
    const subscribeTo = Array.isArray(messageTypes) ? messageTypes : [messageTypes];

    return setupOneTimeEmitterSubscription(this.eventEmitter, subscribeTo, filter, handler);
  }
}