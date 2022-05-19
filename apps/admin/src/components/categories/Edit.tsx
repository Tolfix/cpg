//@ts-ignore
import MarkdownInput from 'ra-input-markdown';
import { BooleanInput, Edit, FormTab, TabbedForm, TextInput } from "react-admin";

export const EditCategory = (props: any) =>
(
    <Edit mutationMode="pessimistic" {...props}>
        <TabbedForm>
            <FormTab label="General">
                <TextInput isRequired={true} label="Name" source="name" />
                <MarkdownInput isRequired={true} label="Description" source="description" />
                <BooleanInput defaultValue={false} label="Private" source="private" />
            </FormTab>
        </TabbedForm>
    </Edit>
);