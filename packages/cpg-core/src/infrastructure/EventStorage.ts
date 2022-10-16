/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MongoClient, ObjectId, Binary } from "mongodb";
import Logger from "@cpg/logger";
import co from "co";
import { Event } from "../events";
import { Collection } from "mongoose";
import { Aggregate } from "../aggregate";

const log = new Logger(`cpg-core-infrastructure-eventstorage`);

type OptionsReconnect = {
  retries: number;
  timeout?: number;
  debug?: (message: string) => void;
};

class ConcurrencyError extends Error
{

  static get type()
  {
    return 'ConcurrencyError';
  }

  constructor(message: string)
  {
    super(message || 'event is not unique');

    Object.defineProperties(this, {
      type: {
        value: ConcurrencyError.type,
        enumerable: true
      },
      name: {
        value: ConcurrencyError.type,
        enumerable: true
      }
    });

    if (Error.captureStackTrace)
    {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

function* reconnect(connectMethod: () => Promise<MongoClient>, { retries, timeout = 5000, debug = log.debug }: OptionsReconnect = {
  retries: 0
}): Generator<Promise<unknown>, any, any>
{
  if (typeof connectMethod !== 'function') throw new TypeError('connectMethod argument must be a Function');
  if (typeof timeout !== 'number' || !timeout) throw new TypeError('timeout argument must be a Number');
  if (typeof debug !== 'function') throw new TypeError('debug argument must be a Function');

  let attempts = 0;
  let result;

  do
  {
    try
    {
      result = yield connectMethod();
    }
    catch (err: any)
    {
      debug(err && err.message);
      attempts += 1;
      if (attempts < retries || !retries)
      {
        debug(`retrying in ${timeout / 1000} seconds...`);
        yield new Promise(rs => setTimeout(rs, timeout));
      }
      else
      {
        throw err;
      }
    }
  }
  while (!result);

  return result;
}

function* connect({ connectionString, collectionName }: { connectionString: string, collectionName: string }): Generator<Promise<unknown> | Array<any>, any, any>
{
  if (typeof connectionString !== 'string' || !connectionString.length) throw new TypeError('connectionString argument must be a non-empty String');
  if (typeof collectionName !== 'string' || !collectionName.length) throw new TypeError('collectionName argument must be a non-empty String');

  log.debug(`connecting to ${connectionString.replace(/\/\/([^@/]+@)?/, '//***@')}...`);

  const connection = yield MongoClient.connect(connectionString) as Promise<MongoClient>;

  log.info(`connected to ${connectionString.replace(/\/\/([^@/]+@)?/, '//***@')}`);

  const db = connection.db();

  const collection = db.collection(collectionName);

  return { collection, db, client: connection };
}

function wrapObjectId(obj: any, key: any)
{
  if (!obj) throw new TypeError('obj argument required');
  if (!key) throw new TypeError('key argument required');
  if (typeof obj[key] === 'string' && obj[key].length === 24)
  {
    obj[key] = new ObjectId(obj[key]);
  }
}

function wrapBinary(obj: any, key: any)
{
  if (!obj) throw new TypeError('obj argument required');
  if (!key) throw new TypeError('key argument required');
  if (typeof obj[key] === 'string')
  {
    obj[key] = new Binary(new Buffer(obj[key], 'hex'));
  }
}

function wrapEvent(evt?: Event)
{
  if (evt)
  {
    wrapObjectId(evt, '_id');
    wrapObjectId(evt, 'aggregateId');
    wrapBinary(evt, 'sig');
    wrapBinary(evt, 'hash');
  }
}

const _collection = Symbol('collection');

type c = Promise<{ collection: Collection, db: MongoClient["db"], client: MongoClient }>

export default class EventStorage
{

  // @ts-ignore
  private [_collection]: Generator<c, c>;

  get collection(): Generator<c, c>
  {
    return this[_collection];
  }

  constructor(connectionString: string)
  {
    const collectionName = "events";
    const connectMethod = co.wrap(connect);
    Object.defineProperty(this, _collection, {
      value: reconnect(() => connectMethod({ connectionString, collectionName }))
    });

  }

  getNewId(): ObjectId
  {
    return new ObjectId();
  }

  async getAggregateEvents(aggregateId: string | ObjectId, options?: { after?: any; before?: any; snapshot?: any })
  {
    if (!aggregateId)
      throw new TypeError('aggregateId argument required');
    // if (typeof aggregateId === 'string')
    //   aggregateId = new ObjectId(aggregateId);

    const q = { aggregateId };

    // if (options && options.after)
    // {
    //   (q.aggregateVersion || (q.aggregateVersion = {})).$gt = options.after;
    // }

    // if (options && options.before)
    // {
    //   (q.aggregateVersion || (q.aggregateVersion = {})).$lt = options.before;
    // }

    return await this.findEvents(q, { sort: 'aggregateVersion' });
  }

  async getEvents(eventTypes: Array<Event["type"]>)
  {
    if (!Array.isArray(eventTypes)) throw new TypeError('eventTypes argument must be an Array');

    return await this.findEvents({ type: { $in: eventTypes } });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  private async findEvents(findStatement: Record<any, any>, options?: Record<any, any>)
  {
    if (!findStatement) throw new TypeError('findStatement argument required');
    const result = this.collection.next().value.then(collection =>
      collection.collection.find(findStatement, options).toArray())
    return await result;
  }

  async saveAggregate(aggregate: Aggregate)
  {
    if (!aggregate) throw new TypeError('aggregate argument required');
    if (!aggregate.id) throw new TypeError('aggregate.id argument required');

    const client = await (await this.collection.next().value).client;
    const savedData = await client.db().collection(aggregate.type ?? "aggregate").updateOne({ _id: aggregate.id }, { $set: aggregate.state }, { upsert: true });

    return savedData;
  }

  async commitEvents(events: Event[])
  {
    if (!events) throw new TypeError('events argument required');
    if (!Array.isArray(events)) throw new TypeError('events argument must be an Array');
    events.forEach(wrapEvent);

    return await this.collection
      .next().value.then(collection => collection.collection.insertMany(events, { forceServerObjectId: true }))
      .then(writeResult => writeResult)
      .then(result =>
      {
        if (!result.acknowledged)
          throw new Error(`Write result is not OK: ${JSON.stringify(result)}`);

        return events;
      }, err =>
      {
        if (err.code === 11000)
        {
          throw new ConcurrencyError('event is not unique');
        }
        else
        {
          log.info('commit operation has failed: %s', (err && err.message) || err);
          throw err;
        }
      });
  }

}