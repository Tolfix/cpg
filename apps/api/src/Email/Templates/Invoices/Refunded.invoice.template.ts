import { stripIndents } from "common-tags";
import { ICustomer } from "interfaces/Customer.interface";
import { IInvoice, IInvoiceMethods } from "interfaces/Invoice.interface";
import getFullName from "../../../Lib/Customers/getFullName";
import UseStyles from "../General/UseStyles";

export default async (invoice: IInvoice & IInvoiceMethods, customer: ICustomer) => await UseStyles(stripIndents`
<div>
    <h1>Hello ${getFullName(customer)}.</h1>
    <p>
        This is a notice that your invoice <strong>(#${invoice.id})</strong> has been refunded.
    </p>
    <p>
        <strong>Invoice number:</strong> ${invoice.id}
    </p>
    <p>
        <strong>Tax due:</strong> ${invoice.tax_rate}%
    </p>
    <p>
        <strong>Amount:</strong> ${invoice.getTotalAmount({ tax: false, currency: false, symbol: false }).toFixed(2)} ${(invoice.currency)}
    </p>

    <p>
        <strong>
            Total refunded:
        </strong>
        ${invoice.getTotalAmount({ tax: true, currency: false, symbol: false }).toFixed(2)} ${invoice.currency} (${invoice.tax_rate}%)
    </p>
</div>
`);