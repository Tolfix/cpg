import { currencyCodes } from "lib/Currencies";
import { Edit, FormTab, PasswordInput, AutocompleteInput, TabbedForm, TextInput, SelectInput, ArrayInput, SimpleFormIterator, NumberInput, ReferenceInput, useEditController } from "react-admin";
//@ts-ignore
import MarkdownInput from 'ra-input-markdown';

export const EditCustomer = (props: any) =>
{
    const controllerProps = useEditController(props);
    // get id
    const id = props.id;

    return (
        <Edit value={controllerProps} mutationMode="pessimistic" {...props}>
            <TabbedForm>
                <FormTab label="Personal">
                    <TextInput label="First name" required={true} source="personal.first_name" />
                    <TextInput label="Last name" required={true} source="personal.last_name" />
                    <TextInput label="Email" required={true} source="personal.email" />
                    <PasswordInput label="Password" required={true} source="password" />
                    <TextInput label="Phone number" required={true} source="personal.phone" />
                    <SelectInput label="Status" source="status" choices={[
                        { id: "active", name: "Active" },
                        { id: "inactive", name: "Inactive" },
                    ]} />
                    <MarkdownInput source="notes" />
                </FormTab>
                <FormTab label="Billing">
                    <TextInput label="Company" required={false} source="billing.company" />
                    <TextInput label="VAT Number" required={false} source="billing.company_vat" />
                    <TextInput label="Country" required={true} source="billing.country" />
                    <TextInput label="Street" required={true} source="billing.street01" />
                    <TextInput label="Street 2" required={false} source="billing.street02" />
                    <TextInput label="City" required={true} source="billing.city" />
                    <TextInput label="State" required={true} source="billing.state" />
                    <TextInput label="Postcode" required={true} source="billing.postcode" />
                    <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                    {
                        return { id: e, name: e };
                    })} />

                    <ArrayInput required={false} source="credits">
                        <SimpleFormIterator>
                            <NumberInput label="Amount" source="amount" />
                            <TextInput label="Notes" source="notes" />
                            <AutocompleteInput label="Currency" source="currency" choices={currencyCodes.map(e =>
                            {
                                return { id: e, name: e };
                            })} />
                            <ReferenceInput filterToQuery={(searchText: any) => ({
                                "id": searchText,
                                customer_uid: id,
                            })} perPage={100} allowEmpty label="Invoice id" source="invoice_id" reference="invoices">
                                <AutocompleteInput
                                    isRequired={false}
                                    optionText="id"
                                />
                            </ReferenceInput>


                        </SimpleFormIterator>
                    </ArrayInput>
                </FormTab>
            </TabbedForm>
        </Edit>
    )
};