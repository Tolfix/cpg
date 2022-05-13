import
{
    ArrayInput,
    Create, FormTab,
    NumberInput,
    ReferenceArrayInput, AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
} from "react-admin";
import RenderFullName from "../../lib/RenderFullName";

export const CreateOrders = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                {/* @ts-ignore */}
                <ReferenceArrayInput filterToQuery={searchText => ({
                    "personal.first_name": searchText,
                })} perPage={100} source="customer_uid" reference="customers">
                    <AutocompleteInput
                        source="customers"
                        label="Customers"
                        required={true}
                        allowEmpty={false}
                        optionText={RenderFullName}
                    />
                </ReferenceArrayInput>
                <ArrayInput source="products">
                    <SimpleFormIterator>
                        <ReferenceArrayInput source="product_id" reference="products">
                            <AutocompleteInput
                                source="products"
                                label="Products"
                                required={true}
                                allowEmpty={false}
                                optionText="name"
                            />
                        </ReferenceArrayInput>
                        <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                    </SimpleFormIterator>
                </ArrayInput>

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
                <AutocompleteInput required={false} source="billing_cycle" choices={[
                    { id: "monthly", name: "monthly" },
                    { id: "quarterly", name: "quarterly" },
                    { id: "semi_annually", name: "semi_annually" },
                    { id: "yearly", name: "yearly" },
                    { id: "biennially", name: "biennially" },
                    { id: "triennially", name: "triennially" },
                ]} />
            </FormTab>
            <FormTab label="Invoices">
                {/* @ts-ignore */}
                <ReferenceArrayInput filterToQuery={searchText => ({
                    "id": searchText,
                })} perPage={100} source="invoices" reference="invoices">
                    <AutocompleteInput optionText={(record) => record?.id?.toString() ?? ""} />
                </ReferenceArrayInput>

            </FormTab>
        </TabbedForm>
    </Create>
);