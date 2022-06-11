import
{
    ArrayInput,
    AutocompleteArrayInput,
    Create, FormTab,
    NumberInput,
    ReferenceArrayInput,
    SimpleFormIterator,
    TabbedForm,
    TextInput,
} from "react-admin";

export const Create_configurable_options = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                <TextInput label="Name" isRequired={true} source="name" />
                {/* @ts-ignore */}
                <ReferenceArrayInput filterToQuery={searchText => ({
                    "name": searchText,
                })} perPage={100} source="products_ids" reference="v2/products">
                    <AutocompleteArrayInput
                        source="products"
                        label="Products"
                        isRequired={true}
                        optionText={(r: any) => `${r.name} - (${r.id})`}
                    />
                </ReferenceArrayInput>
                <ArrayInput isRequired={true} source="options">
                    <SimpleFormIterator>
                        <TextInput isRequired={true} label="Name" source="name" />
                        <NumberInput isRequired={true} label="Price" source="price" />
                    </SimpleFormIterator>
                </ArrayInput>
            </FormTab>
        </TabbedForm>
    </Create>
);