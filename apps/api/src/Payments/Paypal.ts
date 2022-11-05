import paypal from "paypal-rest-sdk";
import { Company_Currency, DebugMode, Full_Domain, Paypal_Client_Id, Paypal_Client_Secret } from "../Config";
import CustomerModel from "../Database/Models/Customers/Customer.model";
import TransactionsModel from "../Database/Models/Transactions.model";
import { IInvoice } from "interfaces/Invoice.interface";
import { idTransactions } from "../Lib/Generator";
import { getInvoiceByIdAndMarkAsPaid } from "../Lib/Invoices/MarkAsPaid";
import sendEmailOnTransactionCreation from "../Lib/Transaction/SendEmailOnCreation";
import GetText from "../Translation/GetText";
import { validCurrencyPaypal } from "./Currencies/Paypal.currencies";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:payments:paypal");

if (Paypal_Client_Id !== "" || Paypal_Client_Secret !== "")
{
    log.info("Paypal Client ID and Secret are set, enabling Paypal payments");
    paypal.configure({
        'mode': DebugMode ? 'sandbox' : "live",
        'client_id': Paypal_Client_Id,
        'client_secret': Paypal_Client_Secret
    });
}

export function createPaypalPaymentFromInvoice(invoice: IInvoice): Promise<paypal.Link[] | undefined>
{
    return new Promise(async (resolve) =>
    {

        function removeTags(str: string)
        {
            if ((str === null) || (str === ''))
                return false;
            else
                str = str.toString();

            // Regular expression to identify HTML tags in 
            // the input string. Replacing the identified 
            // HTML tag with a null string.
            return str.replace(/(<([^>]+)>)/ig, '');
        }

        log.warn(GetText().paypal.txt_Paypal_Creating_Payment_For_Invoice(invoice))
        // Logger.warning(`Creating payment paypal for invoice ${invoice.uid}`);

        const customer = await CustomerModel.findOne({
            $or: [
                {
                    id: invoice.customer_uid
                },
                {
                    uid: invoice.customer_uid
                }
            ]
        });

        // Check if our currency is acceptable, otherwise.. default to USD
        const c = (customer?.currency ?
            customer.currency
            :
            await Company_Currency());

        // @ts-ignore
        const currency = validCurrencyPaypal(c) ? c : "USD";
        const fAmount = parseInt(invoice.amount.toFixed(2))
        const create_payment_json =
        {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `${Full_Domain}/v2/paypal/success`,
                "cancel_url": `${Full_Domain}/v2/paypal/cancel`
            },
            transactions: [
                {
                    item_list: {
                        items: await Promise.all(invoice.items.map(async (item) =>
                        {
                            return {
                                name: removeTags(item.notes),
                                price: (parseInt(item.amount.toFixed(2)) + (parseInt(item.amount.toFixed(2)) * invoice.tax_rate / 100)).toString(),
                                currency: (currency).toUpperCase(),
                                quantity: item.quantity
                            }
                        }))
                    },
                    amount: {
                        currency: (currency).toUpperCase(),
                        total: (fAmount + (fAmount * invoice.tax_rate / 100)).toString(),
                        details: {
                            subtotal: (fAmount + (fAmount * invoice.tax_rate / 100)).toString(),
                            tax: "0",
                        }
                    },
                    description: `Invoice ${invoice.id}`,
                    invoice_number: invoice.id.toString(),
                }
            ]
        };

        // @ts-ignore
        paypal.payment.create(create_payment_json, function (error, payment)
        {
            if (error || !payment)
                throw error;

            log.warn(GetText().paypal.txt_Paypal_Creating_Payment_For_Invoice(invoice))
            // Logger.warning(`Created payment paypal for invoice ${invoice.uid}`);

            resolve(payment?.links)
        });
    })
}

export async function retrievePaypalTransaction(payerId: string, paymentId: string)
{
    const execute_payment_json = {
        "payer_id": payerId,
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) =>
    {
        if (error)
            return;

        if (payment.state !== "approved")
            return;

        // Go through each transactions and get invoice_number and mark the invoice as paid
        // then make a transaction and add it to the invoice
        for await (const tran of payment.transactions)
        {
            const invoice_number = tran.invoice_number;
            if (!invoice_number)
                return;
            const invoice = await getInvoiceByIdAndMarkAsPaid(invoice_number);
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

            log.warn(GetText().paypal.txt_Paypal_Created_Transaction_From_Invoice(newTrans, invoice));
            // Logger.warning(`Created transaction ${newTrans.uid} for invoice ${invoice.uid}`);

            invoice?.transactions.push(newTrans.id);

            await invoice.save();
        }
    });
}