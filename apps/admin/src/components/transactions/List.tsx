import { List, Datagrid, TextField, ReferenceField, EditButton, FunctionField, Pagination, PaginationProps, SearchInput, Filter, ReferenceInput, AutocompleteInput } from 'react-admin';
import RenderFullName from '../../lib/RenderFullName';

const PostPagination = (props: JSX.IntrinsicAttributes & PaginationProps) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

const TagFilter = (props: any) =>
{
    return (
        <Filter {...props}>
            <SearchInput source="id" alwaysOn={true} />
            {/* Search for specific customer */}
            <ReferenceInput filterToQuery={(searchText: string) => ({
                "text": searchText,
            })} perPage={100} label="Customer" source="customer_uid" reference="customers" alwaysOn={true} allowEmpty>
                <AutocompleteInput optionText={RenderFullName} />
            </ReferenceInput>
        </Filter>
    )
}

export const ListTransactions = (props: any) =>
{
    return (
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
    )
};