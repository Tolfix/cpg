import * as React from "react";
import { Box, Card, CardContent, CardHeader, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import JoditEditor from "jodit-react";
import { ICustomerStringConvert } from "interfaces/Customer.interface";
import { AutocompleteInput, ReferenceInput, SimpleForm } from "react-admin";
import RenderFullName from "../../lib/RenderFullName";

export default function SendEmailRoute()
{

    const [to, setTo] = React.useState("");
    const [sendToCustomer, setSendToCustomer] = React.useState(false);
    const [status, setStatus] = React.useState("all");
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");
    const [isSending, setIsSending] = React.useState(false);
    const [errors, setErrors] = React.useState([]);
    const [msg, setMsg] = React.useState("");

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

    const onClickSend = () =>
    {
        // Get token from local storage
        const token = JSON.parse(localStorage.getItem("auth") ?? "{}").token;
        if (!token)
            return;
        const uri = process.env.REACT_APP_CPG_DOMAIN;
        setIsSending(true);
        // Fetch to uri/v3/emails/send
        fetch(`${uri}/v3/emails/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                to,
                cId: sendToCustomer,
                cStatus: status,
                subject,
                body
            })
        })
            .then(e =>
            {

                if (e.status !== 200)
                    throw new Error("Error sending email");

                return e.json();
            })
            .then(() =>
            {
                setIsSending(false);
                setTo("");
                setStatus("all");
                setSubject("");
                setBody("");
                setErrors([]);
                setMsg("Email sent successfully");
                // @ts-ignore
            }).catch(e =>
            {
                // @ts-ignore
                setErrors([e.message]);
                setIsSending(false);
            });

    };

    return (
        <>
            {/* Add margin on top */}
            <Card style={{ marginTop: "1rem" }}>
                <CardHeader title={"Send email to customers"} />
                <CardContent>

                    {/* Error box */}
                    {errors.length > 0 &&
                        <Box style={{ color: "red", marginBottom: "1rem" }}>
                            {errors.map((e, i) => <p key={i}>{e}</p>)}
                        </Box>
                    }

                    {/* Message box */}
                    {msg.length > 0 &&
                        <Box style={{ color: "green", marginBottom: "1rem" }}>
                            {msg}
                        </Box>
                    }

                    {/* We are gonna have a form, that takes
                        input from user which is:
                        - to
                        - subject
                        - body
                    */}

                    <SimpleForm
                        // component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '75ch' },
                            // Get mui select to be full width
                            // Flex
                            display: "flex",
                            flexDirection: "column",
                        }}
                        noValidate toolbar={false}
                    >
                        <FormControlLabel sx={{ m: 1 }} control={<Switch
                            checked={sendToCustomer}
                            onChange={e => setSendToCustomer(e.target.checked)}
                        />} label="Send to customer" />
                        {sendToCustomer && (
                            <ReferenceInput filterToQuery={(searchText: string) => ({
                                "text": searchText,
                            })} perPage={100} source="customer_uid" reference="customers" allowEmpty>
                                <AutocompleteInput
                                    source="customers"
                                    label="Customers"
                                    fullWidth
                                    onChange={(e) =>
                                    {
                                        setTo(e);
                                    }}
                                    optionText={RenderFullName}
                                />
                            </ReferenceInput>
                        )}
                        <TextField
                            label="To"
                            value={to}
                            disabled={sendToCustomer}
                            onChange={(e) => setTo(e.target.value)}
                            helperText={`Using \`all\` will send to all customers, otherwise you can input any valid email`}
                        />
                        {to !== "all" ? null : <>
                            <InputLabel>Select customer status</InputLabel>
                            <Select
                                sx={{
                                    m: 1, width: '75ch'
                                }}
                                onChange={(e) => setStatus(e.target.value)}
                                value={status}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </>}
                        <TextField
                            label="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        <InputLabel>Body</InputLabel>
                        <JoditEditor
                            value={body}
                            config={config}
                            onBlur={newContent =>
                            {
                                console.log(newContent)
                                setBody(newContent)
                            }}
                        />
                    </SimpleForm>
                    <LoadingButton
                        size="medium"
                        onClick={onClickSend}
                        endIcon={<SendIcon />}
                        loading={isSending}
                        loadingPosition="end"
                        variant="contained"
                    >
                        Send
                    </LoadingButton>

                </CardContent>
            </Card>
        </>
    )
}