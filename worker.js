// import playwright from 'playwright';
// import products from './products.js';

// (async () => {
//   const browser = await playwright.chromium.launch();
//   const page = await browser.newPage();

//   const amazonItems = products.amazon.items;

//   for (let x = 0; x < amazonItems.length; x++) {
//     await page.goto(amazonItems[x].url);

//     const inStock = await page.$(products.amazon.selector);

//     console.log('Item: ' + amazonItems[x].name);
//     console.log(inStock ? 'In stock' : 'Out of stock');
//     console.log('');
//   }

//   await browser.close();
// })();



let throng = require('throng');
let Queue = require("bull");

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.HEROKU_REDIS_PINK_URL || "redis://127.0.0.1:6379";

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function start() {
  // Connect to the named work queue
  let workQueue = new Queue('work', REDIS_URL);

  workQueue.process(maxJobsPerWorker, async (job) => {
    // This is an example job that just slowly reports on progress
    // while doing no work. Replace this with your own job logic.
    let progress = 0;

    // throw an error 5% of the time
    if (Math.random() < 0.05) {
      throw new Error("This job failed!")
    }

    while (progress < 100) {
      await sleep(50);
      progress += 1;
      job.progress(progress)
    }

    // A job can return values that will be stored in Redis as JSON
    // This return value is unused in this demo application.
    return { value: "This will be stored" };
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });




