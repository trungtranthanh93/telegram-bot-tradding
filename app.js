const job = require('./app/cronjob-module');
const dailyjob = require('./app/daily-task-cron');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = job;