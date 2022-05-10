import { currencyCodes } from "lib/Currencies";
import { Create, FormTab, PasswordInput, SelectInput, TabbedForm, TextInput } from "react-admin";

export const CreateCustomer = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="Personal">
                <TextInput label="First name" required={true} source="personal.first_name" />
                <TextInput label="Last name" required={true} source="personal.last_name" />
                <TextInput label="Email" required={true} source="personal.email" />
                <PasswordInput label="Password" required={true} source="password" />
                <TextInput label="Phone number" required={true} source="personal.phone" />
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
                <SelectInput required={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
            </FormTab>
        </TabbedForm>
    </Create>
);