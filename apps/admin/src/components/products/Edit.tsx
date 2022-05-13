import
{
    ArrayInput,
    BooleanInput,
    Edit, FormTab,
    NumberInput,
    ReferenceInput, AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
    TextInput,
} from "react-admin";
//@ts-ignore
import MarkdownInput from 'ra-input-markdown';
import { currencyCodes } from "lib/Currencies";

export const EditProducts = (props: any) =>
(
    <Edit {...props}>
        <TabbedForm>
            <FormTab label="General">
                {/* @ts-ignore */}
                <ReferenceInput filterToQuery={(searchText: string) => ({
                    "name": searchText,
                })} perPage={100} source="category_uid" reference="categories">
                    <AutocompleteInput
                        source="categories"
                        label="Categories"
                        required={true}
                        allowEmpty={false}
                        optionText="name"
                    />
                </ReferenceInput>
                <TextInput required={true} label="Name" source="name" />
                <MarkdownInput required={true} label="Description" source="description" />
                <BooleanInput label="Hidden" defaultValue={false} source="hidden" />
                <BooleanInput label="Special" defaultValue={false} source="special" />
            </FormTab>
            <FormTab label="Stock">
                <NumberInput min={0} required={true} defaultValue={0} label="Stock" source="stock" />
                <BooleanInput label="Enable Stock" defaultValue={false} source="BStock" />
            </FormTab>
            <FormTab label="Payments">
                <NumberInput min={0} required={true} label="Price" source="price" />
                <NumberInput min={0} required={true} label="Setup fee" source="setup_fee" />
                <NumberInput min={0} max={100} required={true} defaultValue={0} label="Tax Rate" source="tax_rate" />
                <AutocompleteInput required={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
                <AutocompleteInput required={true} source="payment_type" choices={[
                    { id: "free", name: "free" },
                    { id: "one_time", name: "one_time" },
                    { id: "recurring", name: "recurring" },
                ]} />
                <AutocompleteInput required={false} source="recurring_method" choices={[
                    { id: "monthly", name: "monthly" },
                    { id: "quarterly", name: "quarterly" },
                    { id: "semi_annually", name: "semi_annually" },
                    { id: "yearly", name: "yearly" },
                    { id: "biennially", name: "biennially" },
                    { id: "triennially", name: "triennially" },
                ]} />
            </FormTab>
            <FormTab label="Modules">

                <TextInput required={false} label="Module Name" source="module_name" />

                <ArrayInput source="modules">
                    <SimpleFormIterator>
                        <TextInput source="name" />
                        <TextInput source="value" />
                    </SimpleFormIterator>
                </ArrayInput>

            </FormTab>
        </TabbedForm>
    </Edit>
);