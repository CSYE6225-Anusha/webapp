const winston = require('winston');
const { combine, timestamp, printf, align } = winston.format;
var rootPath = require('app-root-path');

const logFormat = printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`);

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    new winston.transports.File({
      filename: rootPath + "/logs/webapp.log",
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        align(),
        logFormat
      )
    })
  ]
});

module.exports = logger;
