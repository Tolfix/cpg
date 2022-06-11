import
    {
        List, Datagrid,
        TextField,
        Pagination
    } from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export const ListEmailTemplates = (props: any) => (
    // @ts-ignore
    <List {...props} pagination={<PostPagination />}>
        <Datagrid>
            <TextField label="Id" source="id" />
        </Datagrid>
    </List>
);