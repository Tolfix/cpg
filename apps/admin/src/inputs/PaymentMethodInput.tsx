import { SelectInput } from "react-admin";

export default function PaymentMethodInput()
{
    return (
        <SelectInput required={true} source="payment_method" choices={
            [
                { id: "none", name: "none" },
                { id: "manual", name: "manual" },
                { id: "bank", name: "bank" },
                { id: "paypal", name: "paypal" },
                { id: "credit_card", name: "credit_card" },
                { id: "swish", name: "swish" },
            ]} />
    )
}