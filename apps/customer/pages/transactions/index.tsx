import { ICustomer } from "interfaces/Customer.interface";
import { ITransactions } from "interfaces/Transactions.interface"
import Head from "next/head";
import Navigation from "../../components/Navigation";
import DynamicTable from "../../components/Tables/DynamicTable";
import { ICompanyData } from "../../interfaces/CompanyData";
import { IRowData } from "../../interfaces/RowData";
import { mustAuth } from "../../lib/Auth";
import TokenValid from "../../lib/TokenValid";

export default ({
    transactions,
    count,
    pages,
    profile,
    company
}: {
    transactions: ITransactions[],
    count: number,
    pages: number,
    profile: ICustomer
    company: ICompanyData
}) =>
{
    const rowData: IRowData<ITransactions>[] = [
        {
            id: "id",
            name: "Id",
            sortable: true,
            queryFormat: () =>
            {
                return "id";
            },
            printedPreview: (transactions: ITransactions) =>
            {
                return `${transactions.id}`;
            }
        },
        {
            id: "date",
            name: "Paid at",
            sortable: true,
            queryFormat: () =>
            {
                return "date";
            },
            printedPreview: (transactions: ITransactions) =>
            {
                return `${transactions.date}`;
            }
        },
        {
            id: "payment_method",
            name: "Method",
            sortable: true,
            queryFormat: () =>
            {
                return "payment_method";
            },
            printedPreview: (transactions: ITransactions) =>
            {
                return `${transactions.payment_method}`;
            }
        },
        {
            id: "amount",
            name: "Amount",
            sortable: true,
            queryFormat: () =>
            {
                return "amount";
            },
            printedPreview: (transactions: ITransactions) =>
            {
                return `${transactions.amount.toFixed(2).toString()} ${transactions.currency}`;
            }
        },
        {
            id: "fees",
            name: "Fees",
            sortable: true,
            queryFormat: () =>
            {
                return "fees";
            },
            printedPreview: (transactions: ITransactions) =>
            {
                return `${transactions.fees}`;
            }
        },
        {
            id: "invoice_uid",
            name: "Invoice",
            sortable: false,
            extra: true,
            queryFormat: () =>
            {
                return "invoice_uid";
            },
            printedPreview: (transactions: ITransactions) =>
            {
                return <>
                    <td className="text-sm font-medium text-right whitespace-nowrap">
                        <a href={`/invoices?id=${transactions.invoice_uid}`} className='text-indigo-600 hover:text-indigo-900'>
                            Go to invoice
                        </a>
                    </td>
                </>;
            }
        },
    ]

    return (
        <>
            <Head>
                <title>Transactions</title>
            </Head>
            <Navigation profile={profile} company={company}>
                <div className="flex flex-wrap justify-center">
                    {/* @ts-ignore */}
                    <DynamicTable path="/transactions" count={count} pages={pages} rowData={rowData} data={transactions} />
                </div>
            </Navigation>
        </>
    )
}

/**
 * It gets the user's session, checks if the user is authenticated, gets the user's token, checks if the token is valid,
 * gets the user's transactions, gets the user's profile, and returns the transactions, count, pages, and profile as props
 * @param {any} context - any
 * @returns An object with a property called props.
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
    let query = ``;

    if (context.query)
        query = `?sort=-id&${Object.keys(context.query).map(key => `${key}=${context.query[key]}`).join("&")}`;

    let count, pages;
    const transactions = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/transactions${query}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(res =>
        {
            count = res.headers.get("X-Total");
            pages = res.headers.get("X-Total-Pages");
            return res.json();
        });

    const profile = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }).then(res => res.json());

    return {
        props: {
            transactions,
            count,
            pages,
            profile
        }
    }
}