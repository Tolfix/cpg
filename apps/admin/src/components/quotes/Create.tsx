/*
    customer_uid: ICustomer["uid"];
    items: IQuoteItem[];
    promotion_codes: IPromotionsCodes["id"][] | [];
    due_date: string;
    memo: string;
    payment_method: keyof IPayments;
    notified: boolean;
    created_invoice: boolean;
    tax_rate: number;
    currency: TPaymentCurrency;
    accepted: boolean;
    declined: boolean;

    export interface IQuoteItem
    {
        name: string;
        price: number;
        quantity: number;
    }
*/

import { ArrayInput, AutocompleteArrayInput, BooleanInput, Create, DateInput, FormTab, NumberInput, ReferenceInput, SimpleFormIterator, TabbedForm, TextInput } from "react-admin";
import CurrencyInput from "../../inputs/CurrencyInput";
import CustomerInput from "../../inputs/CustomerInput";
import PaymentMethodInput from "../../inputs/PaymentMethodInput";
//@ts-ignore
import { RichTextInput } from 'ra-input-rich-text';
import { getDate } from "../../lib/dateFormat";
export default function CreateQuote(props: any)
{
    return (
        <Create {...props}>
            <TabbedForm>
                <FormTab label="General">
                    <CustomerInput isEdit />
                    <ReferenceInput filterToQuery={(searchText: string) => ({
                        "name": searchText,
                    })} perPage={100} source="promotion_codes" reference="v2/promotion_codes">
                        <AutocompleteArrayInput
                            source="promotion_codes"
                            label="Promotion codes"
                            fullWidth
                            optionText="name"
                        />
                    </ReferenceInput>
                    <CurrencyInput />
                    <PaymentMethodInput />
                    <DateInput label="Due date" source="due_date" defaultValue={getDate()} />
                    <ArrayInput source="items">
                        <SimpleFormIterator>
                            <TextInput fullWidth label="Name" source="name" />
                            <NumberInput label="Price" source="price" defaultValue={1} />
                            <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                        </SimpleFormIterator>
                    </ArrayInput>
                    <RichTextInput source="memo" />
                    <BooleanInput source="send_email" defaultValue={true} />
                </FormTab>
            </TabbedForm>
        </Create >
    )
}