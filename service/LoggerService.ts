import { createLogger, format, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
const Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: './logs/mybias_error.txt', level: 'error' }),
    new transports.File({ filename: './logs/mybias_log.txt' }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  Logger.add(new transports.Console({ level: 'error' }));
  Logger.add(
    new WinstonCloudWatch({
      awsRegion: 'ap-northeast-2',
      logGroupName: 'mybias_api',
      logStreamName: 'mybias_api',
    }),
  );
} else {
  Logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

export default Logger;
