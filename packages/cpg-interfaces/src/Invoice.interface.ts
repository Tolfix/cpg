import { TPaymentCurrency } from "./types/Currencies";
import { IConfigurableOptions } from "./ConfigurableOptions.interface";
import { ICustomer } from "./Customer.interface";
import { TOrderStatus } from "./Orders.interface";
import { IPayments } from "./Payments.interface";
import { IProduct } from "./Products.interface";
import { ITransactions } from "./Transactions.interface";

export interface IInvoice<
    PM extends keyof IPayments = "none",
    /**
     * S for Status
     */
    S extends extendedOrderStatus = "active",
    >
{
    id: any;
    uid: `INV_${string}`;
    customer_uid: ICustomer["id"];
    dates: IInvoice_Dates;
    amount: number;
    fees?: number;
    items: Array<IInvoices_Items>;
    transactions: Array<ITransactions["id"]>;
    payment_method: keyof IPayments;
    status: extendedOrderStatus;
    tax_rate: number;
    notes: string;
    paid: boolean;
    currency: TPaymentCurrency;
    notified: boolean;
    extra: {
        stripe_payment_intent_id: PM extends "credit_card" ? string : undefined;
        // If S is `refunded` then we mark it here it is refunded
        refunded?: S extends "refunded" ? true : undefined;
        [key: string]: any;
    }
}

export interface IInvoiceMethods
{
    getTotalAmount: <C extends boolean = false>({
        tax,
        currency,
        symbol
    }:
        {
            tax?: boolean;
            currency?: C;
            symbol?: boolean;
        }) => C extends false ? number : string;

}

export type extendedOrderStatus = TOrderStatus | "draft" | "refunded" | "collections" | "payment_pending" | "paid";


export interface IInvoice_Dates
{
    invoice_date: string;
    due_date: string;
    date_refunded: string | null;
    date_cancelled: string | null;
    date_paid: string | null;
}

export interface IInvoices_Items
{
    notes: string;
    amount: IInvoice["amount"];
    quantity: number;
    product_id?: IProduct["id"];
    configurable_options_id?: IConfigurableOptions["id"];
    configurable_options_index?: IConfigurableOptions["options"]["length"];
}