import InvoiceModel from "../../Database/Models/Invoices.model";
import ProductModel from "../../Database/Models/Products.model";
import { IInvoice, IInvoice_Dates } from "interfaces/Invoice.interface";
import { IOrder } from "interfaces/Orders.interface";
import { idInvoice } from "../Generator";
import dateFormat from "date-and-time";
import getCategoryByProduct from "../Products/getCategoryByProduct";
import { IProduct } from "interfaces/Products.interface";
import ConfigurableOptionsModel from "../../Database/Models/ConfigurableOptions.model";
import { IConfigurableOptions } from "interfaces/ConfigurableOptions.interface";
import mainEvent from "../../Events/Main.event";
import { IPromotionsCodes } from "interfaces/PromotionsCodes.interface";
import { Document } from "mongoose";
import Logger from "lib/Logger";
import PromotionCodeModel from "../../Database/Models/PromotionsCode.model";
import { sanitizeMongoose } from "../Sanitize";
import CustomerModel from "../../Database/Models/Customers/Customer.model";
import { convertCurrency } from "lib/Currencies";
import nextRycleDate from "../../Lib/Dates/DateCycle";
import createCredit from "../Customers/createCredit";
import { getInvoiceByIdAndMarkAsPaid } from "../Invoices/MarkAsPaid";
import sendEmailOnTransactionCreation from "../../Lib/Transaction/SendEmailOnCreation";

function p_markInvoiceAsPaid(invoice: IInvoice)
{
    getInvoiceByIdAndMarkAsPaid(invoice.id, true).then(async (data) =>
    {
        await sendEmailOnTransactionCreation(data.transaction);
        data.invoice.transactions.push(data.transaction.id);
        await data.invoice.save();
    });
}

// Create a method that checks if the order next recycle is within 14 days
export function isWithinNext14Days(date: Date | string): boolean
{
    let nextRecycle;
    if (typeof date === "string")
        nextRecycle = dateFormat.parse(date, "YYYY-MM-DD");
    else
        nextRecycle = new Date(date);
    const today = new Date();
    const diff = Math.abs(nextRecycle.getTime() - today.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    return diffDays <= 14;
}

// Create a method that creates a invoice from IOrder interface
export async function createInvoiceFromOrder(order: IOrder)
{
    let markThisInvoiceAsPaid = false;
    // Get our products
    let Products = await getProductsByOrder(order);
    const LBProducts = createMapProductsFromOrder(order);
    const Promotion_Code = await PromotionCodeModel.findOne({ id: sanitizeMongoose(order.promotion_code) });

    // Get customer id
    const Customer_Id = order.customer_uid;
    const customer = await CustomerModel.findOne({
        $or: [
            { uid: Customer_Id },
            { id: Customer_Id },
        ]
    });
    if (!customer)
        throw new Error(`Customer ${Customer_Id} not found`);

    // Change products price based on customers.currency
    Products = await Promise.all(Products.map(async product =>
    {
        // Check if same currency
        if (product.currency.toUpperCase() !== customer.currency.toUpperCase())
            // Convert to customer currency
            product.price = await convertCurrency(product.price, product.currency, customer.currency);
        return product;
    }));

    const items = [];
    for await (let product of Products)
    {
        if (Promotion_Code)
            // @ts-ignore
            product = await getNewPriceOfPromotionCode(Promotion_Code, product);
        const category = await getCategoryByProduct(product);
        items.push({
            amount: product.price,
            notes: `${category?.name} - ${product?.name}`,
            quantity: LBProducts.get(product.id)?.quantity ?? 1,
            product_id: product.id
        });
        if (LBProducts.get(product.id)?.configurable_options)
        {
            const configurable_options = await ConfigurableOptionsModel.find({
                id: {
                    // @ts-ignore
                    // eslint-disable-next-line no-unsafe-optional-chaining
                    $in: [...LBProducts.get(product.id)?.configurable_options?.map(e => e.id ?? undefined)]
                }
            });
            if (configurable_options)
            {
                for await (const configurable_option of configurable_options)
                {
                    const option_index = LBProducts.get(product.id)?.configurable_options?.find((e: any) => e.id === configurable_option.id)?.option_index ?? 0;
                    const option = configurable_option.options[
                        option_index
                    ];
                    // Fix option.price to customer currency
                    if (product.currency.toUpperCase() !== customer.currency.toUpperCase())
                        option.price = await convertCurrency(option.price, product.currency, customer.currency);

                    items.push({
                        amount: option.price ?? 0,
                        notes: `+ ${product?.name} - ${configurable_option.name} ${option.name}`,
                        quantity: 1,
                        configurable_options_id: configurable_option.id,
                        configurable_options_index: option_index
                    });
                }
            }
        }
    }

    if (order.fees)
    {
        items.push({
            amount: order.fees,
            notes: "+ Fees",
            quantity: 1,
        });
    }

    if (order.items)
        for (const item of order.items)
        {
            items.push({
                amount: item.amount,
                notes: `${item.note}`,
                quantity: item.quantity,
            });
        }

    // Check if the customer has any credits that has no relation to a invoice
    // And add items with discount to the invoice
    // If the credit is larger then the amount of the invoice we will use the credit
    // And remove the credit from the customer, and create a new credit of the rest
    // then we should also ensure to mark the invoice as paid later
    const credits = customer.credits.filter(e => !e.invoice_id);
    if (credits.length > 0 && !(true))
    {
        const invoiceAmount = items.reduce((acc, item) =>
        {
            return acc + item.amount * item.quantity;
        }, 0)
        // Lets get all of the credits that are larger then the invoice amount
        // We will do so by getting one credit and check if the invoice amount is larger
        // If it is we add it to our list, then we add it to our total credit we have now
        // Then we check again if the invoice amount is larger the credit amount + the total credit we have now
        let totalCredit = 0;
        const usingCredits = new Map<string, number>();
        for await (const credit of credits)
            if ((credit.amount + totalCredit) <= invoiceAmount)
            {
                usingCredits.set(credit._id, credit.amount);
                totalCredit += credit.amount;
            }

        // If we have credits that we can use
        if (usingCredits.size > 0)
        {
            // Assuming we have used the amount of credits we can use
            // So we will add the discount to the invoice by adding items to the invoice
            // for (const [id, amount] of usingCredits)
            // {
            // }

            let totalAmountFromCredit = [...(usingCredits.values())].reduce((acc, amount) =>
            {
                return acc + amount;
            }, 0);
            // Lets go through each item and add the discount to it
            for (const item of items)
            {
                if (~~(totalAmountFromCredit) === 0)
                    break;
                // We should check how much credit we have
                // Then we go through a item and remove the price from it
                // And we should also ensure it doesn't go -,
                // So it shouldn't be allowed to hit zero

                const amount = item.amount * item.quantity;
                if (amount <= totalAmountFromCredit)
                {
                    // We have more credits then the item amount
                    // So we will just remove the price from the item
                    item.amount = ~~(amount - totalAmountFromCredit);
                    item.notes = `${item.notes} - Discount ${totalAmountFromCredit}`;
                    totalAmountFromCredit = totalAmountFromCredit - amount;
                    break;
                }

                if (amount > totalAmountFromCredit)
                {
                    item.amount = (amount - totalAmountFromCredit);
                    item.notes = `${item.notes} - Discount ${totalAmountFromCredit}`;
                    totalAmountFromCredit = totalAmountFromCredit - amount;
                    break;
                }
                // Assuming we still have credits left due to amount wasn't larger then the item amount
                // So we remove subtract the amount we have from `totalAmountFromCredit` with amount
                continue;
            }

            // Lets check if we have anything left to use
            // If we have we will create a new credit for the rest
            // And mark the invoice as paid
            const rest = invoiceAmount - totalCredit;
            if (rest >= 0)
            {
                // Assuming we got left overs and we need to create a new credit
                // We will create a new credit with the rest
                // And mark the invoice as paid
                customer.credits.push(createCredit(rest, customer.currency, `Left overs from invoice`));
                // Lets delete the credit we used
                for (const id of usingCredits.keys())
                    customer.credits = customer.credits.filter(e => e._id !== id);
                await customer.save();
                markThisInvoiceAsPaid = true;
            }
        }
    }

    // If we have order.items and order.products is empty, tax_rate should be order.tax_rate
    if (order.products && !order.items)
        // @ts-ignore
        order.tax_rate = Products?.reduce((acc, cur) => cur.tax_rate, 0);

    // Create invoice
    const newInvoice = await (new InvoiceModel({
        uid: idInvoice(),
        customer_uid: Customer_Id,
        dates: <IInvoice_Dates>{
            // If undefined we pick current date
            due_date: order.dates.next_recycle ?? dateFormat.format(nextRycleDate(new Date(), "monthly"), "YYYY-MM-DD"),
            // Possible fix to issue #94
            invoice_date: order.dates.last_recycle ?? dateFormat.format(new Date(), "YYYY-MM-DD"),
            // invoice_date: dateFormat.format(new Date(), "YYYY-MM-DD"),
        },
        amount: items.reduce((acc, item) =>
        {
            return acc + item.amount * item.quantity;
        }, 0),
        items: items,
        payment_method: order.payment_method,
        status: order.order_status,
        // This a fix if we use only items and there is no set tax_rate, then we set from our request, if that is empty we set to 0
        // @ts-ignore
        tax_rate: order.tax_rate,
        notes: "",
        currency: order.currency,
        paid: false,
        notified: false,
    })).save();

    mainEvent.emit("invoice_created", newInvoice);

    // Lets check if we need to mark this invoice as paid
    if (markThisInvoiceAsPaid)
    {
        // To not disturb the flow we will call a method and let it mark this invoice as paid
        // Since we don't want to wait for it to save and creating transactions
        // Since we usually send a email to the customer, so it will probably be weird if it says the invoice is paid
        // Before the email is sent.
        p_markInvoiceAsPaid(newInvoice);
    }
    return newInvoice;
}

export async function getNewPriceOfPromotionCode(code: IPromotionsCodes & Document, product: IProduct)
{
    if (code.valid_to !== "permanent")
        // Convert string to date
        if (new Date(code.valid_to) < new Date())
        {
            Logger.debug(`Promotion code ${code.name} got invalid valid date`);
            return product;
        }

    if (code.uses <= 0)
    {
        Logger.warning(`Promotion code ${code.name} has no uses left`);
        return product;
    }

    Logger.info(`Promotion code ${code.name} (${code.id}) is valid`);

    // get product from code.products_ids[]
    // _products is also an array so we need to go through each product
    // Check if the product id is in the promotion code
    if (code.products_ids.includes(product.id))
    {
        Logger.info(`Promotion code ${code.name} (${code.id}) is valid for product ${product.id}`);
        const o_price = product.price;
        // if(code.percentage)
        //     product.price = product.price-(product.price*code.discount);
        // else
        //     product.price = product.price-code.discount;

        product.price = product.price - (code.percentage ? (product.price * code.discount) : code.discount);

        Logger.info(`New price of product ${product.id} is ${product.price}, old price was ${o_price}`);
        // Check if we are - on price
        if (product.price < 0)
        {
            Logger.error(`Product ${product.id} price is less than 0, making it "free" by setting it to 0`);
            product.price = 0;
        }
    }

    // Decrease the uses if not unlimited
    if (code.uses !== "unlimited")
        code.uses--;
    await code.save();

    return product;
}

export async function getPriceFromOrder(order: IOrder, product?: IProduct[])
{
    if (!product)
        product = await getProductsByOrder(order);

    return product.reduce((acc, cur) => acc + cur.price, 0);
}

export async function getProductsByOrder(order: IOrder)
{
    if (!order.products)
        return [];
    return ProductModel.find({
        id: {
            $in: [...order.products.map(product => product.product_id)]
        }
    });
}

export function createMapProductsFromOrder(order: IOrder)
{
    if (!order.products)
        return new Map();
    const a = new Map<IProduct["id"], {
        product_id: IProduct["id"],
        configurable_options?: Array<{
            id: IConfigurableOptions["id"],
            option_index: number;
        }>,
        quantity: number
    }>()
    order.products.forEach(product => a.set(product.product_id, product));
    return a;
}

// Create a method that creates a new invoice for a customer
// It should get input from an order and decide if we should create a new invoice
// if the dates.next_recycle is in within the next 14 days
// Check also if order.billing_type is set to 'recurring'
// If so, we should create a new invoice
export function newInvoice(order: IOrder)
{
    if (order.billing_type === 'recurring' && isWithinNext14Days(order.dates.next_recycle ?? new Date()))
        return createInvoiceFromOrder(order);
    return null;
}
