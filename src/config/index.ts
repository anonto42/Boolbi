import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  jwt_secret: process.env.JWT_SECRET!,
  jwt_expire: process.env.JWT_EXPIRE_IN!,
  bcrypt_sart_rounds: process.env.BCRYPT_SALT_ROUNDS!,
  node_env: process.env.NODE_ENV,
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,
  email_host: process.env.EMAIL_HOST,
  email_port: process.env.EMAIL_PORT,
  email_from: process.env.EMAIL_FROM,
  db_url: process.env.DATABASE_URL,
  db_name: process.env.DB_NAME,
  port: process.env.PORT || 3000,
  origin: process.env.ORIGIN || "*",
};
