import CustomerProjection from "../CustomerProjection"
import { Event } from "@cpg/core"

export default async function (this: CustomerProjection, event: Event<{ last_name: string }>): Promise<void>
{
  const customer = await this.view.get(event.aggregateId);
  customer.personal.last_name = event.payload.last_name;
  this.view.set(event.aggregateId, customer);
}
