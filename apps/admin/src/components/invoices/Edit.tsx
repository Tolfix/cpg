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
    useEditController,
} from "react-admin";
//@ts-ignore
import MarkdownInput from 'ra-input-markdown';
import { currencyCodes } from "lib/Currencies";
import RenderFullName from "../../lib/RenderFullName";

export const EditInvoices = (props: any) =>
{
    const controllerProps = useEditController(props);
    return (
        <Edit value={controllerProps} mutationMode="pessimistic" {...props}>
            <TabbedForm>

                <FormTab label="General">

                    {/* @ts-ignore */}
                    <ReferenceInput filterToQuery={(searchText: any) => ({
                        "personal.first_name": searchText,
                    })} perPage={100} source="customer_uid" reference="customers">
                        <AutocompleteInput
                            isRequired={true}
                            optionText={RenderFullName}
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
                    ]} />

                    <AutocompleteInput isRequired={true} source="payment_method" choices={[
                        { id: "none", name: "none" },
                        { id: "manual", name: "manual" },
                        { id: "bank", name: "bank" },
                        { id: "paypal", name: "paypal" },
                        { id: "credit_card", name: "credit_card" },
                        { id: "swish", name: "swish" },
                    ]} />

                    <NumberInput isRequired={true} label="Amount" source="amount" />
                    <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
                    {
                        return { id: e, name: e };
                    })} />
                    <NumberInput min={0} max={100} isRequired={true} label="Tax Rate" source="tax_rate" />
                    <BooleanInput label="Paid" defaultValue={false} source="paid" />
                    <BooleanInput label="Notified" defaultValue={false} source="notified" />
                </FormTab>

                <FormTab label="Dates">

                    <DateInput label="Invoiced date" source="dates.invoice_date" defaultValue={new Date().toLocaleDateString()} />
                    <DateInput label="Due date" source="dates.due_date" defaultValue={new Date().toLocaleDateString()} />

                </FormTab>

                <FormTab label="Miscellaneous">

                    <MarkdownInput source="notes" />

                    <ArrayInput isRequired={true} source="items">
                        <SimpleFormIterator>
                            <MarkdownInput source="notes" />
                            <NumberInput isRequired={true} label="Amount" source="amount" />
                            <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                            <ReferenceInput filterToQuery={(searchText: any) => ({
                                "name": searchText,
                            })} perPage={100} source="product_id" reference="products">
                                <AutocompleteInput
                                    source="product"
                                    label="Product"
                                    isRequired={true}
                                    optionText={"name"}
                                />
                            </ReferenceInput>
                        </SimpleFormIterator>
                    </ArrayInput>

                    <ReferenceArrayInput filterToQuery={(searchText: any) => ({
                        "id": searchText,
                    })} perPage={100} source="transactions" reference="transactions">
                        <AutocompleteArrayInput
                            source="transactions"
                            optionValue="id"
                            label="Transactions"
                            optionText={(record) => record?.id?.toString() ?? ""}
                        />
                    </ReferenceArrayInput>

                </FormTab>

            </TabbedForm>

        </Edit>
    )
};