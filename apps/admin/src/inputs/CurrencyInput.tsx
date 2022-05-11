import { currencyCodes } from "lib/Currencies";
import { SelectInput } from "react-admin";

export default function CurrencyInput()
{
    return (
        <SelectInput required={true} source="currency" choices={currencyCodes.map(e =>
        {
            return { id: e, name: e };
        })} />
    )
}