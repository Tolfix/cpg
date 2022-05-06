import { IOrder } from "interfaces/Orders.interface";

/**
 * @deprecated
 */
export const CacheOrder = new Map<IOrder["uid"], IOrder>();