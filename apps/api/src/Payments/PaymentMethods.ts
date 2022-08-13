import { IPayments } from "interfaces/Payments.interface";

export function formatPaymentMethod(s: keyof IPayments)
{
    let result = s.toString();
    result = result.replace(/_/g, ' ');
    result = result.firstLetterUpperCase();
    return result;
}