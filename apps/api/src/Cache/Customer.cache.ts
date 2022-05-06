import { ICustomer } from "interfaces/Customer.interface";

/**
 * @deprecated
 */
export const CacheCustomer = new Map<ICustomer["uid"], ICustomer>();