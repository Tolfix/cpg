import { ICompanyData } from "../interfaces/CompanyData";

/**
 * It returns a promise that resolves to an object of type ICompanyData
 * @param {string} [oUrl] - The url to fetch the data from. If not provided, it will default to `/api/info/company`.
 * @returns An object with the company name and the company slogan.
 */
export default async function getCompanyData(oUrl?: string): Promise<ICompanyData>
{
    const companyName = await fetch(oUrl ? oUrl : `/api/info/company`).then(res => res.json());
    return companyName;
}