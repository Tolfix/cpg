import { List, Datagrid, TextField, EditButton, Pagination, ShowButton, Filter, SearchInput, ReferenceInput, AutocompleteInput } from 'react-admin';
import RenderFullName from '../../lib/RenderFullName';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

const TagFilter = (props: any) =>
{
    return (
        <Filter {...props}>
            <SearchInput source="id" alwaysOn={true} />
            {/* Search for specific customer */}
            <ReferenceInput filterToQuery={(searchText: string) => ({
                "text": searchText,
            })} perPage={100} label="Customer" source="customer_uid" reference="customers" alwaysOn={true}>
                <AutocompleteInput fullWidth optionText={RenderFullName} />
            </ReferenceInput>
        </Filter>
    )
}

export const CustomerList = (props: any) => (
    <List {...props} pagination={<PostPagination />} filters={<TagFilter />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <TextField label="First name" source="personal.first_name" />
            <TextField label="Last name" source="personal.last_name" />
            <TextField label="Email" source="personal.email" />
            <TextField label="Company" source="billing.company" />
            <TextField label="Currency" source="currency" />
            <EditButton />
            <ShowButton />
        </Datagrid>
    </List>
);