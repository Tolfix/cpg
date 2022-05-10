import { PDFButton } from "./PDFButton";
import
{
    List, Datagrid,
    TextField, SingleFieldList,
    ChipField, BooleanField, ReferenceField,
    EditButton, ReferenceArrayField, FunctionField,
    Pagination
} from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const InvoicesList = (props: any) => (
    // @ts-ignore
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <ReferenceField label="Customer" source="customer_uid" reference="customers">
                <FunctionField
                    // @ts-ignore
                    render={(record) =>
                        `${record.personal.first_name} ${record.personal.last_name}`}
                    source="personal.first_name"
                />
            </ReferenceField>
            <TextField label="Due Date" source="dates.due_date" />
            <TextField label="Amount" source="amount" />
            <TextField label="Currency" source="currency" />
            <TextField label="Payment" source="payment_method" />
            <TextField label="Status" source="status" />
            <TextField label="Tax Rate" source="tax_rate" />
            <BooleanField label="Paid" source="paid" />
            <BooleanField label="Notified" source="notified" />
            <ReferenceArrayField
                label="Transactions"
                reference="transactions"
                source="transactions"
            >
                <SingleFieldList>
                    <ChipField source="id" />
                </SingleFieldList>
            </ReferenceArrayField>
            <EditButton />
            {/* @ts-ignore */}
            <PDFButton />
            {/* <EditButton redirect={""} /> */}
        </Datagrid>
    </List>
);