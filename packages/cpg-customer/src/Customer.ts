import { Aggregate, Command, Event } from "@cpg/core";
import { Billing, ICreditCustomer, IImage, Personal, TPaymentCurrency } from "@cpg/interfaces";
import { v4 as uuid } from "uuid";
import * as amendLastname from "./commands/amendLastname";

export type CustomerHandles =
  {
    'customer.register.command': ICustomer,
    'customer.firstname.amend.command': string,
    'customer.lastname.amend.command': string,
  }

export interface Customer extends Aggregate<ICustomer>,
  amendLastname.AmendLastnameCommand { }

export interface ICustomer
{
  uid: `CUS_${string}`;
  personal: Personal;
  billing: Billing;
  password: string;
  profile_picture?: IImage["id"] | null;
  currency: TPaymentCurrency;
  notes: string;
  /**
   * Here we store credits the customer has issued.
   * It will be used to invoices to auto pay the customer.
   * 
   * Credits can also be added if the customer has paid a invoice but was too much,
   * then we as a company owes the customer money, thus we add credit.
   */
  credits: Array<ICreditCustomer>;
  status: "active" | "inactive";
  extra?: {
    [key: string]: any;
  };
  createdAt?: Date;
}

export class Customer extends Aggregate<ICustomer>
{
  public type = 'customer';
  constructor({ id, events }: {
    id: string;
    events: Event[];
  })
  {
    super({ id, events });
    this.state as ICustomer;
  }

  static get handles()
  {
    return [
      'customer.register.command',
      'customer.firstname.amend.command',
      'customer.lastname.amend.command',
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

Object.assign(Customer.prototype, amendLastname);

export default Customer;