/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Event } from "../events";

export default class InMemorySnapshotStorage
{
  private _snapshots: Map<any, any>;

  constructor()
  {
    this._snapshots = new Map();
  }

  async getAggregateSnapshot(aggregateId: string)
  {
    return this._snapshots.get(aggregateId);
  }

  async saveAggregateSnapshot(snapshotEvent: Event)
  {
    this._snapshots.set(snapshotEvent.aggregateId, snapshotEvent);
  }
}