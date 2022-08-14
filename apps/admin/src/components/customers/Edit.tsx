import { currencyCodes } from "lib";
import { Edit, FormTab, PasswordInput, AutocompleteInput, TabbedForm, TextInput, SelectInput, ArrayInput, SimpleFormIterator, NumberInput, ReferenceInput, useEditController } from "react-admin";
//@ts-ignore
import { RichTextInput } from 'ra-input-rich-text';

export const EditCustomer = (props: any) =>
{
    const controllerProps = useEditController(props);
    // get id
    const id = props.id;

    return (
        <Edit value={controllerProps} mutationMode="pessimistic" {...props}>
            <TabbedForm>
                <FormTab label="Personal">
                    <TextInput fullWidth label="First name" required={true} source="personal.first_name" />
                    <TextInput fullWidth label="Last name" required={true} source="personal.last_name" />
                    <TextInput fullWidth label="Email" required={true} source="personal.email" />
                    <PasswordInput fullWidth label="Password" required={true} source="password" />
                    <TextInput fullWidth label="Phone number" required={true} source="personal.phone" />
                    <SelectInput label="Status" source="status" choices={[
                        { id: "active", name: "Active" },
                        { id: "inactive", name: "Inactive" },
                    ]} />
                    <RichTextInput source="notes" />
                </FormTab>
                <FormTab label="Billing">
                    <TextInput fullWidth label="Company" required={false} source="billing.company" />
                    <TextInput fullWidth label="VAT Number" required={false} source="billing.company_vat" />
                    <TextInput fullWidth label="Country" required={true} source="billing.country" />
                    <TextInput fullWidth label="Street" required={true} source="billing.street01" />
                    <TextInput fullWidth label="Street 2" required={false} source="billing.street02" />
                    <TextInput fullWidth label="City" required={true} source="billing.city" />
                    <TextInput fullWidth label="State" required={true} source="billing.state" />
                    <TextInput fullWidth label="Postcode" required={true} source="billing.postcode" />
                    <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                    {
                        return { id: e, name: e };
                    })} fullWidth />

                    <ArrayInput required={false} source="credits">
                        <SimpleFormIterator>
                            <NumberInput fullWidth label="Amount" source="amount" />
                            <TextInput fullWidth label="Notes" source="notes" />
                            <AutocompleteInput label="Currency" source="currency" choices={currencyCodes.map(e =>
                            {
                                return { id: e, name: e };
                            })} fullWidth />
                            <ReferenceInput filterToQuery={(searchText: any) => ({
                                "id": searchText,
                                customer_uid: id,
                            })} perPage={100} allowEmpty label="Invoice id" source="invoice_id" reference="invoices">
                                <AutocompleteInput
                                    isRequired={false}
                                    optionText="id"
                                    fullWidth
                                />
                            </ReferenceInput>


                        </SimpleFormIterator>
                    </ArrayInput>
                </FormTab>
            </TabbedForm>
        </Edit>
    )
};