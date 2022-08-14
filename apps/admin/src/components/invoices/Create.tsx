import
{
    ArrayInput,
    AutocompleteArrayInput,
    BooleanInput,
    Create, DateInput, FormTab,
    NumberInput,
    ReferenceArrayInput, AutocompleteInput,
    SimpleFormIterator,
    TabbedForm,
    ReferenceInput,
} from "react-admin";
//@ts-ignore
import { RichTextInput } from 'ra-input-rich-text';
import { currencyCodes } from "lib";
import RenderFullName from "../../lib/RenderFullName";
import { getDate } from "../../lib/dateFormat";

export const CreateInvoices = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                <ReferenceInput filterToQuery={(searchText: string) => ({
                    "personal.first_name": searchText,
                })} perPage={100} source="customer_uid" reference="customers">
                    <AutocompleteInput
                        source="customers"
                        label="Customer"
                        isRequired={true}
                        fullWidth
                        optionText={RenderFullName}
                    />
                </ReferenceInput>
                <AutocompleteInput isRequired={true} source="status" choices={[
                    { id: "draft", name: "draft" },
                    { id: "refunded", name: "refunded" },
                    { id: "collections", name: "collections" },
                    { id: "payment_pending", name: "payment_pending" },
                    { id: "active", name: "active" },
                    { id: "pending", name: "pending" },
                ]} fullWidth />
                <AutocompleteInput fullWidth isRequired={true} source="payment_method" choices={[
                    { id: "none", name: "none" },
                    { id: "manual", name: "manual" },
                    { id: "bank", name: "bank" },
                    { id: "paypal", name: "paypal" },
                    { id: "credit_card", name: "credit_card" },
                    { id: "swish", name: "swish" },
                ]} />
                <NumberInput fullWidth isRequired={true} label="Amount" source="amount" />
                <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                {
                    return { id: e, name: e };
                })} fullWidth />
                <NumberInput fullWidth min={0} max={100} isRequired={true} label="Tax Rate" source="tax_rate" />
                <BooleanInput label="Paid" defaultValue={false} source="paid" />
                <BooleanInput label="Notified" defaultValue={false} source="notified" />
                <BooleanInput label="Send Email" defaultValue={false} source="send_email" />
            </FormTab>
            <FormTab label="Dates">
                <DateInput label="Invoiced date" source="dates.invoice_date" defaultValue={getDate()} />
                <DateInput label="Due date" source="dates.due_date" defaultValue={getDate()} />
            </FormTab>
            <FormTab label="Miscellaneous">

                <RichTextInput source="notes" />

                <ArrayInput isRequired={true} source="items">
                    <SimpleFormIterator>
                        <RichTextInput source="notes" />
                        <NumberInput isRequired={true} label="Amount" source="amount" />
                        <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                        {/* @ts-ignore */}
                        <ReferenceInput filterToQuery={searchText => ({
                            "name": searchText,
                        })} perPage={100} source="product_id" reference="products">
                            <AutocompleteInput
                                source="product"
                                label="Product"
                                isRequired={true}
                                fullWidth
                                optionText={(r: any) => `${r.name} - (${r.id})`}
                            />
                        </ReferenceInput>
                    </SimpleFormIterator>
                </ArrayInput>

                <ReferenceArrayInput filterToQuery={(searchText: string) => ({
                    "id": searchText,
                })} perPage={100} source="transactions" reference="transactions">
                    <AutocompleteArrayInput fullWidth optionText={(record) => record?.id?.toString() ?? ""} />
                </ReferenceArrayInput>

            </FormTab>
        </TabbedForm>
    </Create>
);