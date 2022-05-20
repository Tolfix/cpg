import { currencyCodes } from "lib/Currencies";
import { ArrayInput, Create, FormTab, NumberInput, PasswordInput, SelectInput, SimpleFormIterator, TabbedForm, TextInput } from "react-admin";
//@ts-ignore
import { RichTextInput } from 'ra-input-rich-text';

export const CreateCustomer = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="Personal">
                <TextInput fullWidth label="First name" isRequired={true} source="personal.first_name" />
                <TextInput fullWidth label="Last name" isRequired={true} source="personal.last_name" />
                <TextInput fullWidth label="Email" isRequired={true} source="personal.email" />
                <PasswordInput fullWidth label="Password" isRequired={true} source="password" />
                <TextInput fullWidth label="Phone number" isRequired={true} source="personal.phone" />
                <SelectInput label="Status" source="status" choices={[
                    { id: "active", name: "Active" },
                    { id: "inactive", name: "Inactive" },
                ]} />
                <RichTextInput source="notes" />
            </FormTab>
            <FormTab label="Billing">
                <TextInput fullWidth label="Company" isRequired={false} source="billing.company" />
                <TextInput fullWidth label="VAT Number" isRequired={false} source="billing.company_vat" />
                <TextInput fullWidth label="Country" isRequired={true} source="billing.country" />
                <TextInput fullWidth label="Street" isRequired={true} source="billing.street01" />
                <TextInput fullWidth label="Street 2" isRequired={false} source="billing.street02" />
                <TextInput fullWidth label="City" isRequired={true} source="billing.city" />
                <TextInput fullWidth label="State" isRequired={true} source="billing.state" />
                <TextInput fullWidth label="Postcode" isRequired={true} source="billing.postcode" />
                <SelectInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} fullWidth />

                <ArrayInput isRequired={false} source="credits">
                    <SimpleFormIterator>
                        <NumberInput fullWidth label="Amount" source="amount" />
                        <TextInput fullWidth label="Notes" source="notes" />
                        <SelectInput fullWidth label="Currency" source="currency" choices={currencyCodes.map(e =>
                        {
                            return { id: e, name: e };
                        })} />
                    </SimpleFormIterator>
                </ArrayInput>
            </FormTab>
        </TabbedForm>
    </Create>
);