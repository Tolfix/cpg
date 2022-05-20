import { ReferenceArrayInput, ReferenceInput, AutocompleteInput } from "react-admin";
import RenderFullName from "../lib/RenderFullName";

export default function CustomerInput({
    source = "customer_uid",
    label = "Customers",
    required = true,
    isEdit = false,
})
{
    const reference = isEdit ? ReferenceInput : ReferenceArrayInput;
    return reference({
        source: source,
        reference: "customers",
        label: label,
        children:
            (
                <AutocompleteInput
                    source="customers"
                    label={label}
                    fullWidth
                    isRequired={required}
                    optionText={RenderFullName}
                />
            )
    });
}