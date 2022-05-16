import { List, Datagrid, TextField, EditButton, Pagination, ShowButton } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const CustomerList = (props: any) => (
    <List {...props} pagination={<PostPagination />}>
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