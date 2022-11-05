import
{
    ArrayInput,
    BooleanInput,
    Create, FormTab,
    NumberInput,
    AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
    TextInput,
    ReferenceInput,
} from "react-admin";
//@ts-ignore
import { RichTextInput } from 'ra-input-rich-text';
import { currencyCodes } from "lib";

export const CreateProducts = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                <ReferenceInput perPage={100} source="category_uid" reference="categories">
                    <AutocompleteInput
                        source="categories"
                        label="Categories"
                        isRequired={true}
                        filterToQuery={searchText => ({
                            "name": searchText,
                        })}
                        fullWidth
                        optionText={(r: any) => `${r.name} - (${r.id})`}
                    />
                </ReferenceInput>
                <TextInput fullWidth isRequired={true} label="Name" source="name" />
                <RichTextInput isRequired={true} label="Description" source="description" />
                <BooleanInput label="Hidden" defaultValue={false} source="hidden" />
                <BooleanInput label="Special" defaultValue={false} source="special" />
            </FormTab>
            <FormTab label="Stock">
                <NumberInput min={0} isRequired={true} defaultValue={0} label="Stock" source="stock" />
                <BooleanInput label="Enable Stock" defaultValue={false} source="BStock" />
            </FormTab>
            <FormTab label="Payments">
                <NumberInput min={0} isRequired={true} label="Price" source="price" />
                <NumberInput min={0} isRequired={true} defaultValue={0} label="Setup fee" source="setup_fee" />
                <NumberInput min={0} max={100} isRequired={true} defaultValue={0} label="Tax Rate" source="tax_rate" />
                <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
                <AutocompleteInput isRequired={true} source="payment_type" choices={[
                    { id: "free", name: "free" },
                    { id: "one_time", name: "one_time" },
                    { id: "recurring", name: "recurring" },
                ]} />
                <AutocompleteInput isRequired={false} defaultValue={undefined} source="recurring_method" choices={[
                    { id: "monthly", name: "monthly" },
                    { id: "quarterly", name: "quarterly" },
                    { id: "semi_annually", name: "semi_annually" },
                    { id: "yearly", name: "yearly" },
                    { id: "biennially", name: "biennially" },
                    { id: "triennially", name: "triennially" },
                ]} />
            </FormTab>
            <FormTab label="Modules">

                <TextInput isRequired={false} label="Module Name" source="module_name" />

                <ArrayInput source="modules">
                    <SimpleFormIterator>
                        <TextInput source="name" />
                        <TextInput source="value" />
                    </SimpleFormIterator>
                </ArrayInput>

            </FormTab>
        </TabbedForm>
    </Create>
);