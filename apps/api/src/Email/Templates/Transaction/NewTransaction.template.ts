import { stripIndents } from "common-tags";
import { Company_Email, CPG_Customer_Panel_Domain } from "../../../Config";
import { ICustomer } from "interfaces/Customer.interface";
import { ITransactions } from "interfaces/Transactions.interface";
import PrintCompanyInformation from "../../../Lib/Company/PrintCompanyInformation";
import getFullName from "../../../Lib/Customers/getFullName";
import { GetCurrencySymbol } from "lib";
import UseStyles from "../General/UseStyles";

export = async (t: ITransactions, c: ICustomer, charged = false) => UseStyles(stripIndents`
<div>
    <h1>
        Transaction Statement
    </h1>
    ${charged ? `<p>
        <strong>This was automatically paid for you. If you have any questions, please contact us at ${await Company_Email()}</strong>
    </p>` : ``}
    <p>
        <strong>Date:</strong> ${t.date}
    </p>
    <p>
        <strong>Customer:</strong> ${getFullName(c)}
    </p>
    </p>
        <strong>Invoice ID:</strong> ${t.invoice_uid}
    </p>
    <p>
        ${await PrintCompanyInformation()}
    </p>
    <p>
        <strong>Amount:<strong> ${t.amount.toFixed(2)} ${GetCurrencySymbol(t.currency)}
    </p>
    ${CPG_Customer_Panel_Domain ? `
        <p>
            <a href="${CPG_Customer_Panel_Domain}/transactions?uid=${t.uid}">View Transaction</a>
        </p>
    ` : ''}
</div>
`);