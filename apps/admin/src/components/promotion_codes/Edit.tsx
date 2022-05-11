/*
    name: string;
    discount: number;
    valid_to: string | "permanent";
    uses: number | "unlimited";
    percentage: boolean;
    products_ids: Array<IProduct["id"]>;
*/
import { BooleanInput, Edit, FormTab, NumberInput, ReferenceArrayInput, SelectArrayInput, TabbedForm, TextInput } from "react-admin";

export default function EditPromotionCode(props: any)
{
    return (
        <Edit {...props}>
            <TabbedForm>
                <FormTab label="General">
                    <TextInput label="Name" source="name" />
                    <NumberInput label="Discount" source="discount" />
                    <TextInput label="Valid to" source="valid_to" defaultValue={'permanent'} />
                    <NumberInput label="Max uses" source="uses" defaultValue={'unlimited'} />
                    <BooleanInput label="Percentage" source="percentage" />
                    <ReferenceArrayInput source="products_ids" reference="products">
                        <SelectArrayInput
                            source="products"
                            label="Products"
                            allowEmpty={false}
                            optionText="name"
                        />
                    </ReferenceArrayInput>
                </FormTab>
            </TabbedForm>
        </Edit>
    )
}