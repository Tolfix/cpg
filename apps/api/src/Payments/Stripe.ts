import stripe from "stripe";
import { Company_Currency, DebugMode, Full_Domain, Stripe_SK_Live, Stripe_SK_Test } from "../Config";
import CustomerModel from "../Database/Models/Customers/Customer.model";
import InvoiceModel from "../Database/Models/Invoices.model";
import { ICreateCreditIntentOptions } from "interfaces/Stripe.interface";
import TransactionsModel from "../Database/Models/Transactions.model";
import { sendEmail } from "../Email/Send";
import NewTransactionTemplate from "../Email/Templates/Transaction/NewTransaction.template";
import { ICustomer } from "interfaces/Customer.interface";
import { IInvoice } from "interfaces/Invoice.interface";
import getFullName from "../Lib/Customers/getFullName";
import { idTransactions } from "../Lib/Generator";
import { getInvoiceByIdAndMarkAsPaid } from "../Lib/Invoices/MarkAsPaid";
import Logger from "lib/Logger";
import { getDate } from "lib/Time";
import sendEmailOnTransactionCreation from "../Lib/Transaction/SendEmailOnCreation";
const Stripe = new stripe(DebugMode ? Stripe_SK_Test : Stripe_SK_Live, {
    apiVersion: "2020-08-27",
});

// Check if stripe webhook is configured
(async () => 
{
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


export const createCreditIntent = async ({
    amount,
    currency,
    customer,
}: ICreateCreditIntentOptions) =>
{
    const intent = await Stripe.paymentIntents.create({
        amount: 0,
        currency: Company_Currency,
        payment_method_types: ["card"],
        confirm: true,
        return_url: `${Full_Domain}/v2/payments/stripe/webhook`,
    });
    cacheIntents.set(intent.id, intent);
    return intent;
}

// Create a method that will create a payment intent from an order
export const CreatePaymentIntent = async (invoice: IInvoice) =>
{
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

    cacheIntents.set(invoice.uid, intent);

    return intent;
};

export const RetrievePaymentIntent = async (payment_intent: string) => (await Stripe.paymentIntents.retrieve(payment_intent));

export const createSetupIntent = async (id: ICustomer["id"]) =>
{
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

export const RetrieveSetupIntent = async (setup_intent: string) => (await Stripe.setupIntents.retrieve(setup_intent));

export const ChargeCustomer = async (invoice_id: IInvoice["id"]) =>
{
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
            date: getDate(),
            uid: idTransactions(),
        }).save());

        // await sendEmail(customer.personal.email, "Transaction Statement", {
        //     isHTML: true,
        //     body: await NewTransactionTemplate(t, customer),
        // });

        await sendEmail({
            receiver: customer.personal.email,
            subject: "Transaction Statement",
            body: {
                body: await NewTransactionTemplate(newTrans, customer, true)
            },
        })

        Logger.warning(`Created transaction ${newTrans.uid} for invoice ${invoice.id}`);

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
        date: getDate(),
        uid: idTransactions(),
    }).save());

    await sendEmailOnTransactionCreation(newTrans);

    invoice?.transactions.push(newTrans.id);

    await invoice.save();
}