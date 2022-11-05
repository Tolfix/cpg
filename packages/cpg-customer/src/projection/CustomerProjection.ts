import { Event } from "@cpg/core";
import Projection from "@cpg/core/dist/projection/Projection";
import { ICustomer } from "@cpg/interfaces";

import amendedLastname from "./projectors/amnededLastname";

export interface CustomerProjection
{
  type: 'customer';
}

export class CustomerProjection extends Projection
{
  public type: 'customer' = 'customer';
  static get handles()
  {
    return [
      'customer.registered.event',
      'customer.firstname.amended.event',
      'customer.lastname.amended.event',
    ]
  }

  applyRegistered(event: Event<ICustomer>): void
  {
    this.view.set(event.aggregateId, event.payload);
  }

  async applyAmendedFirstname(event: Event<{ first_name: string }>): Promise<void>
  {
    const customer = await this.view.get(event.aggregateId);
    customer.personal.first_name = event.payload.first_name;
    this.view.set(event.aggregateId, customer);
  }
}

Object.assign(CustomerProjection.prototype, amendedLastname.prototype);

export default CustomerProjection;