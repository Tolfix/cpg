import { currencyCodes } from "lib/Currencies";
import
{
    ArrayInput,
    Edit, FormTab,
    NumberInput,
    ReferenceArrayInput, ReferenceInput, AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
    TextInput,
    FormDataConsumer,
} from "react-admin";
import RenderFullName from "../../lib/RenderFullName";

export const EditOrders = (props: any) =>
(
    <Edit {...props}>
        <TabbedForm>
            <FormTab label="General">
                <ReferenceInput filterToQuery={searchText => ({
                    "personal.first_name": searchText,
                })} perPage={100} source="customer_uid" reference="customers">
                    <AutocompleteInput
                        source="customers"
                        label="Customers"
                        required={true}
                        // allowEmpty={false}
                        optionText={RenderFullName}
                    />
                </ReferenceInput>
                <ArrayInput source="products">
                    <SimpleFormIterator>
                        <ReferenceInput source="product_id" reference="products">
                            <AutocompleteInput
                                source="products"
                                label="Products"
                                required={true}
                                allowEmpty={false}
                                optionText="name"
                            />
                        </ReferenceInput>
                        <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                    </SimpleFormIterator>
                </ArrayInput>

                <ArrayInput source="items">
                    <SimpleFormIterator>
                        <TextInput name="note" label="Note" source="note" />
                        <NumberInput label="Amount" source="amount" />
                        <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                    </SimpleFormIterator>
                </ArrayInput>

                <FormDataConsumer>
                    {({ formData }) => formData.items && (
                        <NumberInput label="Tax rate" source="tax_rate" />
                    )}
                </FormDataConsumer>

                <AutocompleteInput required={true} source="order_status" choices={[
                    { id: "active", name: "active" },
                    { id: "pending", name: "pending" },
                    { id: "fruad", name: "fruad" },
                    { id: "cancelled", name: "cancelled" },
                ]} />
            </FormTab>
            <FormTab label="Payments">
                <AutocompleteInput required={true} source="payment_method" choices={[
                    { id: "none", name: "none" },
                    { id: "manual", name: "manual" },
                    { id: "bank", name: "bank" },
                    { id: "paypal", name: "paypal" },
                    { id: "credit_card", name: "credit_card" },
                    { id: "swish", name: "swish" },
                ]} />
                <AutocompleteInput required={true} source="billing_type" choices={[
                    { id: "free", name: "free" },
                    { id: "one_time", name: "one_time" },
                    { id: "recurring", name: "recurring" },
                ]} />
                <FormDataConsumer>
                    {({ formData }) => formData.billing_type === "recurring" && (
                        <AutocompleteInput required={false} source="billing_cycle" choices={[
                            { id: "monthly", name: "monthly" },
                            { id: "quarterly", name: "quarterly" },
                            { id: "semi_annually", name: "semi_annually" },
                            { id: "yearly", name: "yearly" },
                            { id: "biennially", name: "biennially" },
                            { id: "triennially", name: "triennially" },
                        ]} />
                    )}
                </FormDataConsumer>
                <AutocompleteInput required={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
            </FormTab>
            <FormTab label="Invoices">

                <ReferenceArrayInput source="invoices" reference="invoices">
                    <AutocompleteInput optionText={(record) => record?.id?.toString() ?? ""} />
                </ReferenceArrayInput>

            </FormTab>
        </TabbedForm>
    </Edit >
);