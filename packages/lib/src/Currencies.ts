import { exchangeRates } from "exchange-rates-api";
import { TPaymentCurrency } from "interfaces/types/Currencies";
// Every currency's code is in ISO 4217

export const currencyCodes = ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYR", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LVL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "USS", "UYI", "UYU", "UZS", "VEF", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XFU", "XOF", "XPD", "XPF", "XPT", "XTS", "XXX", "YER", "ZAR", "ZMW"];


/**
 * It returns the currency symbol for a given currency code
 * @param {TPaymentCurrency} code - The currency code, e.g. "USD"
 * @returns The currency symbol for the given currency code.
 */
export function GetCurrencySymbol(code: TPaymentCurrency)
{
    return (0).toLocaleString(
        "en-us",
        {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    ).replace(/\d/g, '').trim()
}

/**
 * It converts a given amount of money from one currency to another
 * @param {number} amount - The amount of money to convert.
 * @param {TPaymentCurrency} fromCurrency - The currency you want to convert from.
 * @param {TPaymentCurrency} toCurrency - The currency you want to convert to.
 * @param [date=latest] - The date to get the exchange rate for. If you don't specify a date, the latest exchange rate will
 * be used.
 * @returns A promise that resolves to a number.
 */
export const convertCurrency = async (
    amount: number,
    fromCurrency: TPaymentCurrency,
    toCurrency: TPaymentCurrency,
    date = 'latest'
) =>
{
    const instance = exchangeRates();
    // @ts-ignore
    instance.setApiBaseUrl('https://api.exchangerate.host');

    if (date === 'latest')
        instance.latest();
    else
        // @ts-ignore
        instance.at(date);

    return instance
        .base(fromCurrency)
        .symbols(toCurrency)
        .fetch()
        // @ts-ignore
        .then((rate) => rate * amount);
};