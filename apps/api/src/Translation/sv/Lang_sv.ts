import { Request } from "express";
import { ICustomer } from "interfaces/Customer.interface";
import { IGetText } from "interfaces/Lang/GetText.interface";
import { IOrder } from "interfaces/Orders.interface";

export = <IGetText>{
    txt_Uid_Description: "Unique ID for object, generated by the system.",
    txt_ApiError_default: (req: Request) => `Förfrågningen ${req.originalUrl} hittades inte på den här servern.`,
    txt_Api_Listing: `Servern lyssnar på port`,

    cron: {
        txt_Invoice_Checking: "Kollar invoices..",
        txt_Invoice_Found_Notify: (amount: number) => `Hittade ${amount} fakturor att notifiera`,
        txt_Invoice_Found_Sending_Email: (customer: ICustomer) => `Skickar email till ${customer.personal.email}`,
        txt_Order_Checking: (id: IOrder["id"]) => `Kollar in order id ${id}`,
        txt_Orders_Checking: "Kollar orders..",
    },
    database: {
        txt_Database_Error_Lost_Connection: "Förlorade koplling till databas, stänger ner.",
        txt_Database_Error_default: "Ett problem uppstod med databasen.",
        txt_Database_Opened: "Databas öppen.",
        txt_Model_Created: (model: string, id: any) => `Skapade ${model} med id/uid ${id}`,
    },
    graphql: {
        txt_Schemas_Loading: "Laddar schemas..",
        txt_Schemas_Adding: (schema: string) => `Lägger till schema/query ${schema}`,
        txt_Resolver_Checking_Admin: (resolver: string) => `Kollar om användare är admin på resolver ${resolver}`,
        txt_Resolver_Checking_User: (resolver: string) => `Kollar om användare är användare på resolver ${resolver}`,
        txt_Apollo_Starting: "Startar GraphQL servern på",
    },
    plugins: {
        txt_Plugin_Loading: "Laddar plugins..",
        txt_Plugin_Installed: (plugin: string) => `Installerade plugin ${plugin}`,
        txt_Plugin_Loaded: (plugin: string) => `Laddade upp plugin ${plugin}`,
    },
    paypal: {
        txt_Paypal_Created_Transaction_From_Invoice: (t, i) => `Skapade transaction ${t.uid} från faktura ${i.uid}`,
        txt_Paypal_Creating_Payment_For_Invoice: (i) => `Skapar betalning för faktura ${i.uid}`,
    },
    invoice: {
        txt_Invoice: "Faktura",
        txt_Date: "Datum",
        txt_DueDate: "Förfallingsdatum",
        txt_Number: "Nummer",
        txt_Price: "Pris",
        txt_ProductTotal: "Produkt totalt",
        txt_Products: "Produkter",
        txt_Quantity: "Antal",
        txt_SubTotal: "Subtotal",
        txt_Total: "Totalt",
    }
};