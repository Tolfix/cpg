import { List, Datagrid, TextField, EditButton, ReferenceArrayField, SingleFieldList, ChipField, Pagination, ArrayField } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;


export const configurable_options_List = (props: any) =>
{
    return (
        <List {...props} pagination={<PostPagination />}>
            <Datagrid>
                <TextField label="Id" source="id" />
                <TextField label="name" source="name" />
                <ReferenceArrayField
                    label="Product"
                    reference="v2/products"
                    source="products_ids"
                >
                    <SingleFieldList>
                        <ChipField source="name" />
                    </SingleFieldList>
                </ReferenceArrayField>
                <ArrayField source="options">
                    <Datagrid>
                        <TextField source="name" />
                        <TextField source="price" />
                    </Datagrid>
                </ArrayField>
                <EditButton />
            </Datagrid>
        </List>
    );
}