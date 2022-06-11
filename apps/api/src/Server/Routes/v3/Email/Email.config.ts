import { Application, Router } from "express";
import CustomerModel from "../../../../Database/Models/Customers/Customer.model";
import EmailTemplateModel from "../../../../Database/Models/Email.model";
import { sendEmail } from "../../../../Email/Send";
import UseStyles from "../../../../Email/Templates/General/UseStyles";
import convertStringsCustomer from "../../../../Lib/Customers/customerStringHtmlC";
import { APIError, APISuccess } from "../../../../Lib/Response";
import EnsureAdmin from "../../../../Middlewares/EnsureAdmin";
import EmailTemplatesController from "./Email.controller";

export = EmailRouter;
class EmailRouter
{
    private server: Application;
    private router = Router();

    constructor(server: Application, version: string)
    {
        this.server = server;
        this.server.use(`/${version}/emails`, this.router);

        this.router.get("/templates", [
            EnsureAdmin(),
            EmailTemplatesController.list
        ]);

        this.router.get("/templates/:uid", [
            EnsureAdmin(),
            EmailTemplatesController.getByUid
        ]);

        this.router.patch("/templates/:id", [
            EnsureAdmin(),
            EmailTemplatesController.patch
        ]);

        this.router.post("/templates", [
            EnsureAdmin(),
            EmailTemplatesController.insert
        ]);

        this.router.post(`/send`, EnsureAdmin(), async (req, res) =>
        {
            // Filters
            const { to, cId, cStatus, subject, body } = req.body;

            // Validate
            if (!to)
                return APIError("Missing to")(res);

            if (!to && !cStatus)
                return APIError("Missing cStatus")(res);

            if (!subject)
                return APIError("Missing subject")(res);

            if (!body)
                return APIError("Missing body")(res);

            // Check if `to` is a email or `all`
            // If it is too all, then we check for all active customers
            if (to === "all")
            {
                let filter = {};
                if (cStatus && cStatus !== "all")
                    filter = { status: cStatus };

                // Get all customers
                const customers = await CustomerModel.find(filter);

                // Send email to all customers
                customers.forEach(async (customer) =>
                {
                    await sendEmail({
                        receiver: customer.personal.email,
                        subject,
                        body: {
                            body: await UseStyles(convertStringsCustomer(body, customer)),
                        },
                    });
                });

                return APISuccess(`Email sent to ${customers.length} customers`)(res);
            }

            if (cId)
            {
                // Assume it is a customer id
                const customer = await CustomerModel.findOne({ id: to });
                if (!customer)
                    return APIError("Customer not found")(res);

                await sendEmail({
                    receiver: customer.personal.email,
                    subject,
                    body: {
                        body: await UseStyles(convertStringsCustomer(body, customer)),
                    },
                });

                return APISuccess(`Email sent to ${to}`)(res);
            }

            await sendEmail({
                receiver: to,
                subject,
                body: {
                    body: await UseStyles(body),
                }
            });

            return APISuccess(`Email sent to ${to}`)(res);

        });
    }


}