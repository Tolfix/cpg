import { ICustomer } from 'interfaces/Customer.interface';
import type { NextPage } from 'next'
import
{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { mustAuth } from '../lib/Auth';
import TokenValid from '../lib/TokenValid';
import Navigation from "../components/Navigation";
import { ICompanyData } from '../interfaces/CompanyData';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// @ts-ignore
const Home: NextPage = ({ profile, company }: {
    profile: ICustomer;
    company: ICompanyData;
}) =>
{
    return (
        <>
            {/* @ts-ignore */}
            <Navigation profile={profile} company={company} />
        </>
    );
}

/**
 * It gets the user's session, checks if the user is logged in, checks if the user's token is valid, and then gets the
 * user's profile
 * @param {any} context - This is the context object that Next.js passes to getServerSideProps. It contains the query
 * string, as well as some internal Next.js values.
 * @returns The profile of the user.
 */
export async function getServerSideProps(context: any)
{
    const session = await mustAuth(true, context);
    if (!session)
        return {
            props: {}
        };

    // @ts-ignore
    const token = session?.user.email as string
    if (!(await TokenValid(token, context)))
        return {
            props: {}
        };

    const [profile] = [
        await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(res => res.json()),
    ];

    return {
        props: {
            profile: profile,
        }
    }
}
export default Home;
