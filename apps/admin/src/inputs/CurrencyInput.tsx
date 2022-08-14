import { currencyCodes } from "lib";
import { AutocompleteInput } from "react-admin";

export default function CurrencyInput()
{
    return (
        <AutocompleteInput isRequired={true} source="currency" choices={currencyCodes.map(e =>
        {
            return { id: e, name: e };
        })} />
    )
}