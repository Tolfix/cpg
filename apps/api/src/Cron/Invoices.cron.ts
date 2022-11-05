import { CronJob } from "cron";
import { Default_Language } from "../Config";
import GetText from "../Translation/GetText";
import
{
    cron_chargeStripePayment,
    cron_notifyInvoices,
    cron_notifyLateInvoicePaid,
    cron_remindCustomerLastDay
} from "./Methods/Invoices.cron.methods";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:cron:invoices");

export = function Cron_Invoices()
{
    // Every hour
    new CronJob("0 12 * * *", () =>
    {
        log.info(GetText(Default_Language).cron.txt_Invoice_Checking);

        cron_chargeStripePayment();
        cron_notifyInvoices();
        cron_notifyLateInvoicePaid();
        cron_remindCustomerLastDay();

    }, null, true, "Europe/Stockholm");
}