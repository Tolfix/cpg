import { List, Datagrid, TextField, EditButton, ReferenceField, FunctionField, ReferenceArrayField, SingleFieldList, ChipField, Pagination, ArrayField } from 'react-admin';
import RenderFullName from '../../lib/RenderFullName';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const OrderList = (props: any) => (
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <ReferenceField label="Customer" source="customer_uid" reference="v2/customers">
                <FunctionField
                    render={RenderFullName}
                    source="personal.first_name"
                />
            </ReferenceField>
            <ArrayField
                label="Product"
                source="products"
            >
                <Datagrid>
                    <ReferenceField
                        source="product_id"
                        reference="v2/products"
                    >
                        <ChipField source="name" />
                    </ReferenceField>
                </Datagrid>
            </ArrayField>
            <TextField label="Method" source="payment_method" />
            <TextField label="Status" source="order_status" />
            <TextField label="Billing Type" source="billing_type" />
            <TextField label="Cycle" source="billing_cycle" />
            <TextField label="Last" source="dates.last_recycle" />
            <TextField label="Next" source="dates.next_recycle" />
            <ReferenceArrayField
                label="Invoices"
                reference="v2/invoices"
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