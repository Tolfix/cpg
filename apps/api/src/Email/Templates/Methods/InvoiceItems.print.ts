import { IInvoice } from "interfaces/Invoice.interface";
import { GetCurrencySymbol } from "lib/Currencies";
import GetTableStyle from "../CSS/GetTableStyle";

export default async function printInvoiceItemsTable(invoice: IInvoice)
{
    return `
    <table style="${GetTableStyle}">
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            ${(await Promise.all(invoice.items.map(async item => `
                <tr>
                    <td>${item.notes}</td>
                    <td>${item.quantity}</td>
                    <td>${item.amount.toFixed(2)} ${GetCurrencySymbol(invoice.currency)}</td>
                </tr>
            `))).join('')}
        </tbody>
    </table>
    `
}