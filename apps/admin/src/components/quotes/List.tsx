/*
    id: number;
    customer_uid: ICustomer["uid"];
    items: IQuoteItem[];
    invoice_uid?: IInvoice["id"];
    promotion_codes: IPromotionsCodes["id"][] | [];
    due_date: string;
    memo: string;
    payment_method: keyof IPayments;
    notified: boolean;
    created_invoice: boolean;
    tax_rate: number;
    currency: TPaymentCurrency;
    accepted: boolean;
    declined: boolean;
*/
import { BooleanField, Datagrid, EditButton, FunctionField, List, Pagination, ReferenceField, TextField } from "react-admin";
import RenderFullName from "../../lib/RenderFullName";

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;


export default function ListQuotes(props: any)
{
    return (
        <List {...props} pagination={<PostPagination />}>
            <Datagrid>
                <TextField label="Id" source="id" />
                <ReferenceField label="Customer" source="customer_uid" reference="customers">
                    <FunctionField
                        // @ts-ignore
                        render={RenderFullName}
                        source="personal.first_name"
                    />
                </ReferenceField>
                <BooleanField label="Created invoice" source="created_invoice" />
                <ReferenceField label="Invoice id" source="invoice_uid" reference="invoices">
                    <FunctionField
                        // @ts-ignore
                        render={(record) =>
                            `${record.id}`}
                        source="id"
                    />
                </ReferenceField>
                <TextField label="Due date" source="due_date" />
                <TextField label="Memo" source="memo" />
                <TextField label="Payment method" source="payment_method" />
                <TextField label="Notified" source="notified" />
                <TextField label="Tax rate" source="tax_rate" />
                <TextField label="Currency" source="currency" />
                <BooleanField label="Accepted" source="accepted" />
                <BooleanField label="Declined" source="declined" />
                <EditButton />
            </Datagrid>
        </List>
    )
}