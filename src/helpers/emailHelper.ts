import nodemailer from 'nodemailer';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email_host,
  port: Number(config.email_port),
  secure: false,
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `"BOOLBI" ${config.email_from}`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    logger.info('Mail send successfully', info.accepted);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

export const emailHelper = {
  sendEmail,
};
