import { currencyCodes } from "lib/Currencies";
import { Create, DateInput, FormTab, NumberInput, ReferenceArrayInput, SelectArrayInput, SelectInput, TabbedForm } from "react-admin";

export const CreateTransactions = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="Info">
                <SelectInput required={true} source="statement" choices={[
                    { id: "income", name: "income" },
                    { id: "expense", name: "expense" },
                ]} />
                <ReferenceArrayInput source="customer_uid" reference="customers">
                    <SelectInput
                        source="customers"
                        label="Customers"
                        required={true}
                        allowEmpty={false}
                        optionText={
                            (record: { personal: { first_name: any; last_name: any; } }) =>
                                `${record.personal.first_name} ${record.personal.last_name}`}
                    />
                </ReferenceArrayInput>
                <ReferenceArrayInput source="invoice_uid" reference="invoices">
                    <SelectInput optionText={(record) => record.id.toString()} />
                </ReferenceArrayInput>
                <NumberInput required={true} label="Amount" source="amount" />
                <SelectInput required={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
                <NumberInput required={true} label="Fees" source="fees" />
                <DateInput label="Payed at" source="date" defaultValue={new Date().toLocaleDateString()} />
                <SelectInput required={true} source="payment_method" choices={[
                    { id: "none", name: "none" },
                    { id: "manual", name: "manual" },
                    { id: "bank", name: "bank" },
                    { id: "paypal", name: "paypal" },
                    { id: "credit_card", name: "credit_card" },
                    { id: "swish", name: "swish" },
                ]} />
            </FormTab>
        </TabbedForm>
    </Create>
);