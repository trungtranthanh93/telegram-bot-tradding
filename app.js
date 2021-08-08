const job = require('./app/cronjob-module');
const data = require('./tradding-data');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = job;