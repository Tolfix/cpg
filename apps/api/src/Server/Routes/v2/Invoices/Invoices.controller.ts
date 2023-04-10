import { Request, Response } from "express";
import InvoiceModel from "../../../../Database/Models/Invoices.model";
import mainEvent from "../../../../Events/Main.event";
import { IInvoice } from "interfaces/Invoice.interface";
import { idInvoice } from "../../../../Lib/Generator";
import { APIError, APISuccess } from "../../../../Lib/Response";
import BaseModelAPI from "../../../../Models/BaseModelAPI";
import { refundPaymentIntent } from "../../../../Payments/Stripe";
import { sendEmail } from "../../../../Email/Send";
import CustomerModel from "../../../../Database/Models/Customers/Customer.model";
import RefundedInvoiceTemplate from "../../../../Email/Templates/Invoices/Refunded.invoice.template";
import { sendInvoiceEmail } from "../../../../Lib/Invoices/SendEmail";
import { getInvoiceByIdAndMarkAsPaid } from "../../../../Lib/Invoices/MarkAsPaid";
import { Company_Name } from "../../../../Config";

const API = new BaseModelAPI<IInvoice>(idInvoice, InvoiceModel);

function insert(req: Request, res: Response)
{
    API.create(req.body)
        .then(async (result) =>
        {
            const send_email = req.body.send_email ?? false;

            if (send_email)
            {
                const customer = await CustomerModel.findOne({
                    $or: [
                        { id: result.customer_uid },
                        { uid: result.customer_uid as any }
                    ]
                });
                if (customer)
                    // @ts-ignore
                    await sendInvoiceEmail(result, customer);
            }

            mainEvent.emit("invoice_created", result);

            APISuccess({
                uid: result.uid
            })(res);
        });
}

function getByUid(req: Request, res: Response)
{
    API.findByUid((req.params.uid as IInvoice["uid"])).then((result) =>
    {
        APISuccess(result)(res);
    });
}

function list(req: Request, res: Response)
{
    API.findAll(req.query, res).then((result: any) =>
    {
        APISuccess(result)(res)
    });
}

async function patch(req: Request, res: Response)
{
    const refund_invoice = req.body.refund_invoice ?? false;
    const refund_email = req.body.refund_email ?? false;
    const currentInvoice = await InvoiceModel.findOne({
        $or: [
            { id: req.params.uid },
            { uid: req.params.uid as any }
        ]
    });
    API.findAndPatch((req.params.uid as IInvoice["uid"]), req.body).then(async (result) =>
    {

        if (currentInvoice)
            if (
                // Checking for cautions if we didn't do this by mistake
                // status needs to be refunded
                result.status === "refunded" &&
                // We have also marked it as refund
                refund_invoice &&
                // And we haven't refunded it already.
                !currentInvoice.extra?.refunded &&
                // We must ensure it is paid
                result.paid &&
                // And we have a payment intent
                result.extra?.stripe_payment_intent_id
            )
            {
                const nResult = result as unknown as IInvoice<"credit_card", "refunded">;
                const refunded = await refundPaymentIntent(nResult.extra.stripe_payment_intent_id);
                if (refunded.status === "succeeded")
                {
                    // @ts-ignore
                    nResult.extra = {
                        ...nResult.extra,
                        refunded: true
                    };
                    // Update invoice
                    await InvoiceModel.updateOne({
                        id: currentInvoice.id
                    }, {
                        $set: {
                            extra: nResult.extra
                        }
                    });

                    const customer = await CustomerModel.findOne({
                        $or: [
                            { id: nResult.customer_uid },
                            { uid: nResult.customer_uid as any }
                        ]
                    });
                    if (customer)
                        await sendEmail({
                            receiver: customer.personal.email,
                            subject: `${await Company_Name()}: Invoice #${result.id} has been refunded`,
                            body: {
                                // @ts-ignore
                                body: await RefundedInvoiceTemplate(result, customer)
                            }
                        });
                }
            }

        if (refund_email && !refund_invoice)
        {
            const customer = await CustomerModel.findOne({
                $or: [
                    { id: result.customer_uid },
                    { uid: result.customer_uid as any }
                ]
            });
            if (customer)
                await sendEmail({
                    receiver: customer.personal.email,
                    subject: `${await Company_Name()}: Invoice #${result.id} has been refunded`,
                    body: {
                        // @ts-ignore
                        body: await RefundedInvoiceTemplate(result, customer)
                    }
                });
        }

        if (currentInvoice?.paid !== result.paid && result.paid && result.status === "paid")
        {
            await getInvoiceByIdAndMarkAsPaid(result.id, true);
            mainEvent.emit("invoice_paid", result);
        }

        const send_email = req.body.send_email ?? false;

        if (send_email)
        {
            const customer = await CustomerModel.findOne({
                $or: [
                    { id: result.customer_uid },
                    { uid: result.customer_uid as any }
                ]
            });
            if (customer)
                // @ts-ignore
                await sendInvoiceEmail(result, customer);
        }

        // @ts-ignore
        mainEvent.emit("invoice_updated", result);
        APISuccess(result)(res);
    }).catch((err) =>
    {
        APIError(err)(res);
    });
}

function removeById(req: Request, res: Response)
{
    API.removeByUid(req.params.uid as IInvoice["uid"])
        .then((result) =>
        {
            // @ts-ignore
            mainEvent.emit("invoice_deleted", result);
            APISuccess(result, 204)(res)
        });
}

const CustomerController = {
    insert,
    getByUid,
    list,
    patch,
    removeById
}

export default CustomerController;