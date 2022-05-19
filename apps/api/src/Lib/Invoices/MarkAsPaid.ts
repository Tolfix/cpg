import InvoiceModel from "../../Database/Models/Invoices.model";
import { IInvoice } from "interfaces/Invoice.interface";
import { Document } from "mongoose";
import mainEvent from "../../Events/Main.event";
import { getDate } from "lib/Time";
import TransactionsModel from "../../Database/Models/Transactions.model";
import { Company_Currency } from "../../Config";
import { idTransactions } from "../Generator";
import { ITransactions } from "interfaces/Transactions.interface";

/**
 * This type checks if we want to create a transaction for an invoice
 * If it is true, it will return a object with invoice and transaction
 * 
 * Otherwise we just return the invoice
 */
type checkIfCreate<R> = R extends true ? {
    invoice: IInvoice & Document;
    transaction: ITransactions & Document;
} : IInvoice & Document;

/**
 * Just a type that holds what we can return on the condition above
 */
type returnType = {
    invoice: IInvoice & Document;
    transaction: ITransactions & Document;
} | IInvoice & Document;

export async function getInvoiceByIdAndMarkAsPaid<
    T extends boolean = false, R extends returnType = checkIfCreate<T>
>(
    id: number | string,
    createT?: T
): Promise<R>
{
    return new Promise(async (resolve, reject) =>
    {
        const invoice = await InvoiceModel.findOne({ id: id });
        if (!invoice)
            return reject("Unable to find invoice");

        if (invoice.paid)
            return reject("Invoice is already paid");

        invoice.paid = true;
        invoice.status = "paid";
        invoice.dates.date_paid = getDate();
        await invoice.save();
        // emit event as invoice is paid
        mainEvent.emit("invoice_paid", invoice);
        let t;
        if (createT)
        {
            t = await (new TransactionsModel({
                amount: invoice.amount + invoice.amount * invoice.tax_rate / 100,
                payment_method: invoice.payment_method,
                fees: invoice.fees,
                invoice_uid: invoice.id,
                customer_uid: invoice.customer_uid,
                currency: invoice.currency ?? await Company_Currency(),
                date: getDate(),
                uid: idTransactions(),
            }).save());
        }

        // @ts-ignore
        return createT ? resolve({ invoice: invoice, transaction: t }) : resolve(invoice);
    });
}