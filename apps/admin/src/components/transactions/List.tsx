import { List, Datagrid, TextField, ReferenceField, EditButton, FunctionField, Pagination, PaginationProps, SearchInput, Filter, ReferenceInput, SelectInput } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes & PaginationProps) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

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

export const ListTransactions = (props: any) => (
    <List {...props} pagination={<PostPagination />} filters={<TagFilter />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <ReferenceField label="Invoice id" source="invoice_uid" reference="invoices">
                <FunctionField
                    // @ts-ignore
                    render={(record) =>
                        `${record.id}`}
                    source="id"
                />
            </ReferenceField>
            <TextField label="Statement" source="statement" />
            <ReferenceField label="Customer" source="customer_uid" reference="customers">
                <FunctionField
                    // @ts-ignore
                    render={(record) =>
                        `${record.personal.first_name} ${record.personal.last_name}`}
                    source="personal.first_name"
                />
            </ReferenceField>
            <TextField label="Payed" source="date" />
            <TextField label="Amount" source="amount" />
            <TextField label="Currency" source="currency" />
            <TextField label="Fees" source="fees" />
            <TextField label="Method" source="payment_method" />
            <EditButton />
        </Datagrid>
    </List>
);