import { currencyCodes } from "lib/Currencies";
import { DateInput, Edit, FormDataConsumer, FormTab, NumberInput, ReferenceInput, AutocompleteInput, TabbedForm, TextInput } from "react-admin";

export const EditTrans = (props: any) =>
(
    <Edit {...props}>
        <TabbedForm>
            <FormTab label="Info">
                <AutocompleteInput required={true} source="statement" choices={[
                    { id: "income", name: "income" },
                    { id: "expense", name: "expense" },
                ]} />
                <FormDataConsumer>
                    {({ formData }) => formData.statement === "income" &&
                        <>
                            <ReferenceInput filterToQuery={(searchText: string) => ({
                                "personal.first_name": searchText,
                            })} perPage={100} source="customer_uid" reference="customers">
                                <AutocompleteInput
                                    source="customers"
                                    label="Customers"
                                    required={formData.statement === "income"}
                                    allowEmpty={false}
                                    optionText={
                                        (record: { personal: { first_name: any; last_name: any; } }) =>
                                            `${record.personal.first_name} ${record.personal.last_name}`}
                                />
                            </ReferenceInput>
                            <div>
                                <ReferenceInput filterToQuery={(searchText: string) => ({
                                    "id": searchText,
                                })} perPage={100} source="invoice_uid"
                                    reference="invoices">
                                    <AutocompleteInput
                                        required={formData.statement === "income"}
                                        optionText={(record) => record?.id?.toString() ?? ""} />
                                </ReferenceInput>
                            </div>
                        </>
                    }
                </FormDataConsumer>
                <FormDataConsumer>
                    {({ formData }) => formData.statement === "expense" &&
                        <>
                            <div>
                                <TextInput
                                    required={formData.statement === "expense"}
                                    source="expense_information.invoice_id" label="Invoice id" />
                            </div>
                            <div>
                                <TextInput
                                    required={formData.statement === "expense"}
                                    source="expense_information.company" label="Company" />
                            </div>
                            <div>
                                <TextInput
                                    required={formData.statement === "expense"} source="expense_information.description" label="Description" />
                            </div>
                            <div>
                                <TextInput
                                    required={formData.statement === "expense"} source="expense_information.notes" label="Notes" />
                            </div>
                        </>
                    }
                </FormDataConsumer>
                <NumberInput required={true} label="Amount" source="amount" />
                <AutocompleteInput required={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
                <NumberInput required={true} label="Fees" source="fees" />
                <DateInput label="Payed at" source="date" defaultValue={new Date().toLocaleDateString()} />
                <AutocompleteInput required={true} source="payment_method" choices={[
                    { id: "none", name: "none" },
                    { id: "manual", name: "manual" },
                    { id: "bank", name: "bank" },
                    { id: "paypal", name: "paypal" },
                    { id: "credit_card", name: "credit_card" },
                    { id: "swish", name: "swish" },
                ]} />
            </FormTab>
        </TabbedForm>
    </Edit>
);