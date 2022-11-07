import { Logger, ObjectId } from "mongodb";
import { Command, CommandBus } from "../commands";
import { getHandledMessageTypes } from "../container";
import { EventStore, EventStream } from "../events";
import Aggregate from "./Aggregate";

const unique = (arr: Array<any>) => [...new Set(arr)];

const log = new Logger("cpg-core-container-container");

// @ts-ignore
export function getHandler(context, messageType)
{
  if (!context || typeof context !== 'object') throw new TypeError('context argument required');
  if (typeof messageType !== 'string' || !messageType.length) throw new TypeError('messageType argument must be a non-empty string');

  if (messageType in context && typeof context[messageType] === 'function')
    return context[messageType].bind(context);

  const privateHandlerName = `_${messageType}`;
  if (privateHandlerName in context && typeof context[privateHandlerName] === 'function')
    return context[privateHandlerName].bind(context);

  return null;
}

export function isClass(value: any)
{
  return typeof value === 'function' && Function.prototype.toString.call(value).startsWith('class');
}

// @ts-ignore
export function subscribe(observable: CommandBus | EventStore, observer, options = {})
{
  if (typeof observable !== 'object' || !observable)
    throw new TypeError('observable argument must be an Object');
  if (typeof observable.on !== 'function')
    throw new TypeError('observable.on must be a Function');
  if (typeof observer !== 'object' || !observer)
    throw new TypeError('observer argument must be an Object');
  // @ts-ignore
  const { masterHandler, messageTypes } = options;
  if (masterHandler && typeof masterHandler !== 'function')
    throw new TypeError('masterHandler parameter, when provided, must be a Function');

  const subscribeTo = messageTypes || getHandledMessageTypes(observer);
  if (!Array.isArray(subscribeTo))
    throw new TypeError('either options.messageTypes, observer.handles or ObserverType.handles is required');

  for (const messageType of unique(subscribeTo))
  {
    const handler = masterHandler || getHandler(observer, messageType);
    if (!handler)
      throw new Error(`'${messageType}' handler is not defined or not a function`);

    observable.on(messageType, handler);
  }
}

export default class AggregateCommandHandler
{

  private eventStore: EventStore;
  private aggregateFactory: (args: { id: ObjectId, events?: EventStream[] }) => Aggregate;
  private handles: typeof getHandledMessageTypes | string[];

  constructor(options: {
    handles: string[],
    // eslint-disable-next-line @typescript-eslint/ban-types
    aggregateType: Aggregate | Function
  })
  {
    if (!options.aggregateType) throw new TypeError('aggregateType argument required');
    this.eventStore = new EventStore();
    const AggregateType = options.aggregateType;

    if (isClass(AggregateType))
    {
      // @ts-ignore
      this.aggregateFactory = params => new AggregateType(params);
      // @ts-ignore
      this.handles = getHandledMessageTypes(AggregateType);
    }
    else
    {
      // @ts-ignore
      this.aggregateFactory = options.aggregateType;
      this.handles = options.handles;
    }
  }

  subscribe(commandBus: CommandBus)
  {
    subscribe(commandBus, this, {
      messageTypes: this.handles,
      masterHandler: (c: any) => this.execute(c)
    });
  }


  async _restoreAggregate(id: string)
  {
    if (!id) throw new TypeError('id argument required');

    const events = await this.eventStore.getAggregateEvents(id);
    // @ts-ignore
    const aggregate = this.aggregateFactory.call(null, { id, events });
    log.info(`${aggregate} state restored from ${events}`);

    return aggregate;
  }

  async _createAggregate()
  {
    const id = await this.eventStore.getNewId();
    const aggregate = this.aggregateFactory.call(null, { id });
    log.info(`${aggregate} created`);

    return aggregate;
  }

  async execute(cmd: Command)
  {
    if (!cmd) throw new TypeError('cmd argument required');
    if (!cmd.type) throw new TypeError('cmd.type argument required');

    const aggregate = cmd.aggregateId ?
      await this._restoreAggregate(cmd.aggregateId) :
      await this._createAggregate();

    const handlerResponse = aggregate.handle(cmd);
    if (handlerResponse instanceof Promise)
      await handlerResponse;

    let events = aggregate.changes;
    log.info(`${aggregate} "${cmd.type as string}" command processed, ${events} produced`);
    if (!events.length)
      return [];

    if (aggregate.shouldTakeSnapshot && this.eventStore.snapshotsSupported)
    {
      aggregate.takeSnapshot();
      events = aggregate.changes;
    }

    await this.eventStore.commit(events);

    await this.eventStore.saveAggregate(aggregate);

    return events;
  }
}