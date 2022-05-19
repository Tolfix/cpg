import { currencyCodes } from "lib/Currencies";
import { ArrayInput, Create, FormTab, NumberInput, PasswordInput, SelectInput, SimpleFormIterator, TabbedForm, TextInput } from "react-admin";
//@ts-ignore
import MarkdownInput from 'ra-input-markdown';

export const CreateCustomer = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="Personal">
                <TextInput label="First name" isRequired={true} source="personal.first_name" />
                <TextInput label="Last name" isRequired={true} source="personal.last_name" />
                <TextInput label="Email" isRequired={true} source="personal.email" />
                <PasswordInput label="Password" isRequired={true} source="password" />
                <TextInput label="Phone number" isRequired={true} source="personal.phone" />
                <SelectInput label="Status" source="status" choices={[
                    { id: "active", name: "Active" },
                    { id: "inactive", name: "Inactive" },
                ]} />
                <MarkdownInput source="notes" />
            </FormTab>
            <FormTab label="Billing">
                <TextInput label="Company" isRequired={false} source="billing.company" />
                <TextInput label="VAT Number" isRequired={false} source="billing.company_vat" />
                <TextInput label="Country" isRequired={true} source="billing.country" />
                <TextInput label="Street" isRequired={true} source="billing.street01" />
                <TextInput label="Street 2" isRequired={false} source="billing.street02" />
                <TextInput label="City" isRequired={true} source="billing.city" />
                <TextInput label="State" isRequired={true} source="billing.state" />
                <TextInput label="Postcode" isRequired={true} source="billing.postcode" />
                <SelectInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />

                <ArrayInput isRequired={false} source="credits">
                    <SimpleFormIterator>
                        <NumberInput label="Amount" source="amount" />
                        <TextInput label="Notes" source="notes" />
                        <SelectInput label="Currency" source="currency" choices={currencyCodes.map(e =>
                        {
                            return { id: e, name: e };
                        })} />
                    </SimpleFormIterator>
                </ArrayInput>
            </FormTab>
        </TabbedForm>
    </Create>
);