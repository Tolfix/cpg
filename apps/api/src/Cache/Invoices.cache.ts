import { IInvoice } from "interfaces/Invoice.interface";

export const CacheInvoice = new Map<IInvoice["uid"], IInvoice>();