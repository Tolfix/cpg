/*
    id: number;
    name: string;
    discount: number;
    valid_to: string | "permanent";
    uses: number | "unlimited";
    percentage: boolean;
    products_ids: Array<IProduct["id"]>;
*/
import
{
    List, Datagrid,
    TextField, SingleFieldList,
    ChipField, BooleanField,
    EditButton, ReferenceArrayField,
    Pagination
} from 'react-admin';

const PostPagination = (props: JSX.IntrinsicAttributes) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />;

export default function ListPromotionCodes(props: any)
{
    return (
        // @ts-ignore
        <List {...props} pagination={<PostPagination />}>
            <Datagrid>
                <TextField label="Id" source="id" />
                <TextField label="Name" source="name" />
                <TextField label="Discount" source="discount" />
                <TextField label="Valid to" source="valid_to" />
                <TextField label="Uses" source="uses" />
                <BooleanField label="Percentage" source="percentage" />
                <ReferenceArrayField
                    label="Products"
                    reference="products"
                    source="products_ids"
                >
                    <SingleFieldList>
                        <ChipField source="name" />
                    </SingleFieldList>
                </ReferenceArrayField>
                <EditButton />
            </Datagrid>
        </List>
    )
}
