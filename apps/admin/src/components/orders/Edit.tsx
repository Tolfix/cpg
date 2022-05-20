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
    AutocompleteArrayInput,
} from "react-admin";
import RenderFullName from "../../lib/RenderFullName";

export const EditOrders = (props: any) =>
(
    <Edit mutationMode="pessimistic" {...props}>
        <TabbedForm>
            <FormTab label="General">
                <ReferenceInput filterToQuery={(searchText: any) => ({
                    "personal.first_name": searchText,
                })} perPage={100} source="customer_uid" reference="customers">
                    <AutocompleteInput
                        source="customers"
                        label="Customers"
                        isRequired={true}
                        fullWidth
                        optionText={RenderFullName}
                    />
                </ReferenceInput>
                <ArrayInput source="products">
                    <SimpleFormIterator>
                        <ReferenceInput source="product_id" reference="products">
                            <AutocompleteInput
                                source="products"
                                label="Products"
                                isRequired={true}
                                fullWidth
                                optionText="name"
                            />
                        </ReferenceInput>
                        <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                    </SimpleFormIterator>
                </ArrayInput>

                <ArrayInput source="items">
                    <SimpleFormIterator>
                        <TextInput fullWidth name="note" label="Note" source="note" />
                        <NumberInput label="Amount" source="amount" />
                        <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                    </SimpleFormIterator>
                </ArrayInput>

                <FormDataConsumer>
                    {({ formData }) => formData.items && (
                        <NumberInput label="Tax rate" source="tax_rate" />
                    )}
                </FormDataConsumer>

                <AutocompleteInput isRequired={true} source="order_status" choices={[
                    { id: "active", name: "active" },
                    { id: "pending", name: "pending" },
                    { id: "fruad", name: "fruad" },
                    { id: "cancelled", name: "cancelled" },
                ]} />
            </FormTab>
            <FormTab label="Payments">
                <AutocompleteInput isRequired={true} source="payment_method" choices={[
                    { id: "none", name: "none" },
                    { id: "manual", name: "manual" },
                    { id: "bank", name: "bank" },
                    { id: "paypal", name: "paypal" },
                    { id: "credit_card", name: "credit_card" },
                    { id: "swish", name: "swish" },
                ]} fullWidth />
                <AutocompleteInput isRequired={true} source="billing_type" choices={[
                    { id: "free", name: "free" },
                    { id: "one_time", name: "one_time" },
                    { id: "recurring", name: "recurring" },
                ]} fullWidth />
                <FormDataConsumer>
                    {({ formData }) => formData.billing_type === "recurring" && (
                        <AutocompleteInput fullWidth isRequired={false} source="billing_cycle" choices={[
                            { id: "monthly", name: "monthly" },
                            { id: "quarterly", name: "quarterly" },
                            { id: "semi_annually", name: "semi_annually" },
                            { id: "yearly", name: "yearly" },
                            { id: "biennially", name: "biennially" },
                            { id: "triennially", name: "triennially" },
                        ]} />
                    )}
                </FormDataConsumer>
                <AutocompleteInput fullWidth isRequired={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} />
            </FormTab>
            <FormTab label="Invoices">

                <ReferenceArrayInput source="invoices" reference="invoices">
                    <AutocompleteArrayInput fullWidth optionText={(record) => record?.id?.toString() ?? ""} />
                </ReferenceArrayInput>

            </FormTab>
        </TabbedForm>
    </Edit >
);