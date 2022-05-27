import * as React from "react";
import { Box, Card, CardContent, CardHeader, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import JoditEditor from "jodit-react";

export default function SendEmailRoute()
{

    const [to, setTo] = React.useState("");
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
        "buttons": "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,classSpan,lineHeight,image,video,file,copyformat,cut,copy,paste",
        placeholder: 'Start typings...'
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

                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '75ch' },
                            // Get mui select to be full width
                            // Flex
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <TextField
                            label="To"
                            value={to}
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
                    </Box>
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