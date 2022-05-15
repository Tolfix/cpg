import { stripIndents } from "common-tags";
import { CPG_Customer_Panel_Domain } from "../../../Config";
import { ICustomer } from "interfaces/Customer.interface";
import { IOrder } from "interfaces/Orders.interface";
import getFullName from "../../../Lib/Customers/getFullName";
import UseStyles from "../General/UseStyles";
import printOrderProductTable from "../Methods/OrderProducts.print";
import getOrderFullAmount from "../../../Lib/Orders/GetFullAmount";

export default async (order: IOrder, customer: ICustomer) => await UseStyles(stripIndents`
<div>
    <h1>Hello ${getFullName(customer)}.</h1>
    <p>
        Your order has been created.
    </p>
    <p>
        A invoice will be generated for you.
    </p>
    <p>
        <strong>Order number:</strong> ${order.id}
    </p>

    ${await printOrderProductTable(order, customer)}

    <p>
        <strong> 
        Total:
        </strong>
         ${(await getOrderFullAmount(order, customer))} ${(order.currency).toLocaleUpperCase()}
    </p>

    ${CPG_Customer_Panel_Domain ? `
    <p>
        <a href="${CPG_Customer_Panel_Domain}/orders?id=${order.id}">View Order</a>
    </p>
    ` : ''}

</div>
`);