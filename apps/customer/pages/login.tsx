import { GetServerSideProps } from "next";
import Login from "../components/Login";
import { ICompanyData } from "../interfaces/CompanyData";
import { mustAuth } from "../lib/Auth";

export default ({ company }: {
    company: ICompanyData;
}) => <Login company={company} />

export const getServerSideProps: GetServerSideProps = async (context) =>
{
    const session = await mustAuth(false, context);
    if (!session)
        return {
            props: {}
        };

    return {
        props: {

        }
    };

}