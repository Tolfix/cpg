import
{
    Create, FormTab,
    TabbedForm,
    TextInput,
} from "react-admin";

export const CreateEmailTemplate = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                <TextInput label="Name" isRequired={true} source="name" />

            </FormTab>
        </TabbedForm>
    </Create>
);