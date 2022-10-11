import dateFormat from "date-and-time";


/**
 * 
 * @param date 
 * @param format 
 * @returns A string formatted date based on format
 */
export function formatDate(date: Date, format: string): string
{
    return dateFormat.format(date, format);
}

/**
 * @returns Date format YYYY-MM-DD HH:mm:ss
 */
export function getTime() 
{
    const D_CurrentDate = new Date();

    return dateFormat.format(D_CurrentDate, "YYYY-MM-DD HH:mm:ss");
}

/**
 * 
 * @param removeDays Removes days from current date
 * @returns Returns date format YYYY-MM-DD or YYYY-MM
 */
export function getDate(removeDays = false)
{
    const D_CurrentDate = new Date();
    let S_FixedDate = dateFormat.format(D_CurrentDate, "YYYY-MM-DD");
    if (removeDays)
        S_FixedDate = dateFormat.format(D_CurrentDate, "YYYY-MM")
    return S_FixedDate;
}