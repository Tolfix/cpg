import { List, Datagrid, TextField, EditButton, Pagination } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const CustomerList = (props: any) => (
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <TextField label="First name" source="personal.first_name" />
            <TextField label="Last name" source="personal.last_name" />
            <TextField label="Email" source="personal.email" />
            <TextField label="Phone" source="personal.phone" />
            <TextField label="Company" source="billing.company" />
            <TextField label="Vat" source="billing.company_vat" />
            <TextField label="Street" source="billing.street01" />
            <TextField label="Street 2" source="billing.street02" />
            <TextField label="Country" source="billing.country" />
            <TextField label="City" source="billing.city" />
            <TextField label="State" source="billing.state" />
            <TextField label="Postcode" source="billing.postcode" />
            <EditButton />
        </Datagrid>
    </List>
);