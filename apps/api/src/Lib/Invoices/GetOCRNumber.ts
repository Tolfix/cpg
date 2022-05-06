import { IInvoice } from "interfaces/Invoice.interface";

/**
 * @description
 * Template looks somewhat like this: YYMMDD(ID)
 * YY = year
 * MM = month
 * DD = day
 * ID = invoice id
 */
export default (i: IInvoice) => `${(i.dates.invoice_date as string).replaceAll("-", "")}${i.id}`