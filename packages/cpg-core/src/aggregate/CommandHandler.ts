import Aggregate, { camelCase, capitalize } from "./Aggregate";
import { Command } from "../commands";

export default class CommandHandler<State = any>
{

  handle(aggregate: Aggregate<State>, command: Command)
  {
    const type = command.type;
    const key = this._extractKey(type);
    const processFunction = `process${capitalize(key)}`;
    // @ts-ignore
    const applier = aggregate[processFunction];
    if (applier)
    {
      return applier.bind(aggregate)(command);
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