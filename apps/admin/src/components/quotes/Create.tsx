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

import { ArrayInput, BooleanInput, Create, DateInput, FormTab, NumberInput, ReferenceArrayInput, SelectArrayInput, SimpleFormIterator, TabbedForm, TextInput } from "react-admin";
import CurrencyInput from "../../inputs/CurrencyInput";
import CustomerInput from "../../inputs/CustomerInput";
import PaymentMethodInput from "../../inputs/PaymentMethodInput";
//@ts-ignore
import MarkdownInput from 'ra-input-markdown';
export default function CreateQuote(props: any)
{
    return (
        <Create {...props}>
            <TabbedForm>
                <FormTab label="General">
                    <CustomerInput />
                    <ReferenceArrayInput source="promotion_codes" reference="promotion_codes">
                        <SelectArrayInput
                            source="promotion_codes"
                            label="Promotion codes"
                            allowEmpty={false}
                            optionText="name"
                        />
                    </ReferenceArrayInput>
                    <CurrencyInput />
                    <PaymentMethodInput />
                    <DateInput label="Due date" source="due_date" defaultValue={new Date().toLocaleDateString()} />
                    <ArrayInput source="items">
                        <SimpleFormIterator>
                            <TextInput label="Name" source="name" />
                            <NumberInput label="Price" source="price" defaultValue={1} />
                            <NumberInput label="Quantity" defaultValue={1} source="quantity" />
                        </SimpleFormIterator>
                    </ArrayInput>
                    <MarkdownInput source="memo" />
                    <BooleanInput source="send_email" defaultValue={true} />
                </FormTab>
            </TabbedForm>
        </Create >
    )
}