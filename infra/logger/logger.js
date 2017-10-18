var winston = require('winston');

const twoDigit = '2-digit';
const options = {
	day: twoDigit,
  month: twoDigit,
  year: twoDigit,
  hour: twoDigit,
  minute: twoDigit,
  second: twoDigit
};

module.exports = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
      timestamp: function() {
        return Date.now();
      },
      formatter: function(args) {
			  var dateTimeComponents = new Date().toLocaleTimeString('en-us', options).split(',');
			  var logMessage = dateTimeComponents[0] + dateTimeComponents[1] + ' - ' + args.level.toUpperCase() + ': ' + args.message;
			  return logMessage;
			}
    })
	]
});
