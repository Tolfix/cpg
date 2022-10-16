import { v4 as uuid } from "uuid";
import Logger from "@cpg/logger";
import CommandHandler from "./CommandHandler";
import EventHandler from "./EventHandler";
import { Event, EventStream } from "../events";
import { Command } from "../commands";
import EventStore from "../events/EventStore";
import { Queue } from "../infrastructure/Queue";

const log = new Logger("cpg-core-aggregate");

export const camelCase = (str: string): string => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
export const capitalize = (str: string): string => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export default class Aggregate<State = any>
{
  public id: string;
  public type: string | undefined;
  public version: number;
  public eventStore: EventStore;
  public state: State;
  private eventHandler: EventHandler<State>;
  private commandHandler: CommandHandler<State>;
  private unCommittedEvents: Event[];
  private commandQueue: Queue;
  private commandSink: {
    sink: (command: Command) => Promise<Aggregate<State> | unknown>;
  };
  private _changes: Array<any>;
  public snapshotVersion: number;

  constructor({ id, events }: {
    id: string;
    events: Event[];
  })
  {
    this.id = id;
    this.version = 0;
    this.state = {} as State;
    this.eventHandler = new EventHandler<State>();
    this.commandHandler = new CommandHandler<State>();
    this.unCommittedEvents = [];
    this.eventStore = new EventStore();
    this.commandQueue = new Queue();
    this.commandSink = {
      sink: (command: Command) => this.process(command)
    }
    this._changes = [];
    this.snapshotVersion = 0;

    if (events)
      events.forEach(event => this.mutate(event));
  }

  setType(type: string)
  {
    this.type = type;
  }

  get changes()
  {
    return new EventStream(this._changes);
  }

  get shouldTakeSnapshot()
  {
    return this.version % 50 === 0;
  }

  /**
   * All the commands it handles in a array
   */
  get handles(): string[] | undefined
  {
    return undefined;
  }

  public rehydrate(events: Event[], version?: number, snapshot?: State): this
  {
    if (snapshot)
      this.state = snapshot;
    this.version = version || 0;
    events.forEach(event => this.apply(event));
    return this;
  }

  mutate(event: Event)
  {
    if ('aggregateVersion' in event)
      this.version = event.aggregateVersion;

    // @ts-ignore
    if (event.type === 'snapshot.event')
    {
      this.snapshotVersion = event.aggregateVersion;
      this.restoreSnapshot(event);
    }
    else if (this.state)
      this.eventHandler.handle(this, event)

    this.version += 1;
  }

  restoreSnapshot(snapshotEvent: Event)
  {
    if (!snapshotEvent) throw new TypeError('snapshotEvent argument required');
    if (!snapshotEvent.type) throw new TypeError('snapshotEvent.type argument required');
    if (!snapshotEvent.payload) throw new TypeError('snapshotEvent.payload argument required');

    // @ts-ignore
    if (snapshotEvent.type !== 'snapshot.event')
      throw new Error(`snapshot event type expected`);
    if (!this.state)
      throw new Error('state property is empty, either defined state or override restoreSnapshot method');

    Object.assign(this.state, { ...snapshotEvent.payload });
  }

  public takeSnapshot(): State
  {
    const command = new Command<any>(this.id, 'snapshot.command', this.id, this.state);
    const event = new Event(this.id, 'snapshot.event', command, this.state);
    // @ts-ignore
    this.mutate(event);
    return this.state;
  }

  public makeSnapshot(): State
  {
    return { ...this.state };
  }

  public apply(event: Event): this
  {
    log.debug(`Applying event ${event.type} to aggregate ${this.id}`);

    if (!event.id)
      event.id = uuid();

    if (!event.type || !event.aggregateId || event.aggregateId != this.id)
      throw new Error(`Invalid event`);

    this.eventHandler.handle(this, event);

    this.version++;

    this.unCommittedEvents.push(event);

    if (this.shouldTakeSnapshot && this.eventStore.snapshotsSupported)
      this.takeSnapshot();

    this.eventStore.commit([event]);
    this.eventStore.saveAggregate(this);
    // this.changes.push(event);

    return this;
  }

  public handle(command: Command): Promise<Aggregate<State> | unknown>
  {
    if (!command) throw new TypeError('command argument required');
    if (!command.type) throw new TypeError('command.type argument required');

    const type = command.type as string;
    // If it looks like `customer.register.command` or `customer.firstname.amend.command`
    // Then the method should be `register` or `amendFirstname`
    const method = this.commandHandler._extractKey(type);
    // @ts-ignore
    return this[method].bind(this)(command.payload);
  }

  public async sink(command: Command): Promise<any>
  {
    log.debug(`sinking command to queue ${command.type as string} to aggregate ${this.id}`);
    return this.commandQueue.queueCommand(() =>
    {

      if (!command.id)
        command.id = uuid();

      if (!command.type || !command.aggregateId || command.aggregateId != this.id)
        throw new Error(`Invalid command`);

      // @ts-ignore
      return this.commandSink.sink(command, this);
    });
  }

  public async process(command: Command): Promise<Aggregate<State> | unknown>
  {
    log.debug(`Processing command ${command.type as string} on aggregate ${this.id}`);
    return new Promise((resolve, reject) =>
    {
      try
      {
        const events = this.commandHandler.handle(this, command);
        resolve(events);
      }
      catch (error)
      {
        reject(error);
      }
    }).catch(() =>
    {
      log.error(`Failed to process command ${command.type as string} on aggregate ${this.id}`);
    });
  }
}