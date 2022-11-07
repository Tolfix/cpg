import { Command, Event } from "@cpg/core";
import { v4 as uuid } from "uuid";
import Customer, { ICustomer } from "../Customer";

export interface AmendLastnameCommand
{
  amendLastname: typeof amendLastname;
  processAmendLastname: typeof processAmendLastname;
  applyAmendedLastname: typeof applyAmendedLastname;
}

export function amendLastname(this: Customer, last_name: string): Promise<unknown>
{
  const command = new Command(uuid(), "customer.lastname.amend.command", this.id, { last_name });
  return this.sink(command);
}

export function processAmendLastname(this: Customer, command: Command<{ last_name: string }>): void
{
  const event = new Event(uuid(), "customer.lastname.amended.event", command, command.payload)
  this.apply(event);
}

export function applyAmendedLastname(this: Customer, event: Event<{ last_name: string }>): void
{
  if (!this.state.personal)
  {
    this.state.personal = {} as ICustomer['personal'];
  }
  this.state.personal.last_name = event.payload.last_name;
}
