import { IResetPassword, ISendMail } from '../types/emailTamplate';

const sendMail = (values: ISendMail) => {
  const data = {
    to: values.email,
    subject: values.subjet,
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BOOLBI</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Thank you for choosing us. Use the following OTP to complete your Sign Up procedures. OTP is valid for 3 minutes.</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${values.otp}</h2>
          <p style="font-size:0.9em;">Regards,<br />${values.name}</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>${values.subjet}</p>
          </div>
        </div>
      </div>

      <!-- Mobile Responsiveness -->
      <style>
        @media screen and (max-width: 600px) {
          body {
            margin: 20px;
            padding: 10px;
          }
          .container {
            width: 100% !important;
            margin: 0;
          }
          h2 {
            font-size: 18px;
            padding: 0 8px;
          }
          .float-right {
            float: none;
            text-align: center;
          }
        }
      </style>
    </body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
          <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
          <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
      </div>

      <!-- Mobile Responsiveness -->
      <style>
        @media screen and (max-width: 600px) {
          body {
            margin: 20px;
            padding: 10px;
          }
          .container {
            width: 100% !important;
            padding: 15px;
          }
          img {
            width: 120px !important;
            margin: 0 auto;
          }
          .otp-container {
            width: 100% !important;
            font-size: 22px !important;
          }
          .otp {
            font-size: 22px !important;
            width: 90% !important;
            margin: 10px auto;
          }
          p {
            font-size: 14px !important;
          }
        }
      </style>
    </body>`,
  };
  return data;
};

export const emailTemplate = {
  sendMail,
  resetPassword,
};
