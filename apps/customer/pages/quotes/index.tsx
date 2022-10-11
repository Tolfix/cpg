import { useSession } from "next-auth/react";
import { useState } from "react";
import { popupCenter } from "../../components/Invoices/Invoice.modal";
import DynamicTable from "../../components/Tables/DynamicTable";
import { IRowData } from "../../interfaces/RowData";
import getConfig from 'next/config'
import { mustAuth } from "../../lib/Auth";
import TokenValid from "../../lib/TokenValid";
import { IQuotes } from "interfaces/Quotes.interface";
import { Modal } from "../../components/Modal";
import Head from "next/head";
import Navigation from "../../components/Navigation";
import { ICustomer } from "interfaces/Customer.interface";
import { ICompanyData } from "../../interfaces/CompanyData";
const { publicRuntimeConfig: config } = getConfig()

export default (
    {
        quotes,
        count,
        pages,
        profile,
        company
    }: {
        quotes: IQuotes[] | [],
        count: number,
        pages: number,
        profile: ICustomer
        company: ICompanyData
    }
) =>
{
    const cpg_domain = config.CPG_DOMAIN;
    const session = useSession();

    const [currentQuote, setCurrentQuote] = useState<IQuotes>(quotes[0]);
    const [showModal, setShowModal] = useState(false);

    /**
     * It takes a quote and a boolean, and if the boolean is true, it accepts the quote, otherwise it declines it
     * @param {IQuotes} quote - IQuotes - the quote object that was clicked on
     * @param {boolean} accept - boolean - whether the user accepted or declined the quote
     * @returns A JSON object containing the invoice information.
     */
    const responseQuote = async (quote: IQuotes, accept: boolean) =>
    {
        if (!session)
            return;

        // @ts-ignore
        const token = session.data.user.email;
        if (!token)
            return;

        const res = await fetch(`${cpg_domain}/v2/quotes/${quote.id}/${accept ? "accept" : "decline"}`,
            {
                method: 'POST',
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

        if (res.status === 200)
        {
            const invoice = await res.json();
            // redirect to invoices
            window.location.href = `/invoices?id=${invoice.id}`;
        }
    }

    const rowData: IRowData<IQuotes>[] = [
        {
            id: "id",
            name: "Id",
            sortable: true,
            queryFormat: () =>
            {
                return "id";
            },
            printedPreview: (quote: IQuotes) =>
            {
                return `${quote.id}`;
            }
        },
        {
            id: "memo",
            name: "Memo",
            sortable: true,
            queryFormat: () =>
            {
                return "memo";
            },
            printedPreview: (quote: IQuotes) =>
            {
                return `${quote.memo}`;
            }
        },
        {
            id: "due_date",
            name: "Due Date",
            sortable: true,
            queryFormat: () =>
            {
                return "due_date";
            },
            printedPreview: (quote: IQuotes) =>
            {
                return `${quote.due_date}`;
            }
        },
        {
            id: "accepted",
            name: "Accepted",
            sortable: true,
            queryFormat: () =>
            {
                return "accepted";
            },
            printedPreview: (quote: IQuotes) =>
            {
                return `${quote.accepted ? "Yes" : "No"}`;
            }
        },
        {
            id: "declined",
            name: "Declined",
            sortable: true,
            queryFormat: () =>
            {
                return "declined";
            },
            printedPreview: (quote: IQuotes) =>
            {
                return `${quote.declined ? "Yes" : "No"}`;
            }
        },
        {
            id: "preview",
            name: "Preview",
            sortable: false,
            extra: true,
            queryFormat: () =>
            {
                return "preview";
            },
            printedPreview: (quote: IQuotes) =>
            {
                return <>
                    <td className="text-sm font-medium text-right whitespace-nowrap">
                        <button onClick={() =>
                        {
                            popupCenter({
                                url: `${cpg_domain}/v2/quotes/${quote?.id}/view?access_token=${session?.data?.user?.email}`,
                                title: "Quote Preview",
                                w: 1200,
                                h: 1000
                            });
                        }} className='text-indigo-600 hover:text-indigo-900 px-4'>
                            Preview
                        </button>
                    </td>
                </>;
            }
        },
        {
            id: "response",
            name: "Response",
            extra: true,
            sortable: false,
            queryFormat: () =>
            {
                return "response";
            },
            printedPreview: (quote: IQuotes) =>
            {
                if (quote.accepted || quote.declined)
                    return <></>
                return (
                    <>
                        <td className="text-sm font-medium text-right whitespace-nowrap">
                            <button onClick={() =>
                            {
                                setCurrentQuote(quote);
                                setShowModal(true);
                            }} className='text-indigo-600 hover:text-indigo-900'>
                                Decline & Accept
                            </button>
                        </td>
                    </>
                )
            }
        },
    ]

    return (
        <>
            <Head>
                <title>Quotes</title>
            </Head>
            <Navigation profile={profile} company={company}>
                <div className="flex flex-wrap justify-center">
                    {/* @ts-ignore */}
                    <DynamicTable count={count} pages={pages} rowData={rowData} data={quotes} />

                    <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        title="Accept or Decline Quote"
                    >
                        Do you accept this quote?
                        <div className="flex justify-center mt-4">
                            <button onClick={() =>
                            {
                                responseQuote(currentQuote, false);
                            }} className="bg-red-200 hover:bg-red-300 text-white font-bold py-2 px-4 rounded-full">
                                Decline
                            </button>
                            <button onClick={() =>
                            {
                                setShowModal(false);
                                responseQuote(currentQuote, true);
                            }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full ml-4">
                                Accept
                            </button>
                        </div>
                    </Modal>
                </div>
            </Navigation>
        </>
    )
}

// @ts-ignore
export async function getServerSideProps(context)
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
    const quotes = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/quotes${query}`,
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
            quotes,
            count,
            pages,
            profile
        }
    }
}