import express from 'express';
import Queue from 'bull';
import path from 'path';
import url from 'url';

// ES module workaround: https://stackoverflow.com/a/62892482
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve on PORT on Heroku and on localhost:5000 locally
const PORT = process.env.PORT || '5000';
// Connect to a local redis intance locally, and the Heroku-provided URL in production
const REDIS_URL = process.env.HEROKU_REDIS_PINK_URL || 'redis://127.0.0.1:6379';

const app = express();

// Create / Connect to a named work queue
const workQueue = new Queue('work', REDIS_URL);

// // Sanity check
// app.get('/', (req, res) => res.send('Hello World!'));

/////////////////
// Serve the two static assets
app.get('/', (req, res) => res.sendFile('index.html', { root: __dirname }));
app.get('/client.js', (req, res) => res.sendFile('client.js', { root: __dirname }));
/////////////////

// Kick off a new job by adding it to the work queue
app.post('/job', async (req, res) => {
  // This would be where you could pass arguments to the job
  // Ex: workQueue.add({ url: 'https://www.heroku.com' })
  // Docs: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
  let job = await workQueue.add();
  res.json({ id: job.id });
});

// Allows the client to query the state of a background job
app.get('/job/:id', async (req, res) => {
  let id = req.params.id;
  let job = await workQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    let state = await job.getState();
    let progress = job._progress;
    let reason = job.failedReason;
    res.json({ id, state, progress, reason });
  }
});

// You can listen to global events to get notified when jobs are processed
workQueue.on('global:completed', (jobId, result) => {
  console.log(`Job completed with result ${result}`);
});

app.listen(PORT, () => console.log("Server started!"));