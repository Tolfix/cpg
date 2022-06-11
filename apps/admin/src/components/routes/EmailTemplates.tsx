import * as React from "react";
import { ICustomerStringConvert } from "interfaces/Customer.interface";
import JoditEditor from "jodit-react";
import { Card, CardContent, CardHeader } from "@mui/material";


export default function EmailTemplateRoute()
{
    const [body, setBody] = React.useState("");

    const config = {
        // @ts-ignore
        readonly: false,
        "uploader": {
            "insertImageAsBase64URI": true
        },
        "defaultMode": "1",
        "buttons": "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,classSpan,lineHeight,image,video,file,copyformat,cut,copy,paste,customer",
        placeholder: 'Start typings...',
        controls: {
            "customer": {
                tooltip: "Customer",
                list: [
                    "customer_name",
                    "customer_email",
                    "customer_phone",
                    "customer_company",
                    "customer_company_vat",
                    "customer_street01",
                    "customer_street02",
                    "customer_city",
                    "customer_state",
                    "customer_postcode",
                    "customer_country",
                ] as unknown as keyof ICustomerStringConvert,
                // @ts-ignore
                childTemplate: (editor, key, value) =>
                    `<span class="${key}">${value}</span>`,
                // @ts-ignore
                exec: function (editor, _, { control })
                {
                    const value = control.args && control.args[0];

                    editor.s.insertHTML(`{${value}}`);

                    return false;
                }
            }
        },
    };
    return (
        <>
            <Card style={{ marginTop: "1rem" }}>
                <CardHeader title={"Create email template"} />
                <CardContent>
                    <JoditEditor
                        value={body}
                        config={config}
                        onBlur={newContent =>
                        {
                            console.log(newContent)
                            setBody(newContent)
                        }}
                    />
                </CardContent>
            </Card>
        </>
    )
}