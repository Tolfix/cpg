import { Logger } from "mongodb";
import { subscribe } from "../aggregate/AggregateCommandHandler";
import { EventStore } from "../events";
import { InMemoryView } from "../infrastructure";
import { Event } from "../events";
import { EventHandler } from "../aggregate";
import { getHandledMessageTypes } from "../container";

const log = new Logger('cpg-core-projection-projection');

/**
 * @param {any} view
 */
const isConcurrentView = (view: any) =>
  typeof view.lock === 'function' &&
  typeof view.unlock === 'function' &&
  typeof view.once === 'function';

/**
 * @param {any} view
 * @returns {IConcurrentView}
 */
const asConcurrentView = (view: any) => (isConcurrentView(view) ? view : undefined);

export default class Projection
{
  // @ts-ignore
  public type: string;
  // @ts-ignore
  _view: Map;
  eventHandler = new EventHandler();

  /**
   * Optional list of event types being handled by projection.
   * Can be overridden in projection implementation.
   * If not overridden, will detect event types from event handlers declared on the Projection class
   *
   * @type {string[]}
   * @readonly
   * @static
   */
  get handles(): undefined | string[]
  {
    return undefined;
  }

  /**
   * Default view associated with projection.
   * If not defined, an instance of `NodeCqrs.InMemoryView` is created on first access.
   *
   * @readonly
   */
  get view(): Map<any, any>
  {
    return this._view || (this._view = new Map());
  }

  /**
   * Indicates if view should be restored from EventStore on start.
   * Override for custom behavior.
   *
   * @type {boolean | Promise<boolean>}
   * @readonly
   */
  get shouldRestoreView()
  {
    return (this.view instanceof Map);
  }

  async subscribe(eventStore: EventStore)
  {
    subscribe(eventStore, this, {
      masterHandler: (e: any) => this.project(e)
    });

    await this.restore(eventStore);
  }

  /**
   * Pass event to projection event handler
   *
   * @param {Event} event
   * @returns {Promise<void>}
   */
  async project(event: Event)
  {
    const concurrentView = asConcurrentView(this.view);
    if (concurrentView && !concurrentView.ready)
      await concurrentView.once('ready');

    return this._project(event);
  }

  /**
   * Pass event to projection event handler, without awaiting for restore operation to complete
   * @protected
   * @param {IEvent} event
   * @returns {Promise<void>}
   */
  async _project(event: Event)
  {
    return this.eventHandler.handle(this, event);
  }

  /**
   * Restore projection view from event store
   *
   * @param {IEventStore} eventStore
   * @return {Promise<void>}
   */
  async restore(eventStore: EventStore)
  {
    // lock the view to ensure same restoring procedure
    // won't be performed by another projection instance
    const concurrentView = asConcurrentView(this.view);
    if (concurrentView)
      await concurrentView.lock();

    const shouldRestore = await this.shouldRestoreView;
    if (shouldRestore)
      await this._restore(eventStore);

    if (concurrentView)
      concurrentView.unlock();
  }

  /**
   * Restore projection view from event store
   * @protected
   * @param {IEventStore} eventStore
   * @return {Promise<void>}
   */
  async _restore(eventStore: EventStore)
  {
    /* istanbul ignore if */
    if (!eventStore) throw new TypeError('eventStore argument required');
    /* istanbul ignore if */
    if (typeof eventStore.getAllEvents !== 'function') throw new TypeError('eventStore.getAllEvents must be a Function');

    log.debug('retrieving events and restoring projection...');

    const messageTypes = getHandledMessageTypes(this);
    const eventsIterable = eventStore.getAllEvents(messageTypes) as unknown as Event[];

    for await (const event of eventsIterable)
    {
      try
      {
        await this._project(event);
      }
      catch (err)
      {
        log.error('error restoring projection', err);
      }
    }

    log.info(`view restored (${this.view})`);
  }
}
