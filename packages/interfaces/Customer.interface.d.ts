import { TPaymentCurrency } from "./types/Currencies";
import { IImage } from "./Images.interface";
import { IInvoice } from "./Invoice.interface";

/**
 * @typedef Customer
 * @property {string} first_name - First name of customer
 * @property {string} last_name - Last name of customer
 * @property {string} email - Email of customer
 * @property {string} phone - Phone number of customer
 * @property {string} company - Company name of customer company
 * @property {string} company_vat - Company vat name of customer company
 * @property {string} city - City of customer
 * @property {string} street01 - Street 01 of customer
 * @property {string} street02 - Street 02 of customer
 * @property {string} state - State of customer
 * @property {string} postcode - Postcode of customer
 * @property {string} country - Country of customer
 * @property {object} extra - Extra data of customer
 */

export interface ICustomer
{
    id: any;
    uid: `CUS_${string}`;
    personal: Personal;
    billing: Billing;
    password: string;
    createdAt: Date;
    profile_picture: IImage["id"] | null;
    currency: TPaymentCurrency;
    notes: string;
    /**
     * Here we store credits the customer has issued.
     * It will be used to invoices to auto pay the customer.
     * 
     * Credits can also be added if the customer has paid a invoice but was too much,
     * then we as a company owes the customer money, thus we add credit.
     */
    credits: Array<ICreditCustomer>;
    status: "active" | "inactive";
    extra: {
        [key: string]: any;
    };
}

/**
 * Credit will contain the amount of credits the customer has
 * it will have property of amount which will the amount of credits
 * then property of currency to handle exchange
 * 
 * It should also have a optional property of invoice_id
 * which it can check which invoice it will be used, if undefined we use 
 * it on any invoice the customer needs to pay
 */
export interface ICreditCustomer
{
    _id: string;

    amount: number;
    /**
     * Default to ""
     */
    notes: string;
    currency: TPaymentCurrency;

    /**
     * If this is not undefined, we assume it wants to be used on a invoice
     * Otherwise this credit can be used for something else.
     */
    invoice_id?: IInvoice["id"];
}

export interface ICustomerMethods
{
    fullName<incCo extends boolean | undefined = undefined>(sC?: incCo): incCo extends undefined ? `${string} ${string}` : `${string} ${string} ${string}`;
}

export interface Personal
{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export interface Billing
{
    company?: string;
    company_vat?: string;
    street01: string;
    street02?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}