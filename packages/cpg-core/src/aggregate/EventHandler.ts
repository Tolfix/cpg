import Aggregate, { camelCase, capitalize } from "./Aggregate";
import { Event } from "../events";
import Projection from "../projection/Projection";

export default class EventHandler<State = any>
{

  handle(aggregate: Aggregate<State> | Projection, event: Event)
  {
    const type = event.type;
    const key = this._extractKey(type);
    const applyFunction = `apply${capitalize(key)}`;
    // @ts-ignore
    const applier = aggregate[applyFunction];
    if (applier)
    {
      return applier.bind(aggregate)(event);
    }
    else
    {
      throw new Error(`No applier found for command type ${type}`);
    }
  }

  _extractKey(type: string)
  {
    const parts = type.split('.');
    const filteredParts = [];
    for (let i = 1; i < parts.length - 1; i++)
    {
      filteredParts.push(parts[i]);
    }
    filteredParts.unshift(filteredParts.pop());
    return camelCase(filteredParts.join('_'));
  }
}