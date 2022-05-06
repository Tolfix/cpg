import { ITransactions } from "interfaces/Transactions.interface";

/**
 * @deprecated
 */
export const CacheTransactions = new Map<ITransactions["uid"], ITransactions>();