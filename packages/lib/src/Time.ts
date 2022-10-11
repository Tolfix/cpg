import dateFormat from "date-and-time";


/**
 * "Given a date and a format string, return a formatted date string."
 *
 * @param {Date} date - The date to format.
 * @param {string} format - The format string.
 * @returns A Formatted string
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
 * It returns the current date in the format of YYYY-MM-DD or YYYY-MM
 * @param [removeDays=false] - If true, the date will be returned without the day.
 * @returns A string of the current date in the format of YYYY-MM-DD
 */
export function getDate(removeDays = false)
{
    const D_CurrentDate = new Date();
    let S_FixedDate = dateFormat.format(D_CurrentDate, "YYYY-MM-DD");
    if (removeDays)
        S_FixedDate = dateFormat.format(D_CurrentDate, "YYYY-MM")
    return S_FixedDate;
}