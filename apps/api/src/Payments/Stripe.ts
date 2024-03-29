import stripe from "stripe";
import { Company_Currency, Company_Name, DebugMode, Full_Domain, Stripe_SK_Live, Stripe_SK_Test } from "../Config";
import CustomerModel from "../Database/Models/Customers/Customer.model";
import InvoiceModel from "../Database/Models/Invoices.model";
import TransactionsModel from "../Database/Models/Transactions.model";
import { sendEmail } from "../Email/Send";
import NewTransactionTemplate from "../Email/Templates/Transaction/NewTransaction.template";
import { ICustomer } from "interfaces/Customer.interface";
import { IInvoice } from "interfaces/Invoice.interface";
import getFullName from "../Lib/Customers/getFullName";
import { idTransactions } from "../Lib/Generator";
import { getInvoiceByIdAndMarkAsPaid } from "../Lib/Invoices/MarkAsPaid";
import sendEmailOnTransactionCreation from "../Lib/Transaction/SendEmailOnCreation";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:payments:stripe");

export const StripeMap = new Map<string, stripe>();

if (Stripe_SK_Test !== "" || Stripe_SK_Live !== "")
{
    log.info("Stripe SK are set, enabling Stripe payments");
    StripeMap.set("stripe", new stripe(DebugMode ? Stripe_SK_Test : Stripe_SK_Live, {
        apiVersion: "2020-08-27",
    }));
}

if (!StripeMap.has('stripe'))
    log.error("Stripe is not configured, this will cause errors!");

// Check if stripe webhook is configured
(async () => 
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;
    if (!((await Stripe.webhookEndpoints.list()).data.length))
        Stripe.webhookEndpoints.create({
            url: `${Full_Domain}/v2/payments/stripe/webhook`,
            enabled_events: [
                "payment_intent.succeeded",
                "payment_intent.payment_failed",
                // "payment_method.attached",
                "payment_method.updated",
                "payment_method.detached",
                "setup_intent.succeeded",
                "setup_intent.canceled",
            ],
        });
})();

const cacheIntents = new Map<string, stripe.Response<stripe.PaymentIntent>>();
const cacheSetupIntents = new Map<string, stripe.Response<stripe.SetupIntent>>();


// export const createCreditIntent = async ({
//     amount,
//     currency,
//     customer,
// }: ICreateCreditIntentOptions) =>
// {
//     const intent = await Stripe.paymentIntents.create({
//         amount: 0,
//         currency: Company_Currency,
//         payment_method_types: ["card"],
//         confirm: true,
//         return_url: `${Full_Domain}/v2/payments/stripe/webhook`,
//     });
//     cacheIntents.set(intent.id, intent);
//     return intent;
// }

// Create a method that will create a payment intent from an order
export const CreatePaymentIntent = async (invoice: IInvoice<"credit_card">) =>
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;
    if (cacheIntents.has(invoice.uid))
        return cacheIntents.get(invoice.uid) as stripe.Response<stripe.PaymentIntent>;

    const customer = await CustomerModel.findOne({ id: invoice.customer_uid });
    if (!customer)
        throw new Error("Customer not found");
    // Check if we got this customer on stripe
    let s_customer;

    if (customer.extra?.stripe_id)
        s_customer = await Stripe.customers.retrieve(customer.extra.stripe_id);

    if (!customer.extra?.stripe_id)
        // Create the customer on stripe
        s_customer = await Stripe.customers.create({
            email: customer.personal.email,
            name: getFullName(customer),
            phone: customer.personal.phone,
            metadata: {
                customer_id: customer.id,
                customer_uid: customer.uid,
            },
        });

    if (!customer.extra)
        customer.extra = {};

    customer.extra.stripe_id = s_customer?.id;
    customer.markModified("extra");
    await customer.save();

    const fAmount = parseInt(invoice.items.reduce((acc, item) =>
    {
        return acc + item.amount * item.quantity;
    }, 0).toFixed(2));

    const intent = (await Stripe.paymentIntents.create({
        customer: s_customer?.id,
        amount: (fAmount + fAmount * invoice.tax_rate / 100) * 100,
        currency: (!customer.currency ? await Company_Currency() : customer.currency) ?? "sek",
        payment_method_types: ["card"],
        receipt_email: customer?.personal.email,
        // @ts-ignore
        description: "Invoice #" + invoice.id,
        metadata: {
            // @ts-ignore
            invoice_id: invoice.id,
            invoice_uid: invoice.uid,
        },
    }));

    invoice.extra.stripe_payment_intent_id = intent.id;

    // Save invoice
    await InvoiceModel.updateOne({ id: invoice.id }, { $set: { extra: invoice.extra } }).exec();

    cacheIntents.set(invoice.uid, intent);

    return intent;
};

export const RetrievePaymentIntent = async (payment_intent: string) =>
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;
    return (await Stripe.paymentIntents.retrieve(payment_intent))
};

export const refundPaymentIntent = async (payment_intent_id: stripe.PaymentIntent["id"]) =>
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;
    const intent = await Stripe.paymentIntents.retrieve(payment_intent_id);
    if (intent.status !== "succeeded")
        throw new Error("Payment intent is not succeeded");
    return await Stripe.refunds.create({
        payment_intent: payment_intent_id,
    });
}

export const createSetupIntent = async (id: ICustomer["id"]) =>
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;

    if (cacheSetupIntents.has(id))
        return cacheSetupIntents.get(id) as stripe.Response<stripe.SetupIntent>;

    const customer = await CustomerModel.findOne({ id: id });
    if (!customer)
        throw new Error("Customer not found");

    // Check if we got this customer on stripe
    let s_customer;

    if (customer.extra?.stripe_id)
        s_customer = await Stripe.customers.retrieve(customer.extra.stripe_id);

    if (!customer.extra?.stripe_id)
        // Create the customer on stripe
        s_customer = await Stripe.customers.create({
            email: customer.personal.email,
            name: getFullName(customer),
            phone: customer.personal.phone,
            metadata: {
                customer_id: customer.id,
                customer_uid: customer.uid,
            },
        });

    if (!customer.extra)
        customer.extra = {};

    customer.extra.stripe_id = s_customer?.id;
    customer.markModified("extra");
    await customer.save();

    // Check if already have a setup intent
    if (customer.extra.stripe_setup_intent)
        throw new Error("Setup intent already exists");

    const setupIntent = await Stripe.setupIntents.create({
        customer: s_customer?.id,
        payment_method_types: ['card'],
        metadata: {
            customer_id: customer.id,
            customer_uid: customer.uid,
        },
    });

    cacheSetupIntents.set(id, setupIntent);

    return setupIntent;
};

export const RetrieveSetupIntent = async (setup_intent: string) =>
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;

    return (await Stripe.setupIntents.retrieve(setup_intent))
};

export const ChargeCustomer = async (invoice_id: IInvoice["id"]) =>
{
    if (!StripeMap.has("stripe")) throw new Error("Stripe is not configured!");
    const Stripe = StripeMap.get("stripe") as stripe;

    const invoice = await InvoiceModel.findOne({ id: invoice_id });
    if (!invoice)
        throw new Error("Invoice not found");

    const customer = await CustomerModel.findOne({ id: invoice.customer_uid });
    if (!customer)
        throw new Error("Customer not found");

    // Check if we got this customer on stripe
    const s_customer = await Stripe.customers.retrieve(customer.extra?.stripe_id ?? "");
    if (!s_customer)
        throw new Error("Customer not found on stripe");

    const paymentMethods = await Stripe.paymentMethods.list({
        customer: s_customer.id,
        type: 'card',
    });

    try
    {
        const tAmount = parseInt(invoice.amount.toFixed(2));
        const paymentIntent = await Stripe.paymentIntents.create({
            amount: (tAmount + tAmount * invoice.tax_rate / 100) * 100,
            currency: (!customer.currency ? await Company_Currency() : customer.currency) ?? "sek",
            payment_method_types: ["card"],
            receipt_email: customer?.personal.email,
            // @ts-ignore
            description: "Invoice #" + invoice.id,
            metadata: {
                // @ts-ignore
                invoice_id: invoice.id,
                invoice_uid: invoice.uid,
            },
            customer: s_customer.id,
            payment_method: paymentMethods.data.length ? paymentMethods.data[0].id : undefined,
            off_session: true,
            confirm: true,
        });

        // Create transaction
        const newTrans = await (new TransactionsModel({
            amount: invoice.amount + invoice.amount * invoice.tax_rate / 100,
            payment_method: invoice.payment_method,
            fees: invoice.fees,
            invoice_uid: invoice.id,
            customer_uid: invoice.customer_uid,
            currency: invoice.currency ?? await Company_Currency(),
            date: Logger.getDate(),
            uid: idTransactions(),
        }).save());

        // await sendEmail(customer.personal.email, "Transaction Statement", {
        //     isHTML: true,
        //     body: await NewTransactionTemplate(t, customer),
        // });

        await sendEmail({
            receiver: customer.personal.email,
            subject: `${await Company_Name()}: Transaction Statement`,
            body: {
                body: await NewTransactionTemplate(newTrans, customer, true)
            },
        })

        log.warn(`Created transaction ${newTrans.uid} for invoice ${invoice.id}`);

        invoice?.transactions.push(newTrans.id);
        invoice.markModified("transactions");
        await invoice.save();
        return Promise.resolve(paymentIntent);
    }
    catch (e)
    {
        await Promise.reject(e);
    }
}

export const markInvoicePaid = async (intent: stripe.Response<stripe.PaymentIntent>) =>
{
    const invoice = await getInvoiceByIdAndMarkAsPaid(intent.metadata.invoice_id);

    const newTrans = await (new TransactionsModel({
        amount: invoice.amount + invoice.amount * invoice.tax_rate / 100,
        payment_method: invoice.payment_method,
        fees: invoice.fees,
        invoice_uid: invoice.id,
        customer_uid: invoice.customer_uid,
        currency: invoice.currency ?? await Company_Currency(),
        date: Logger.getDate(),
        uid: idTransactions(),
    }).save());

    await sendEmailOnTransactionCreation(newTrans);

    invoice?.transactions.push(newTrans.id);

    await invoice.save();
}