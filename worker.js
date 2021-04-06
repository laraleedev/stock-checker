const throng = require('throng');
const Queue = require('bull');
const playwright = require('playwright');

// Connect to a local redis instance locally, and the Heroku-provided URL in production
const REDIS_URL = process.env.HEROKU_REDIS_PINK_URL || 'redis://127.0.0.1:6379';

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
const workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
const maxJobsPerWorker = 50;

function start () {
  const workQueue = new Queue('work', REDIS_URL, { settings: { lockDuration: 30000 } });   // Connect to the named work queue

  workQueue.process(maxJobsPerWorker, async (job) => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    await page.goto(job.data.url);

    // Checks stock using selector for add to cart button
    const inStock = !!(await page.$(job.data.selector));

    await browser.close();

    job.progress(100);
    return { inStock: inStock };
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
