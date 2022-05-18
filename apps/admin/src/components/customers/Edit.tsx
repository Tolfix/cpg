import { currencyCodes } from "lib/Currencies";
import { Edit, FormTab, PasswordInput, AutocompleteInput, TabbedForm, TextInput, SelectInput, ReferenceArrayInput, ArrayInput, SimpleFormIterator, NumberInput } from "react-admin";
//@ts-ignore
import MarkdownInput from 'ra-input-markdown';

export const EditCustomer = (props: any) =>
{
    const t = props;
    const id = t.id;
    return (
        <Edit mutationMode="pessimistic" {...props}>
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
                    <AutocompleteInput required={true} source="currency" choices={currencyCodes.map(e =>
                    {
                        return { id: e, name: e };
                    })} />

                    <ArrayInput required={false} source="credits">
                        <SimpleFormIterator>
                            <NumberInput label="Amount" source="amount" />
                            <TextInput label="Notes" source="notes" />
                            <SelectInput label="Currency" source="currency" choices={currencyCodes.map(e =>
                            {
                                return { id: e, name: e };
                            })} />

                            {/* Get invoices linked to this customer */}
                            <ReferenceArrayInput label="Invoices" reference="invoices" source="invoice_id">
                                {/* Filter invoices that is not linked with customer */}
                                <AutocompleteInput
                                    source="invoice_id"
                                    label="Invoice"
                                    required={true}
                                    allowEmpty={false}
                                    optionText="id"
                                    // Check if the invoice is linked to this customer
                                    parse={(value: any) =>
                                    {
                                        console.log(value);
                                        // return value.customer_id === props.record.id ? value : null;
                                    }}
                                    optionValue="id"
                                />
                            </ReferenceArrayInput>


                        </SimpleFormIterator>
                    </ArrayInput>
                </FormTab>
            </TabbedForm>
        </Edit>
    )
};