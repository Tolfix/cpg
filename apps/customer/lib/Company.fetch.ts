import { ICompanyData } from "../interfaces/CompanyData";

export default async function getCompanyData(oUrl?: string): Promise<ICompanyData>
{
    const companyName = await fetch(oUrl ? oUrl : `/api/info/company`).then(res => res.json());
    return companyName;
}