import { DebugMode, Default_Language, d_Days } from "../../Config";
import InvoiceModel from "../../Database/Models/Invoices.model";
import dateFormat from "date-and-time";
import Logger from "lib/Logger";
import GetText from "../../Translation/GetText";
import CustomerModel from "../../Database/Models/Customers/Customer.model";
import { sendInvoiceEmail, sendLateInvoiceEmail } from "../../Lib/Invoices/SendEmail";
import { ChargeCustomer } from "../../Payments/Stripe";
import { InvoiceLateReport, InvoiceNotifiedReport } from "../../Email/Reports/InvoiceReport";
import mainEvent from "../../Events/Main.event";
import { getDate } from "lib/Time";

export const getDates30DaysAgo = () =>
{
    const dates = [];
    for (let i = 0; i < d_Days; i++)
        dates.push(dateFormat.format(dateFormat.addDays(new Date(), -i - 1), "YYYY-MM-DD"))
    return dates;
};

export const getDatesAhead = (n: number = d_Days) =>
{
    const dates = [];
    for (let i = 0; i < n; i++)
        dates.push(dateFormat.format(dateFormat.addDays(new Date(), i + 1), "YYYY-MM-DD"))
    return dates;
}

export function cron_notifyInvoices()
{

    InvoiceModel.find({
        "dates.due_date": {
            $in: [...(getDatesAhead())]
        },
        notified: false,
        status: {
            $not: /fraud|cancelled|draft|refunded/g
        }
    }).then(async (invoices) =>
    {
        Logger.info(GetText(Default_Language).cron.txt_Invoice_Found_Notify(invoices.length));
        // Logger.info(`Found ${invoices.length} invoices to notify.`);
        for await (const invoice of invoices)
        {
            // Get customer
            const Customer = await CustomerModel.findOne({ id: invoice.customer_uid });
            if (!Customer)
                continue;

            Logger.info(GetText(Default_Language).cron.txt_Invoice_Found_Sending_Email(Customer));
            // Logger.info(`Sending email to ${Customer.personal.email}`);

            await sendInvoiceEmail(invoice, Customer);

        }
        if (invoices.length > 0)
            await InvoiceNotifiedReport(invoices);
    });
}

export function cron_chargeStripePayment()
{
    // Trigger if a invoice has stripe_setup_intent enabled and is due in the next 2 weeks.
    InvoiceModel.find({
        "dates.due_date": {
            $in: [...(getDatesAhead(DebugMode ? 60 : 14))]
        },
        status: {
            $not: /fraud|cancelled|draft|refunded/g
        },
        paid: false,
        // Idk why I thought of doing this, this is customer only...
        // // Ensure "stripe_setup_intent" is not undefined/null
        // "stripe_setup_intent": {
        //     $exists: true,
        //     $type: "boolean",
        //     $eq: true,
        //     $ne: null
        // }
    }).then(async (invoices) =>
    {
        // Logger.info(`Found ${invoices.length} invoices to charge.`);
        for await (const invoice of invoices)
        {
            // Get customer
            const Customer = await CustomerModel.findOne({
                $or: [
                    { id: invoice.customer_uid },
                    { uid: invoice.customer_uid }
                ]
            });

            if (!Customer)
                continue;

            Logger.info(`Checking ${Customer.personal.email} for stripe payment.`, Logger.trace());
            // Check if credit card
            if (invoice.payment_method !== "credit_card")
                continue;

            // Check if customer got setup_intent enabled
            if (!(Customer?.extra?.stripe_setup_intent))
                continue;

            Logger.info(`Invoice ${invoice.id} is due in the next 2 weeks and has a setup_intent enabled.`);

            // Assuming they have a card
            // Try to create a payment intent and pay
            try
            {
                await ChargeCustomer(invoice.id);
                Logger.info(`Charging ${Customer.personal.email}`);
                // assuming it worked, we can mark it as paid
                invoice.status = "paid";
                invoice.paid = true;
                invoice.dates.date_paid = getDate();
                mainEvent.emit("invoice_paid", invoice);
                // invoice.notified = true;
                await invoice.save();
            }
            catch (e)
            {
                Logger.error(`Failed to charge customer ${Customer.id} with error`, e);
            }
        }
    });
}

export function cron_notifyLateInvoicePaid()
{
    InvoiceModel.find({
        "dates.due_date": {
            $in: [...(getDates30DaysAgo())]
        },
        paid: false,
        status: {
            $not: /fraud|cancelled|draft|refunded/g
        }
    }).then(async (invoices) =>
    {
        for await (const invoice of invoices)
        {
            // Get customer
            const Customer = await CustomerModel.findOne({ id: invoice.customer_uid });
            if (!Customer)
                continue;
            await sendLateInvoiceEmail(invoice, Customer);
        }
        if (invoices.length > 0)
            await InvoiceLateReport(invoices);
    });
}