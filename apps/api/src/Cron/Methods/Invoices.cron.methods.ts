import { Company_Name, DebugMode, Default_Language, d_Days } from "../../Config";
import InvoiceModel from "../../Database/Models/Invoices.model";
import dateFormat from "date-and-time";
import Logger from "lib/Logger";
import GetText from "../../Translation/GetText";
import CustomerModel from "../../Database/Models/Customers/Customer.model";
import { sendInvoiceEmail, sendLateInvoiceEmail } from "../../Lib/Invoices/SendEmail";
import { ChargeCustomer } from "../../Payments/Stripe";
import { InvoiceLateReport, InvoiceNotifiedReport } from "../../Email/Reports/InvoiceReport";
import { convertCurrency } from "lib/Currencies";
import { getInvoiceByIdAndMarkAsPaid } from "../../Lib/Invoices/MarkAsPaid";
import sendEmailOnTransactionCreation from "../../Lib/Transaction/SendEmailOnCreation";
import createCredit from "../../Lib/Customers/createCredit";
import { sendEmail } from "../../Email/Send";
import DueTodayInvoiceTemplate from "../../Email/Templates/Invoices/DueTodayInvoice.template";

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
            $not: /fraud|cancelled|draft|refunded|paid/g
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

export function cron_findCreditForInvoice()
{
    return new Promise((resolve) =>
    {
        // Trigger if a invoice has stripe_setup_intent enabled and is due in the next 2 weeks.
        InvoiceModel.find({
            "dates.due_date": {
                $in: [...(getDatesAhead(DebugMode ? 60 : 14))]
            },
            status: {
                $not: /fraud|cancelled|draft|refunded|paid/g
            },
            paid: false,
        }).then(async (invoices) =>
        {
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

                // Check if customer has credits
                if (Customer.credits.length <= 0)
                    continue;

                // check if the we got a credit linked to this invoice
                const credit = Customer.credits.find(c => c.invoice_id === invoice.id);
                if (!credit)
                    continue;

                // Check if credit has the same currency, if not we convert it to invoice currency
                if (credit.currency !== invoice.currency)
                {
                    // Convert credit.amount to invoice currency
                    const newPrice = await convertCurrency(credit.amount, credit.currency, invoice.currency);
                    credit.amount = newPrice;
                    credit.currency = invoice.currency;
                }

                // Should this process be done when we create invoice?
                // The customer won't know credit has been added.. 
                // We can either send a new invoice with the update
                // Or we remove this and add it on invoice creation, and just assume they should always
                // have the right amount of credits.
                // Check if the credit is enough to cover the invoice
                if (credit.amount <= invoice.amount)
                    continue;
                // if (credit.amount <= invoice.amount)
                // {
                //     // Assuming it wasn't enough, instead we add discount to the invoice
                //     // We will do so by adding a item to the invoice
                //     invoice.items.push({
                //         notes: "- DISCOUNT CREDIT",
                //         amount: -(credit.amount),
                //         quantity: 1,
                //     });
                //     invoice.amount -= credit.amount;
                //     // Now we delete the credit from the customer
                //     Customer.credits = Customer.credits.filter(c => c.id !== credit.id);
                //     // And we save the customer
                //     await Customer.save();
                //     // And we save the invoice
                //     await invoice.save();
                //     // Assuming we are done we continue
                //     continue;
                // }

                // If we are here, we assume the credit is enough to cover the invoice
                // Then we will just mark the invoice as paid and create a transaction
                const {
                    invoice: paidInvoice,
                    transaction
                } = await getInvoiceByIdAndMarkAsPaid(invoice.id, true);
                // And we will send an email to the customer
                await sendEmailOnTransactionCreation(transaction);
                paidInvoice.transactions.push(transaction.id);
                await paidInvoice.save();

                // Now we delete the old credit from the customer
                Customer.credits = Customer.credits.filter(c => c._id !== credit._id);

                // Now we check how much credit we got left
                const remainingCredit = credit.amount - invoice.amount;
                // If we have remaining credit, we will add it to the customer
                if (remainingCredit > 0)
                {
                    // We will add the remaining credit to the customer
                    Customer.credits.push(
                        createCredit(
                            remainingCredit,
                            credit.currency,
                            `Left overs from invoice #${paidInvoice.id}`
                        )
                    );
                }

                // And we save the customer
                await Customer.save();
            }
            resolve(true);
        });
    })
}

export function cron_chargeStripePayment()
{
    // Trigger if a invoice has stripe_setup_intent enabled and is due in the next 2 weeks.
    InvoiceModel.find({
        "dates.due_date": {
            $in: [...(getDatesAhead(DebugMode ? 60 : 14))]
        },
        status: {
            $not: /fraud|cancelled|draft|refunded|paid/g
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
                await getInvoiceByIdAndMarkAsPaid(invoice.id, true);
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
            $not: /fraud|cancelled|draft|refunded|paid/g
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

/**
 * @description
 * Check if the invoice due_date is today and send reminder that the invoice is due today.
 */
export const cron_remindCustomerLastDay = async () =>
{
    InvoiceModel.find(
        {
            "dates.due_date": {
                $in: [dateFormat.format(new Date(), "YYYY-MM-DD")]
            },
            paid: false,
            status: {
                $not: /fraud|cancelled|draft|refunded|paid/g
            }
        }
    ).then(async (invoices) =>
    {
        for await (const invoice of invoices)
        {
            // Get customer
            const Customer = await CustomerModel.findOne({ id: invoice.customer_uid });
            if (!Customer)
                continue;

            await sendEmail({
                receiver: Customer.personal.email,
                subject: `${await Company_Name()}: Invoice is due today`,
                body: {
                    body: DueTodayInvoiceTemplate(invoice, Customer)
                }
            });
        }
    });
}