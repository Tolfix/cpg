import { Document } from "mongoose";
import { Company_Name } from "../../Config";
import { ICustomer } from "interfaces/Customer.interface";
import { IInvoice, IInvoiceMethods } from "interfaces/Invoice.interface";
import createPDFInvoice from "./CreatePDFInvoice";
import { sendEmail, SendEmail } from "../../Email/Send"
import mainEvent from "../../Events/Main.event";
import InvoiceTemplate from "../../Email/Templates/Invoices/Invoice.template";
import LateinvoiceTemplate from "../../Email/Templates/Invoices/LateInvoice.Template";

export async function sendInvoiceEmail(invoice: IInvoice & Document & IInvoiceMethods, Customer: ICustomer): Promise<boolean>
{
    return new Promise(async (resolve) =>
    {

        if (!Customer.personal.email)
            return resolve(false);

        await sendEmail({
            receiver: Customer.personal.email,
            subject: `${await Company_Name() === "" ? "CPG" : await Company_Name()}: New invoice created`,
            body: {
                body: await InvoiceTemplate(invoice, Customer),
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        content: Buffer.from(await createPDFInvoice(invoice) ?? "==", 'base64'),
                        contentType: 'application/pdf'
                    }
                ]
            }
        });

        invoice.notified = true;
        invoice.status = "payment_pending";
        await invoice.save();
        mainEvent.emit("invoice_notified", invoice);
        resolve(true);

    });
}

export async function sendLateInvoiceEmail(invoice: IInvoice & Document & IInvoiceMethods, Customer: ICustomer)
{
    return new Promise(async (resolve) =>
    {

        if (!Customer.personal.email)
            return;

        //@ts-ignore
        await SendEmail(Customer.personal.email, `${await Company_Name() ?? "CPG"}: Invoice reminder`, {
            isHTML: true,
            attachments: [
                {
                    filename: 'invoice.pdf',
                    content: Buffer.from(await createPDFInvoice(invoice) ?? "==", 'base64'),
                    contentType: 'application/pdf'
                }
            ],
            body: await LateinvoiceTemplate(invoice, Customer)
        }, (err: any, sent: any) =>
        {
            if (!err && sent)
            {
                invoice.notified = true;
                invoice.status = "payment_pending";
                invoice.save();
            }
        });

        resolve(true);
    });
}