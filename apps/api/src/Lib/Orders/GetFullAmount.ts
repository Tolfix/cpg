import { ICustomer } from "interfaces/Customer.interface";
import { IOrder } from "interfaces/Orders.interface";
import { convertCurrency } from "lib/Currencies";
import ConfigurableOptionsModel from "../../Database/Models/ConfigurableOptions.model";
import getProductById from "../Products/getProductById";

export default async function getOrderFullAmount(order: IOrder, customer: ICustomer): Promise<number>
{
    let amount = 0;
    if (order.items)
        for (const item of order.items)
        {
            amount += item.amount;
        }

    const productPrice = order.products ? (await Promise.all(order.products.map(async (product) =>
    {
        const p = await getProductById(product.product_id as any);
        if (!p) return 0;

        if (p?.currency.toUpperCase() !== customer.currency.toUpperCase())
            p.price = await convertCurrency(p?.price, p?.currency, order.currency);
        // check if configurable options are added
        const p_c = [];
        for await (const conf of product?.configurable_options ?? [])
        {
            const c = await ConfigurableOptionsModel.findOne({
                id: conf.id,
            });
            if (c)
            {
                // Check if same currency
                if (p?.currency.toUpperCase() !== customer.currency.toUpperCase())
                    // Convert to customer currency
                    c.options[conf.option_index].price = await convertCurrency(c.options[conf.option_index].price, p?.currency, customer.currency);
                p_c.push(c.options[conf.option_index].price);
            }
        }

        if (!p)
            return 0;

        let total = p?.price * product.quantity;
        if (p_c.length > 0)
            total += p_c.reduce((a, b) => a + b);

        return total;
    }))).reduce((acc: any, cur: any) => acc + cur, 0).toFixed(2) : 0;

    return amount + parseFloat(productPrice);
}