const job = require('./app/bot1/cronjob-module');
const dailyjob = require('./app/daily-task-cron');
const job1_2 = require('./app/bot1-2/cronjob-module');
const job2 = require('./app/bot2/cronjob-module');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
