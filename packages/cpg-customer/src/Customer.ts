import { Aggregate, Command, Event } from "@cpg/core";
import { ICustomer } from "@cpg/interfaces";
import { v4 as uuid } from "uuid";

export type CustomerHandles =
  {
    'customer.register.command': ICustomer,
    'customer.firstname.amend.command': string
  }

export default class Customer extends Aggregate<ICustomer>
{
  public type = 'customer';
  constructor({ id, events }: {
    id: string;
    events: Event[];
  })
  {
    super({ id, events });
  }

  static get handles()
  {
    return [
      'customer.register.command',
      'customer.firstname.amend.command',
    ]
  }

  register(customer: ICustomer): Promise<unknown>
  {
    const command = new Command<ICustomer>(uuid(), "customer.register.command", this.id, customer);
    return this.sink(command);
  }

  processRegister(command: Command<ICustomer>): void
  {
    const event = new Event(uuid(), "customer.registered.event", command, command.payload)
    this.apply(event);
  }

  applyRegistered(event: Event<ICustomer>): void
  {
    this.state = event.payload;
  }

  amendFirstname(first_name: string): Promise<unknown>
  {
    const command = new Command(uuid(), "customer.firstname.amend.command", this.id, { first_name });
    return this.sink(command);
  }

  processAmendFirstname(command: Command<{ first_name: string }>): void
  {
    const event = new Event(uuid(), "customer.firstname.amended.event", command, command.payload)
    this.apply(event);
  }

  applyAmendedFirstname(event: Event<{ first_name: string }>): void
  {
    this.state.personal.first_name = event.payload.first_name;
  }

}