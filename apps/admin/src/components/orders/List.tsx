import { List, Datagrid, TextField, EditButton, ReferenceField, FunctionField, DateField, ReferenceArrayField, SingleFieldList, ChipField, Pagination } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const OrderList = (props: any) => (
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
            <ReferenceArrayField
                label="Product"
                reference="products"
                source="product_id"
            >
                <SingleFieldList>
                    <ChipField source="id" />
                </SingleFieldList>
            </ReferenceArrayField>
            <TextField label="Method" source="payment_method" />
            <TextField label="Status" source="order_status" />
            <TextField label="Billing Type" source="billing_type" />
            <TextField label="Cycle" source="billing_cycle" />
            <TextField label="Price Override" source="price_override" />
            <DateField label="Last" source="dates.last_recycle" />
            <DateField label="Next" source="dates.next_recycle" />
            <ReferenceArrayField
                label="Invoices"
                reference="invoices"
                source="invoices"
            >
                <SingleFieldList>
                    <ChipField source="id" />
                </SingleFieldList>
            </ReferenceArrayField>
            <EditButton />
        </Datagrid>
    </List>
);