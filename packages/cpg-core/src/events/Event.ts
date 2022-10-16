import { Command } from "../commands";

/**
 * Creates a new event
 */
export default class Event<Payload = Record<string, any>>
{
  public id: string;
  public type: `${string}.event`;
  public aggregateId: string;
  public aggregateVersion: number;
  public payload: Payload;
  public date: Date;

  constructor(id: string, type: `${string}.event`, command: Command<Payload>, payload: Payload)
  {
    this.id = id;
    this.type = type;
    this.aggregateId = command.aggregateId;
    this.aggregateVersion = command.aggregateVersion || 0;
    this.payload = payload;
    this.date = new Date();
  }
}