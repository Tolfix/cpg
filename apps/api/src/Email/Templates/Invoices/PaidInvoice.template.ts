import { stripIndents } from "common-tags";
import { CPG_Customer_Panel_Domain } from "../../../Config";
import { ICustomer } from "interfaces/Customer.interface";
import { IInvoice, IInvoiceMethods } from "interfaces/Invoice.interface";
import getFullName from "../../../Lib/Customers/getFullName";
import UseStyles from "../General/UseStyles";
import printInvoiceItemsTable from "../Methods/InvoiceItems.print";
import GetOCRNumber from "../../../Lib/Invoices/GetOCRNumber";

export default async (invoice: IInvoice & IInvoiceMethods, customer: ICustomer) => await UseStyles(stripIndents`
<div>
    <h1>Hello ${getFullName(customer)}.</h1>
    <p>
        This is a notice that invoice has been paid at <strong>${invoice.dates.date_paid}</strong>.
    </p>
    <p>
        <strong>Invoice number:</strong> ${invoice.id}
    </p>
    <p>
        <strong>OCR number:</strong> ${GetOCRNumber(invoice)}
    </p>
    <p>
        <strong>Payment method:</strong> ${(invoice.payment_method).firstLetterUpperCase().replaceAll("_", " ")}
    </p>

    ${await printInvoiceItemsTable(invoice)}

    <p>
        <strong>
            Total:
        </strong>
        ${invoice.getTotalAmount({ tax: true, currency: false, symbol: false }).toFixed(2)} ${invoice.currency} (${invoice.tax_rate}%)
    </p>
    <p>
        <strong>
            Thank you for your business.
        </strong>
    </p>
    ${CPG_Customer_Panel_Domain ? `
    <p>
        <a href="${CPG_Customer_Panel_Domain}/invoices?id=${invoice.id}">View Invoice</a>
    </p>
    ` : ''}
</div>
`);