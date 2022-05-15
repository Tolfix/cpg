
/**
 * @type {any}
 */
// @ts-ignore
import date from "./date";

export function getDate()
{
    const D_CurrentDate = new Date();
    // @ts-ignore
    const S_FixedDate = date.format(D_CurrentDate, "YYYY-MM-DD");
    return S_FixedDate;
}