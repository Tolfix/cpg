import { PDFButton } from "./PDFButton";
import
{
    List, Datagrid,
    TextField, SingleFieldList,
    ChipField, BooleanField, ReferenceField,
    EditButton, ReferenceArrayField, FunctionField,
    Pagination,
    Filter,
    SearchInput,
    ReferenceInput,
    SelectInput,
    ArrayField
} from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

const TagFilter = (props: any) =>
{
    return (
        <Filter {...props}>
            <SearchInput name='Search id' source="id" alwaysOn={true} />
            {/* Search for specific customer */}
            <ReferenceInput label="Customer" source="customer_uid" reference="customers" alwaysOn={true}>
                <SelectInput optionText={
                    (record: { personal: { first_name: any; last_name: any; } }) =>
                        `${record.personal.first_name} ${record.personal.last_name}`} />
            </ReferenceInput>
        </Filter>
    )
}

export const InvoicesList = (props: any) => (
    // @ts-ignore
    <List {...props} pagination={<PostPagination />} filters={<TagFilter />}>
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
            <ArrayField source="items">
                <Datagrid>
                    <TextField source="notes" />
                    <TextField source="amount" />
                </Datagrid>
            </ArrayField>
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