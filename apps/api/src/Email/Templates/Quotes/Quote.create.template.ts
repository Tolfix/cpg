import { stripIndents } from "common-tags";
import { Company_Name, CPG_Customer_Panel_Domain } from "../../../Config";
import { ICustomer } from "interfaces/Customer.interface";
import getFullName from "../../../Lib/Customers/getFullName";
import UseStyles from "../General/UseStyles";
import { IQuotes } from "interfaces/Quotes.interface";
import printQuotesItemsTable from "../Methods/QuotesItems.print";
import { formatPaymentMethod } from "../../../Payments/PaymentMethods";

export default async (quote: IQuotes, customer: ICustomer) => await UseStyles(stripIndents`
<div>
    <h1>Hello ${getFullName(customer)}.</h1>
    <p>
        This is a notice that <strong>${await Company_Name()}</strong> has sent a <strong>quote</strong> to you.
    </p>
    <p>
        <strong>Memo:</strong> ${quote.memo}
    </p>
    <p>
        <strong>Payment Method:</strong> ${formatPaymentMethod(quote.payment_method)}
    </p>
    <p>
        <strong>Tax due:</strong> ${quote.tax_rate}%
    </p>
    <p>
        <strong>Amount due:</strong> ${quote.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)} ${quote.currency}
    </p>
    <p>
        <strong>Due Date:</strong> ${quote.due_date}
    </p>

    ${await printQuotesItemsTable(quote)}

    <p>
        <strong>
            Total:
        </strong>
        ${quote.items.reduce((total, item) => total + (item.price * item.quantity), 0) + ((quote.tax_rate / 100) * quote.items.reduce((total, item) => total + (item.price * item.quantity), 0))} ${quote.currency} (${quote.tax_rate}%)
    </p>
    ${CPG_Customer_Panel_Domain ? `
    <p>
        <a href="${CPG_Customer_Panel_Domain}/quotes?id=${quote.id}">View quote</a> to accept or decline.
    </p>
    ` : ''}
</div>
`);