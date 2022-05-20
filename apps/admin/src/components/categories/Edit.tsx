//@ts-ignore
import { RichTextInput } from 'ra-input-rich-text';
import { BooleanInput, Edit, FormTab, TabbedForm, TextInput } from "react-admin";

export const EditCategory = (props: any) =>
(
    <Edit mutationMode="pessimistic" {...props}>
        <TabbedForm>
            <FormTab label="General">
                <TextInput fullWidth isRequired={true} label="Name" source="name" />
                <RichTextInput isRequired={true} label="Description" source="description" />
                <BooleanInput defaultValue={false} label="Private" source="private" />
            </FormTab>
        </TabbedForm>
    </Edit>
);