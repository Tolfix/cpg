import { Request, Response } from "express";
import { Company_Name } from "../../../../Config";
import CustomerModel from "../../../../Database/Models/Customers/Customer.model";
import QuotesModel from "../../../../Database/Models/Quotes.model";
import { sendEmail, SendEmail } from "../../../../Email/Send";
import mainEvent from "../../../../Events/Main.event";
import { IQuotes } from "interfaces/Quotes.interface";
import { idQuotes } from "../../../../Lib/Generator";
import { APIError, APISuccess } from "../../../../Lib/Response";
import BaseModelAPI from "../../../../Models/BaseModelAPI";
import QuoteCreateTemplate from "../../../../Email/Templates/Quotes/Quote.create.template";
import QuoteToInvoice from "../../../../Lib/Quotes/QuoteToInvoice";
import { sendInvoiceEmail } from "../../../../Lib/Invoices/SendEmail";
import createQuotePdf from "../../../../Lib/Quotes/CreateQuotePdf";
import QuoteAcceptedTemplate from "../../../../Email/Templates/Quotes/Quote.accepted.template";

const API = new BaseModelAPI<IQuotes>(idQuotes, QuotesModel);

/**
 * It creates a quote, and if the quote has the `send_email` property set to true, it will send an email to the customer
 * with the quote attached
 * @param {Request} req - Request - This is the request object that is passed to the function.
 * @param {Response} res - Response - This is the response object that will be sent back to the client.
 */
function insert(req: Request, res: Response)
{
    API.create(req.body)
        .then(async (result) =>
        {

            if (req.body.send_email !== undefined && req.body.send_email)
            {
                // Get customer.
                const Customer = await CustomerModel.findOne({
                    $or: [
                        { id: result.customer_uid },
                        { uid: result.customer_uid as any }
                    ]
                });
                if (Customer)
                {
                    // Send email to customer.
                    await SendEmail(Customer.personal.email, `Quote from ${await Company_Name() === "" ? "CPG" : await Company_Name()}`, {
                        isHTML: true,
                        attachments: [
                            {
                                filename: `${result.id}_quote.pdf`,
                                content: Buffer.from(await createQuotePdf(result) ?? "==", 'base64'),
                                contentType: 'application/pdf'
                            }
                        ],
                        body: await QuoteCreateTemplate(result, Customer)
                    });
                }
            }

            mainEvent.emit("quotes_created", result);

            APISuccess({
                uid: result.uid
            })(res);
        });
}

/**
 * > This function is called when a user requests a quote by its unique identifier
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent to the client.
 */
function getByUid(req: Request, res: Response)
{
    API.findByUid((req.params.uid as IQuotes["uid"])).then((result) =>
    {
        APISuccess(result)(res);
    });
}


/**
 * > The function `list` takes a `Request` and a `Response` object as parameters, and returns a `Promise` of an array of
 * `IQuotes` objects
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object from the express server
 */
function list(req: Request, res: Response)
{
    API.findAll(req.query, res).then((result: any) =>
    {
        APISuccess(result)(res)
    });
}

/**
 * It patches a quote, and if the quote is accepted, it converts it to an invoice
 * @param {Request} req - Request - The request object.
 * @param {Response} res - Response - The response object.
 */
async function patch(req: Request, res: Response)
{
    // Lets get if accepted or declined.
    const accepted = req.body.accepted;
    const currentQuote = await QuotesModel.findOne({
        $or: [
            { uid: req.params.uid },
            { id: req.params.uid }
        ]
    });
    API.findAndPatch((req.params.uid as IQuotes["uid"]), req.body).then(async (result) =>
    {
        // Get customer.
        const Customer = await CustomerModel.findOne({
            $or: [
                { id: result.customer_uid },
                { uid: result.customer_uid as any }
            ]
        });
        // Lets check if our current quote isn't accepted.
        // If it isn't and `accepted` is true, then assuming we want to create a invoice
        if (!currentQuote?.accepted && accepted)
        {
            // Convert quote to invoice
            const invoice = await QuoteToInvoice(result);
            if (!invoice)
                return APIError("Failed to convert quote to invoice")(res);

            if (Customer)
            {
                await sendEmail({
                    receiver: Customer.personal.email,
                    subject: `${await Company_Name()}: Quote #${result.id} has been accepted`,
                    body: {
                        body: await QuoteAcceptedTemplate(result, Customer),
                    }
                });
                await sendInvoiceEmail(invoice, Customer)
            }
        }

        if (req.body.send_email !== undefined && req.body.send_email)
            if (Customer)
                // Send email to customer.
                await SendEmail(Customer.personal.email, `Quote from ${await Company_Name() === "" ? "CPG" : await Company_Name()}`, {
                    isHTML: true,
                    attachments: [
                        {
                            filename: `${result.id}_quote.pdf`,
                            content: Buffer.from(await createQuotePdf(result) ?? "==", 'base64'),
                            contentType: 'application/pdf'
                        }
                    ],
                    body: await QuoteCreateTemplate(result, Customer)
                });

        // @ts-ignore
        mainEvent.emit("quotes_updated", result);
        APISuccess(result)(res);
    });
}

/**
 * > It removes a quote by its unique identifier
 * @param {Request} req - Request - The request object
 * @param {Response} res - Response - The response object that will be sent to the client
 */
function removeById(req: Request, res: Response)
{
    API.removeByUid(req.params.uid as IQuotes["uid"])
        .then((result) =>
        {
            // @ts-ignore
            mainEvent.emit("quotes_deleted", result);
            APISuccess(result, 204)(res)
        });
}

const QuotesController = {
    insert,
    getByUid,
    list,
    patch,
    removeById
}

export default QuotesController;