import { currencyCodes } from "lib/Currencies";
import React from "react";
import
{
    ArrayInput,
    Create, FormTab,
    NumberInput,
    AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
    TextInput,
    FormDataConsumer,
    ReferenceInput,
} from "react-admin";
import RenderFullName from "../../lib/RenderFullName";

export const CreateOrders = (props: any) =>
{

    const [product, setProduct] = React.useState<any[]>([]);

    return (
        <Create {...props}>
            <TabbedForm>
                <FormTab label="General">
                    <ReferenceInput filterToQuery={(searchText: string) => ({
                        "text": searchText,
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
                                    isRequired={false}
                                    optionText={(r: any) => `${r.name} - (${r.id})`}
                                    onChange={(e) =>
                                    {
                                        setProduct(e);
                                        console.log(e);
                                    }}
                                    fullWidth
                                />
                            </ReferenceInput>
                            <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                            {/* We need to find a way to get the product it for this array of product */}
                            {/* Then on other product items query them.. */}
                            <ArrayInput source="configurable_options" label="Configurable options">
                                <SimpleFormIterator>
                                    <ReferenceInput source="option_id" reference="configurable_options">
                                        <AutocompleteInput
                                            source="configurable_options"
                                            label="Configurable Options"
                                            isRequired={false}
                                            optionText="name"
                                            fullWidth
                                        />
                                    </ReferenceInput>
                                </SimpleFormIterator>
                            </ArrayInput>
                        </SimpleFormIterator>
                    </ArrayInput>

                    <ArrayInput source="items">
                        <SimpleFormIterator>
                            <TextInput fullWidth label="Note" source="note" />
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
            </TabbedForm>
        </Create>
    )
};