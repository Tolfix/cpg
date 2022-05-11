import { List, Datagrid, TextField, EditButton, ReferenceArrayField, SingleFieldList, ChipField, Pagination } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;


export const configurable_options_List = (props: any) => (
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Id" source="id" />
            <ReferenceArrayField
                label="Product"
                reference="products"
                source="products"
            >
                <SingleFieldList>
                    <ChipField source="products_ids" />
                </SingleFieldList>
            </ReferenceArrayField>
            <EditButton />
        </Datagrid>
    </List>
);