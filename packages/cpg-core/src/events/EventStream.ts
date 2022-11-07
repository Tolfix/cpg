import Event from "./Event";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export default class EventStream extends Array
{

  constructor(...args: any[])
  {
    super();

    const events = [].concat(...args);
    for (const e of events)
      super.push(Object.freeze(e));

    Object.freeze(this);
  }

  filter(condition: (event: Event, index: number, events: Event[]) => boolean): EventStream
  {
    return new EventStream([...this].filter(condition));
  }

  map<TResult>(mapFn: (arg0: Event, arg1: number, arg2: Array<Event>) => TResult): Array<TResult>
  {
    return [...this].map(mapFn);
  }

  /**
   * Returns a string description of event stream
   *
   * @returns {string}
   */
  toString()
  {
    if (this.length === 1)
      return `'${this[0].type}'`;

    return `${this.length} events`;
  }
}