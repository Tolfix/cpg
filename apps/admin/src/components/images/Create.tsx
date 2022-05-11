import
    {
        Create, FileField, FileInput, FormTab,
        TabbedForm,
    } from "react-admin";

export const CreateImage = (props: any) =>
(
    <Create {...props}>
        <TabbedForm>
            <FormTab label="General">
                <FileInput enctype="multipart/form-data" source="files" label="Related files" accept="image/*">
                    <FileField source="src" title="title" />
                </FileInput>
            </FormTab>
        </TabbedForm>
    </Create>
);