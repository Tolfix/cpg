import { IOrder } from "interfaces/Orders.interface"
import { getSession } from "next-auth/react";
import { useState } from "react";
import { Modal } from "../../components/Modal";
import OrderTable from "../../components/Orders/Order.table";
import { IRowData } from "../../interfaces/RowData";
import getConfig from 'next/config'
import { mustAuth } from "../../lib/Auth";
import TokenValid from "../../lib/TokenValid";
import Head from "next/head";
import { ICustomer } from "interfaces/Customer.interface";
import Navigation from "../../components/Navigation";
import { ICompanyData } from "../../interfaces/CompanyData";
const { publicRuntimeConfig: config } = getConfig()

/**
 * It cancels an order
 * @param orderId - The order ID of the order you want to cancel.
 * @returns A boolean value.
 */
export async function CancelOrder(orderId: IOrder["id"])
{
    const session = await getSession();
    const token = session?.user?.email;

    if (!token)
        return Promise.resolve(false);

    const res = await fetch(`${config.CPG_DOMAIN}/v2/customers/my/orders/${orderId}/cancel`,
        {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

    if (res.status === 200)
        return Promise.resolve(true);
    return Promise.resolve(false);
}

export default (
    {
        orders,
        count,
        pages,
        profile,
        company
    }: {
        orders: IOrder[],
        count: number,
        pages: number,
        profile: ICustomer,
        company: ICompanyData
    }
) =>
{
    const [openModal, setOpenModal] = useState(false);
    const [currentModalClicked, setCurrentModalClicked] = useState<null | IOrder["id"]>(null);

    const rowDataOrder: IRowData<IOrder>[] = [
        {
            id: "id",
            name: "Id",
            sortable: true,
            queryFormat: () =>
            {
                return "id";
            },
            printedPreview: (order: IOrder) =>
            {
                return `${order.id}`;
            }
        },
        {
            id: "date",
            name: "Date",
            sortable: true,
            queryFormat: () =>
            {
                return "dates.created_at";
            },
            printedPreview: (order: IOrder) =>
            {
                const date = (new Date(order.dates.createdAt));
                // In month make it two digits
                const month = (date.getMonth() + 1).toString().padStart(2, "0");
                return `${date.getFullYear()}-${month}-${date.getDate()}`;
            }
        },
        {
            id: "status",
            name: "Status",
            sortable: true,
            queryFormat: () =>
            {
                return "status";
            },
            printedPreview: (order: IOrder) =>
            {
                return `${order.order_status}`;
            }
        },
        {
            id: "cancel",
            name: "Cancel",
            sortable: false,
            extra: true,
            queryFormat: () =>
            {
                return "cancel";
            },
            printedPreview: (order: IOrder) =>
            {
                return (
                    <>
                        {order.order_status !== "cancelled" && (
                            <>
                                <button onClick={() => 
                                {
                                    setCurrentModalClicked(order.id);
                                    setOpenModal(true);
                                }} id={`cancel-button-${order.id}`} className="text-indigo-600 hover:text-indigo-900"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </>
                )
            }
        }
    ]

    return (
        <>
            <Head>
                <title>Orders</title>
            </Head>
            <Navigation profile={profile} company={company}>
                <div className="flex flex-wrap justify-center">
                    <OrderTable count={count} pages={pages} orders={orders} rowData={rowDataOrder} />
                    <Modal
                        onClose={() => setOpenModal(false)}
                        show={openModal}
                        title={`Cancel Order ${currentModalClicked}`}
                    >
                        <p>Are you sure you want to cancel this order?</p>
                        <div className="flex flex-wrap">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-5 m-2 rounded bg-red-400 hover:bg-red-600"
                            >
                                No
                            </button>
                            <button
                                onClick={() => 
                                {
                                    if (currentModalClicked)
                                        CancelOrder(currentModalClicked)?.then(res =>
                                        {
                                            if (res)
                                                setOpenModal(false);
                                        });
                                }}
                                className="px-5 m-2 rounded bg-green-400 hover:bg-green-600"
                            >
                                Yes
                            </button>
                        </div>
                    </Modal>
                </div>
            </Navigation>
        </>
    )
}


/**
 * It gets the user's orders, the total number of orders, the total number of pages, and the user's profile
 * @param {any} context - This is the context object that Next.js passes to getServerSideProps. It contains the query
 * object, which is an object that contains the query string parameters.
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
    {
        query = `?sort=-id&${Object.keys(context.query).map(key => `${key}=${context.query[key]}`).join("&")}`;
    }
    let count, pages;
    const orders = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/my/orders${query}`,
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
            orders,
            count,
            pages,
            profile
        }
    }
}