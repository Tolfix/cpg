import { List, Pagination, Datagrid, TextField, BooleanField, ReferenceField, EditButton, NumberField, PaginationProps } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes & PaginationProps) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const ListProducts = (props: any) => (
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <TextField label="Name" source="name" />
            <TextField label="Description" source="description" />
            <ReferenceField label="Category" source="category_uid" reference="categories">
                <TextField source="name" />
            </ReferenceField>
            <BooleanField label="Enable stock" source="BStock" />
            <NumberField label="Stock" source="stock" />
            <BooleanField label="Special" source="special" />
            <BooleanField label="Hidden" source="hidden" />
            <NumberField label="Price" source="price" />
            <NumberField label="Type" source="payment_type" />
            <NumberField label="Recurring" source="recurring_method" />
            <NumberField label="Setup Fee" source="setup_fee" />
            <EditButton />
        </Datagrid>
    </List>
);