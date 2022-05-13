/*
    name: string;
    discount: number;
    valid_to: string | "permanent";
    uses: number | "unlimited";
    percentage: boolean;
    products_ids: Array<IProduct["id"]>;
*/
import { AutocompleteArrayInput, BooleanInput, Edit, FormTab, NumberInput, ReferenceArrayInput, TabbedForm, TextInput } from "react-admin";

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
                    <ReferenceArrayInput filterToQuery={(searchText: string) => ({
                        "name": searchText,
                    })} perPage={100} source="products_ids" reference="products">
                        <AutocompleteArrayInput
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