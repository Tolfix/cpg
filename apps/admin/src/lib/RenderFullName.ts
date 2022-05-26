import { ICustomer } from "interfaces/Customer.interface";

export default function <T extends ICustomer>(choice: T)
{
    if (!choice)
        return ``;
    return `${choice?.personal?.first_name ?? ``} ${choice?.personal?.last_name ?? ``} - (${choice?.id ?? ""})`;
}