/*
    name: string;
    discount: number;
    valid_to: string | "permanent";
    uses: number | "unlimited";
    percentage: boolean;
    products_ids: Array<IProduct["id"]>;
*/
import { AutocompleteArrayInput, BooleanInput, Create, FormTab, NumberInput, ReferenceArrayInput, TabbedForm, TextInput } from "react-admin";

export default function CreatePromotionCode(props: any)
{
    return (
        <Create {...props}>
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

                            optionText="name"
                        />
                    </ReferenceArrayInput>
                </FormTab>
            </TabbedForm>
        </Create>
    )
}