import { TPaymentCurrency } from "interfaces/types/Currencies";
export declare const currencyCodes: string[];
export declare function GetCurrencySymbol(code: TPaymentCurrency): string;
export declare const convertCurrency: (amount: number, fromCurrency: TPaymentCurrency, toCurrency: TPaymentCurrency, date?: string) => Promise<number>;
