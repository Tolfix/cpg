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
    AutocompleteInput,
    ArrayField,
} from 'react-admin';
import RenderFullName from "../../lib/RenderFullName";

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

const TagFilter = (props: any) =>
{
    return (
        <Filter {...props}>
            <SearchInput name='Search id' source="id" alwaysOn={true} />
            {/* Search for specific customer */}
            <ReferenceInput filterToQuery={(searchText: string) => ({
                "personal.first_name": searchText,
            })} perPage={100} label="Customer" source="customer_uid" reference="customers" alwaysOn={true}>
                <AutocompleteInput optionText={RenderFullName} />
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
                    render={RenderFullName}
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
            <Edit mutationMode="pessimistic" Button />
            {/* @ts-ignore */}
            <PDFButton />
            {/* <Edit mutationMode="pessimistic"Button redirect={""} /> */}
        </Datagrid>
    </List>
);