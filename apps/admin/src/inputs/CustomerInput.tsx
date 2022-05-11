import { ReferenceArrayInput, ReferenceInput, SelectInput } from "react-admin";

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
                <SelectInput
                    source="customers"
                    label={label}
                    required={required}
                    allowEmpty={false}
                    optionText={
                        (record: { personal: { first_name: any; last_name: any; } }) =>
                            `${record.personal.first_name} ${record.personal.last_name}`}
                />
            )
    });
}