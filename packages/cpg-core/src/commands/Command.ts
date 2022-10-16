export interface ICommand
{
  id: string;
  type: `${string}.command`;
  aggregateId: string;
  aggregateVersion?: number;
  context?: any;
  payload: any;
  date: Date;
}

/**
 * Creates a new command.
 */
export default class Command<Payload = Record<string, any> | string | number | object | undefined | null> implements ICommand
{
  public id: string;
  public type: `${string}.command`;
  public aggregateId: string;
  public aggregateVersion?: number;
  public payload: Payload;
  public date: Date;

  constructor(id: string, type: `${string}.command`, aggregateId: string, payload: Payload)
  {
    this.id = id;
    this.type = type;
    this.aggregateId = aggregateId;
    this.payload = payload;
    this.date = new Date();
  }
}