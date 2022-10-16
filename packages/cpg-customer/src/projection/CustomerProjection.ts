import { Event } from "@cpg/core";
import Projection from "@cpg/core/dist/projection/Projection";
import { ICustomer } from "@cpg/interfaces";

export default class CustomerProjection extends Projection implements Projection
{
  public type = 'customer';
  static get handles()
  {
    return [
      'customer.registered.event',
      'customer.firstname.amended.event',
    ]
  }

  applyRegistered(event: Event<ICustomer>): void
  {
    this.view.create(event.aggregateId, event.payload);
  }

  async applyAmendedFirstname(event: Event<{ first_name: string }>): Promise<void>
  {
    const customer = await this.view.get(event.aggregateId);
    customer.personal.first_name = event.payload.first_name;
    this.view.update(event.aggregateId, customer);
  }
}