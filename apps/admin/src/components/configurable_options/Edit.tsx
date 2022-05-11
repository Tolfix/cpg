import { 
    ArrayInput,
    Edit, FormTab,
    NumberInput,
    ReferenceArrayInput, ReferenceInput, SelectArrayInput, SelectInput,
    SimpleFormIterator,
    TabbedForm,
    TextInput,
} from "react-admin";

export const Edit_configurable_options = (props: any) =>
(
    <Edit {...props}>
        <TabbedForm>
            <FormTab label="General">
                <TextInput label="Name" required={true} source="name" />
                <ReferenceArrayInput source="products_ids" reference="products">
                    <SelectArrayInput
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
    </Edit>
);