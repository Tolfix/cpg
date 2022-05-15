import { IPromotionsCodes } from "interfaces/PromotionsCodes.interface";
import { ReferenceArrayInput, ReferenceInput, AutocompleteInput } from "react-admin";

export default function PromotionCodeInput({
    source = "promotion_code_uid",
    label = "Promotion Code",
    required = true,
    isEdit = false,
})
{
    const reference = isEdit ? ReferenceInput : ReferenceArrayInput;
    return reference({
        source: source,
        reference: "promotion_codes",
        label: label,
        children:
            (
                <AutocompleteInput
                    source="promotion_codes"
                    label={label}
                    required={required}
                    optionText={
                        (record: IPromotionsCodes) =>
                            `${record.id}`}
                />
            )
    });
}