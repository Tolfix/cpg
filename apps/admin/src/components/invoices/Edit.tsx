import
{
    ArrayInput,
    AutocompleteArrayInput,
    BooleanInput,
    DateInput, Edit, FormTab,
    NumberInput,
    ReferenceArrayInput, ReferenceInput, AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
    FormDataConsumer,
} from "react-admin";
import { RichTextInput } from 'ra-input-rich-text';
import { currencyCodes } from "lib/Currencies";
import RenderFullName from "../../lib/RenderFullName";
import { getDate } from "../../lib/dateFormat";

export const EditInvoices = (props: any) =>
{
    return (
        <Edit mutationMode="pessimistic" {...props}>
            <TabbedForm>
                <FormTab label="General">
                    <ReferenceInput filterToQuery={(searchText: any) => ({
                        "personal.first_name": searchText,
                    })} perPage={100} source="customer_uid" reference="v2/customers">
                        <AutocompleteInput
                            isRequired={true}
                            optionText={RenderFullName}
                            fullWidth
                        />
                    </ReferenceInput>
                    <AutocompleteInput isRequired={true} source="status" choices={[
                        { id: "draft", name: "draft" },
                        { id: "paid", name: "paid" },
                        { id: "refunded", name: "refunded" },
                        { id: "collections", name: "collections" },
                        { id: "payment_pending", name: "payment_pending" },
                        { id: "active", name: "active" },
                        { id: "pending", name: "pending" },
                        { id: "fraud", name: "fruad" },
                        { id: "cancelled", name: "cancelled" },
                    ]} fullWidth />

                    <AutocompleteInput isRequired={true} source="payment_method" choices={[
                        { id: "none", name: "none" },
                        { id: "manual", name: "manual" },
                        { id: "bank", name: "bank" },
                        { id: "paypal", name: "paypal" },
                        { id: "credit_card", name: "credit_card" },
                        { id: "swish", name: "swish" },
                    ]} fullWidth />

                    <NumberInput isRequired={true} label="Amount" source="amount" fullWidth />
                    <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                    {
                        return { id: e, name: e };
                    })} fullWidth />
                    <NumberInput fullWidth min={0} max={100} isRequired={true} label="Tax Rate" source="tax_rate" />
                    <BooleanInput label="Paid" defaultValue={false} source="paid" />
                    <BooleanInput label="Notified" defaultValue={false} source="notified" />

                    <FormDataConsumer>
                        {({ formData }) => (
                            formData.paid &&
                            formData.status === "refunded" &&
                            formData.payment_method === "credit_card" &&
                            !formData.extra.refunded
                        ) && (
                                <BooleanInput disabled={formData.refund_email} label="Refund this invoice?" helperText="Warning: Only works for Credit card! This will refund automatically and send email, click on 'Refund Email' to send email if refunded" source="refund_invoice" />
                            )}
                    </FormDataConsumer>

                    <FormDataConsumer>
                        {({ formData }) => (
                            formData.paid &&
                            formData.status === "refunded"
                        ) && (
                                <BooleanInput disabled={formData.refund_invoice} label="Refund Email" source="refund_email" />
                            )}
                    </FormDataConsumer>

                </FormTab>

                <FormTab label="Dates">

                    <DateInput label="Invoiced date" source="dates.invoice_date" defaultValue={getDate()} />
                    <DateInput label="Due date" source="dates.due_date" defaultValue={getDate()} />
                    <DateInput label="Paid date" source="dates.date_paid" defaultValue={null} />
                    <DateInput label="Due cancelled" source="dates.date_cancelled" defaultValue={null} />
                    <DateInput label="Refunded date" source="dates.date_refunded" defaultValue={null} />

                </FormTab>

                <FormTab label="Miscellaneous">
                    <RichTextInput source="notes" />

                    <ArrayInput isRequired={true} source="items">
                        <SimpleFormIterator>
                            <RichTextInput source="notes" />
                            <NumberInput isRequired={true} label="Amount" source="amount" />
                            <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                            <ReferenceInput filterToQuery={(searchText: any) => ({
                                "name": searchText,
                            })} perPage={100} source="product_id" reference="v2/products">
                                <AutocompleteInput
                                    source="product"
                                    label="Product"
                                    isRequired={true}
                                    optionText={(r: any) => `${r.name} - (${r.id})`}
                                    fullWidth
                                />
                            </ReferenceInput>
                        </SimpleFormIterator>
                    </ArrayInput>

                    <ReferenceArrayInput filterToQuery={(searchText: any) => ({
                        "id": searchText,
                    })} perPage={100} source="transactions" reference="v2/transactions">
                        <AutocompleteArrayInput
                            source="transactions"
                            optionValue="id"
                            label="Transactions"
                            fullWidth
                            optionText={(record: any) => record?.id?.toString() ?? ""}
                        />
                    </ReferenceArrayInput>

                </FormTab>

            </TabbedForm>

        </Edit>
    )
};