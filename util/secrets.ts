import logger from './logger';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' }); // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'

export const SESSION_SECRET = process.env['SESSION_SECRET'];
export const MYSQL_URL = prod ? process.env['MYSQL_URI'] : process.env['MYSQL_URI_LOCAL'];

if (!MYSQL_URL) {
  if (prod) {
    logger.error('No MYSQL connection string. Set MYSQL_URI environment variable.');
  } else {
    logger.error('No MYSQL connection string. Set MYSQL_URI_LOCAL environment variable.');
  }
  process.exit(1);
}
