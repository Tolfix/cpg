import { IInvoice } from "interfaces/Invoice.interface";
import { useSession } from "next-auth/react";
import { useState } from "react";
import InvoiceModal, { popupCenter } from "../../components/Invoices/Invoice.modal";
import DynamicTable from "../../components/Tables/DynamicTable";
import { IRowData } from "../../interfaces/RowData";
import getConfig from 'next/config'
import { mustAuth } from "../../lib/Auth";
import TokenValid from "../../lib/TokenValid";
import Head from "next/head";
import Navigation from "../../components/Navigation";
import { ICustomer } from "interfaces/Customer.interface";
import { ICompanyData } from "../../interfaces/CompanyData";
const { publicRuntimeConfig: config } = getConfig()

export default (
    {
        invoices,
        count,
        pages,
        profile,
        company
    }: {
        invoices: IInvoice[] | [],
        count: number,
        pages: number,
        profile: ICustomer;
        company: ICompanyData;
    }
) =>
{
    const cpg_domain = config.CPG_DOMAIN;
    const session = useSession();

    const [currentInvoice, setCurrentInvoice] = useState<IInvoice>(invoices[0]);
    const [showModal, setShowModal] = useState(false);

    const rowData: IRowData<IInvoice>[] = [
        {
            id: "id",
            name: "Id",
            sortable: true,
            queryFormat: () =>
            {
                return "id";
            },
            printedPreview: (invoice: IInvoice) =>
            {
                return `${invoice?.id}`;
            }
        },
        {
            id: "ocr",
            name: "OCR",
            sortable: true,
            queryFormat: () =>
            {
                return "dates.invoice_date&id";
            },
            printedPreview: (invoice: IInvoice) =>
            {
                let date = (invoice.dates?.invoice_date as string)?.replaceAll("-", "");
                if (!date)
                    date = "N/A";
                return `${date}${invoice?.id}`;
            }
        },
        {
            id: "due_date",
            name: "Due Date",
            sortable: true,
            queryFormat: () =>
            {
                return "dates.due_date";
            },
            printedPreview: (invoice: IInvoice) =>
            {
                return `${invoice.dates?.due_date?.toString() || "?"}`;
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
            printedPreview: (invoice: IInvoice) =>
            {
                return `${(invoice.amount + ((invoice.amount / 100) * invoice.tax_rate)).toFixed(2).toString()} ${invoice.currency}`;
            }
        },
        {
            id: "paid",
            name: "Paid",
            sortable: true,
            queryFormat: () =>
            {
                return "paid";
            },
            printedPreview: (invoice: IInvoice) =>
            {
                return `${invoice.paid ? "Yes" : "No"}`;
            }
        },
        {
            id: "view",
            name: "View",
            extra: true,
            sortable: false,
            queryFormat: () =>
            {
                return "view";
            },
            printedPreview: (invoice: IInvoice) =>
            {
                return (
                    <>
                        <td className="text-sm font-medium text-right whitespace-nowrap">
                            <button onClick={() =>
                            {
                                setCurrentInvoice(invoice);
                                setShowModal(true);
                            }} className='text-indigo-600 hover:text-indigo-900'>
                                View
                            </button>
                        </td>
                    </>
                )
            }
        },
        {
            id: "preview",
            name: "Preview",
            extra: true,
            sortable: false,
            queryFormat: () =>
            {
                return "preview";
            },
            printedPreview: (invoice: IInvoice) =>
            {
                return (
                    <>
                        <td className="text-sm font-medium text-right whitespace-nowrap">
                            <button onClick={() =>
                            {
                                popupCenter({
                                    url: `${cpg_domain}/v2/customers/my/invoices/${invoice?.id}/preview?access_token=${session?.data?.user?.email}`,
                                    title: "Invoice Preview",
                                    w: 1200,
                                    h: 1000
                                });
                            }} className='text-indigo-600 hover:text-indigo-900 px-4'>
                                Preview
                            </button>
                        </td>
                    </>
                )
            }
        }
    ];

    return (
        <>
            <Head>
                <title>Invoices</title>
            </Head>
            <Navigation profile={profile} company={company}>
                <div className="flex flex-wrap justify-center">
                    {/* <InvoicesTable invoice={invoices} /> */}
                    {/* @ts-ignore */}
                    <DynamicTable count={count} pages={pages} path="/invoices" data={invoices} rowData={rowData} />

                    {invoices.length > 0 ? <InvoiceModal
                        invoice={currentInvoice}
                        setShow={setShowModal}
                        show={showModal}
                    /> : null}
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
    const invoices = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/invoices${query}`,
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

    const profile = await (await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/profile`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })).json();

    return {
        props: {
            invoices,
            count,
            pages,
            profile
        }
    }
}