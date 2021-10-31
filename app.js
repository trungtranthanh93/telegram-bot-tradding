const job = require('./app/bot1/cronjob-module');
const dailyjob = require('./app/daily-task-cron');
const job1_2 = require('./app/bot1-2/cronjob-module');
const job2 = require('./app/bot2/cronjob-module');
const job2_2 = require('./app/bot2-2/cronjob-module');
const job3 = require('./app/bot3/cronjob-module');
const job3_2 = require('./app/bot3-2/cronjob-module');
const job4 = require('./app/bot4/cronjob-module');
//const jobtest = require('./app/testing/cronjob-module');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

