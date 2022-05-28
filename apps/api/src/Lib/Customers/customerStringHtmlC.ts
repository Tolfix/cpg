import { ICustomer, ICustomerStringConvert } from "interfaces/Customer.interface";

type TAddBracketsToString<T extends string> = `{${T}}`;

export default function convertStringsCustomer(s: string, customer: ICustomer)
{
    // We are looking for {} with keys of ICustomerStringConvert
    // and replace them with the value of the key in the customer object
    const keyWordsLookingFor: readonly TAddBracketsToString<keyof ICustomerStringConvert>[] = [
        "{customer_name}",
        "{customer_email}",
        "{customer_phone}",
        "{customer_company}",
        "{customer_company_vat}",
        "{customer_street01}",
        "{customer_street02}",
        "{customer_city}",
        "{customer_state}",
        "{customer_postcode}",
        "{customer_country}",
    ] as const;

    const keyWordsReplacingWith: readonly string[] = [
        `${customer.personal.first_name} ${customer.personal.last_name}`,
        customer.personal.email,
        customer.personal.phone,
        customer.billing.company ?? "",
        customer.billing.company_vat ?? "",
        customer.billing.street01,
        customer.billing.street02 ?? "",
        customer.billing.city,
        customer.billing.state,
        customer.billing.postcode,
        customer.billing.country,
    ] as const;

    // We replace the key words with the values in the customer object
    const newString = keyWordsLookingFor.reduce((acc, curr, i) => acc.replaceAll(curr, keyWordsReplacingWith[i]), s);

    return newString;
}