import { BooleanField, Datagrid, EditButton, List, Pagination, RichTextField, TextField, } from "react-admin";

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const ListCategory = (props: any) =>
(
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Name" source="name" />
            <RichTextField label="Description" source="description"  />
            <BooleanField label="Private" source="private" />
            <EditButton />
        </Datagrid>
    </List>
);