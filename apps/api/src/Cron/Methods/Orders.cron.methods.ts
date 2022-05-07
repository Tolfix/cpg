import { Default_Language, d_Days } from "../../Config";
import OrderModel from "../../Database/Models/Orders.model";
import Logger from "lib/Logger";
import GetText from "../../Translation/GetText";
import dateFormat from "date-and-time";
import nextRecycleDate from "../../Lib/Dates/DateCycle";
import { createInvoiceFromOrder } from "../../Lib/Orders/newInvoice";
import { InvoiceCreatedReport } from "../../Email/Reports/InvoiceReport";
import { ICustomer } from "interfaces/Customer.interface";
import { IOrder } from "interfaces/Orders.interface";

// Logger.info(`Checking orders..`);
export function cron_createNewInvoicesFromOrders()
{
    Logger.info(GetText(Default_Language).cron.txt_Orders_Checking);
    // Check if the order needs to create a new invoice if order.dates.next_recycle is withing 14 days
    OrderModel.find({
        order_status: "active",
        // order_status: {
        //     $not: /fraud|cancelled|draft|refunded/g
        // }
    }).then(async orders =>
    {
        const newInvoices = [];
        const cOrder = new Map<ICustomer["uid"], IOrder[]>();
        // orders.forEach(async order => {
        for await (const order of orders)
        {
            Logger.info(GetText(Default_Language).cron.txt_Order_Checking(order.id));
            // Logger.info(`Checking order ${order.id}`);
            // Check if order.order_status is not "cancelled" or "fraud"
            if (order.dates.next_recycle)
                if (dateFormat.parse(order.dates.next_recycle, "YYYY-MM-DD").getTime() - new Date().getTime() <= d_Days * 24 * 60 * 60 * 1000)
                {
                    const temptNextRecycle = order.dates.next_recycle;
                    order.dates.last_recycle = temptNextRecycle;
                    // Update order.dates.next_recycle
                    order.dates.next_recycle = dateFormat.format(nextRecycleDate(
                        dateFormat.parse(temptNextRecycle, "YYYY-MM-DD"), order.billing_cycle ?? "monthly")
                        , "YYYY-MM-DD");

                    if (!cOrder.get(order.customer_uid))
                        cOrder.set(order.customer_uid, [order]);
                    else
                        cOrder.set(order.customer_uid, [
                            // @ts-ignore
                            ...cOrder.get(order.customer_uid),
                            order
                        ]);

                    order.markModified("dates");
                    // Save the order
                    // await order.save();
                }
        }
        // Get our orders from each customer,
        // There we will check which has the exactly the same dates and is recurring as well
        // And if they have the same dates and is recurring we join them in one invoice
        // Otherwise we just create a new invoice 
        cOrder.forEach(async (orders) =>
        {
            // Go through each orders and check if any has the same dates
            // If they have the same dates we join them in one invoice
            // Otherwise we just create a new invoice
            const ordersToInvoice = [];
            const rest = [];
            const allOrdersToSave = [];
            for await (const order of orders)
            {
                // Check if the order is recurring
                if (order.billing_cycle)
                {
                    // Check if the order has the same dates
                    if (orders.every(o =>
                    {
                        return (o.dates.next_recycle === order.dates.next_recycle) ||
                            (o.dates.last_recycle === order.dates.last_recycle) ||
                            // Check if same currency
                            (o.currency === order.currency);
                    }))
                    {
                        // Check if the order is recurring
                        if (order.billing_cycle)
                        {
                            ordersToInvoice.push(order);
                            continue;
                        }
                    }
                }
                rest.push(order);
            }

            // Now we loop through each to create a "fake",
            // order with all of them combined in one invoice
            if (ordersToInvoice.length > 0)
            {

                const nOrder = ordersToInvoice[0];
                // @ts-ignore
                // Check each product, and if they are the same add quantity
                nOrder.products = ordersToInvoice.reduce((acc, curr) =>
                {
                    acc.forEach(p =>
                    {
                        curr.products.forEach(c =>
                        {
                            if (p.product_uid === c.product_uid)
                            {
                                p.quantity += c.quantity;
                            }
                        }
                        );
                    }
                    );
                    return acc;
                }, nOrder.products);
                // Create a new invoice
                const newInvoice = await createInvoiceFromOrder(nOrder);
                newInvoices.push(newInvoice);
                // Add the order to the list of orders to save
                for (const order of ordersToInvoice)
                {
                    order.invoices.push(newInvoice.id);
                    allOrdersToSave.push(order);
                }
            }

            if (rest.length > 0)
            {
                // Create a new invoice
                for await (const order of rest)
                {
                    const newInvoice = await createInvoiceFromOrder(order);
                    newInvoices.push(newInvoice);
                    order.invoices.push(newInvoice.id);
                    allOrdersToSave.push(order);
                }
            }

            // Save all the orders
            for await (const order of allOrdersToSave)
                await OrderModel.findOneAndUpdate({ id: order.id }, order)

        });
        if (newInvoices.length > 0)
            await InvoiceCreatedReport(newInvoices);
    });
}