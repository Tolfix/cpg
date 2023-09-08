import mail from 'nodemailer';
import { Company_Name, GetSMTPConfig } from '../Config';
import { IConfigs } from 'interfaces/Admin/Configs.interface';
import { AW } from 'lib';
import Logger from '@cpg/logger';

const log = new Logger('cpg:api:email:send');

/**
 * @description
 * Send a email
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
): Promise<boolean | void> {
  const [SMTPConfig, SMTP_Error] = await AW<IConfigs['smtp']>(await GetSMTPConfig());
  if (!SMTPConfig || SMTP_Error) throw new Error(`No SMTP config.`);

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
    }
  };

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
    subject: subject
  };

  if (body.isHTML) email.html = body.body;

  if (!body.isHTML) email.text = body.body;

  if (body.attachments) email.attachments = body.attachments;

  //@ts-ignore
  const transport = mail.createTransport(config);

  log.info(`Sending email to ${receiver}..`);

  transport
    .sendMail(email)
    .then(() => {
      callback ? callback?.(null, true) : Promise.resolve(true);
    })
    .catch((e) => {
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
}) {
  const [SMTPConfig, SMTP_Error] = await AW<IConfigs['smtp']>(await GetSMTPConfig());
  if (!SMTPConfig || SMTP_Error) throw new Error(`No SMTP config.`);

  const USING_GMAIL = SMTPConfig.host === 'smtp.gmail.com';

  let config: Record<string, any> = {
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
    }
  };

  if (USING_GMAIL) {
    config = {
      service: 'gmail',
      secure: SMTPConfig.secure,
      auth: {
        user: SMTPConfig.username,
        pass: SMTPConfig.password
      }
    };
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
    subject: options.subject
  };

  if (options.body.attachments) email.attachments = options.body.attachments;

  //@ts-ignore
  const transport = mail.createTransport(config);

  log.info(`Sending email to ${options.receiver}..`);

  return transport.sendMail(email);
}
