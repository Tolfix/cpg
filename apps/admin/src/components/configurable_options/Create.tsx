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
                <TextInput label="Name" required={true} source="name" />
                {/* @ts-ignore */}
                <ReferenceArrayInput filterToQuery={searchText => ({
                    "name": searchText,
                })} perPage={100} source="products_ids" reference="products">
                    <AutocompleteArrayInput
                        source="products"
                        label="Products"
                        required={true}
                        allowEmpty={false}
                        optionText="name"
                    />
                </ReferenceArrayInput>
                <ArrayInput required={true} source="options">
                    <SimpleFormIterator>
                        <TextInput required={true} label="Name" source="name" />
                        <NumberInput required={true} label="Price" source="price" />
                    </SimpleFormIterator>
                </ArrayInput>
            </FormTab>
        </TabbedForm>
    </Create>
);