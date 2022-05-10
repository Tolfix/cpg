//@ts-ignore
import MarkdownInput from 'ra-input-markdown';
import { BooleanInput, Create, FormTab, TabbedForm, TextInput } from "react-admin";

export const CreateCategory = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                <TextInput required={true} label="Name" source="name" />
                <MarkdownInput required={true} label="Description" source="description"  />
                <BooleanInput defaultValue={false} label="Private" source="private" />
            </FormTab>
        </TabbedForm>
    </Create>
);