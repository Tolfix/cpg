import { ICustomer } from "./Customer.interface";
import { TPaymentCurrency } from "./types/Currencies";

export interface ICreateCreditIntentOptions
{
    amount: number;
    currency: TPaymentCurrency;
    customer: ICustomer;
}