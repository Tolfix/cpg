import mail from "nodemailer";
import { Company_Name, GetSMTPConfig } from "../Config";
import { IConfigs } from "interfaces/Admin/Configs.interface";
import { AW } from "lib";
import { Logger } from "lib";


/**
 * It sends an email to a receiver with a subject and body
 * @param {string} receiver - The email address of the receiver.
 * @param {string} subject - The subject of the email
 * @param body - {
 * @param [callback] - (error: Error | null, sent: boolean | null) => void
 */
export async function SendEmail(
    receiver: string,
    subject: string,
    body: {
        isHTML: boolean;
        body: any;
        attachments?: any;
    },
    callback?: (error: Error | null, sent: boolean | null) => void
): Promise<boolean | void>
{
    const [SMTPConfig, SMTP_Error] = await AW<IConfigs["smtp"]>(await GetSMTPConfig());
    if (!SMTPConfig || SMTP_Error)
        throw new Error(`No SMTP config.`);

    const config = {
        host: SMTPConfig.host,
        port: SMTPConfig.port,
        secure: SMTPConfig.secure,
        secureConnection: false,
        ignoreTLS: false,
        requireTLS: true,
        auth: {
            user: SMTPConfig.username,
            pass: SMTPConfig.password
        },
        tls: {
            rejectUnauthorized: false
        },
    }

    const email: {
        from: string;
        to: string;
        subject: string;
        text?: string;
        html?: string;
        attachments?: any;
    } = {
        from: `"${await Company_Name()}" <${SMTPConfig.username}>`,
        to: `${receiver}`,
        subject: subject,
    }

    if (body.isHTML)
        email.html = body.body;

    if (!body.isHTML)
        email.text = body.body

    if (body.attachments)
        email.attachments = body.attachments;

    //@ts-ignore
    const transport = mail.createTransport(config);

    Logger.info("Email:", `Sending email to ${receiver}`);


    transport.sendMail(email).then(() =>
    {
        callback ? callback?.(null, true) : Promise.resolve(true);
    }).catch(e =>
    {
        callback ? callback?.(e, false) : Promise.resolve(false);
    });
}

export async function sendEmail(options: {
    receiver: string;
    subject: string;
    body: {
        body: any;
        attachments?: any;
    };
})
{
    const [SMTPConfig, SMTP_Error] = await AW<IConfigs["smtp"]>(await GetSMTPConfig());
    if (!SMTPConfig || SMTP_Error)
        throw new Error(`No SMTP config.`);

    const config = {
        host: SMTPConfig.host,
        port: SMTPConfig.port,
        secure: SMTPConfig.secure,
        secureConnection: false,
        ignoreTLS: false,
        requireTLS: true,
        auth: {
            user: SMTPConfig.username,
            pass: SMTPConfig.password
        },
        tls: {
            rejectUnauthorized: false
        },
    }

    const email: {
        from: string;
        to: string;
        subject: string;
        html: string;
        attachments?: any;
    } = {
        from: `"${await Company_Name()}" <${SMTPConfig.username}>`,
        to: `${options.receiver}`,
        html: options.body.body,
        subject: options.subject,
    }

    if (options.body.attachments)
        email.attachments = options.body.attachments;

    //@ts-ignore
    const transport = mail.createTransport(config);

    Logger.info("Email:", `Sending email to ${options.receiver}`);

    return transport.sendMail(email);
}