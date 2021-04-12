const express = require('express');
const Queue = require('bull');

const REDIS_URL = process.env.HEROKU_REDIS_PINK_URL || 'redis://127.0.0.1:6379'; // Connect to a local redis instance locally, and the Heroku-provided URL in production
const PORT = process.env.PORT || '5000'; // Serve on PORT on Heroku and on localhost:5000 locally
const app = express();
const workQueue = new Queue('work', REDIS_URL); // Create / Connect to a named work queue

// Parsing incoming json payloads
app.use(express.json());

/// ////////////// TEMP
// Serve the two static assets
app.get('/', (req, res) => res.sendFile('index.html', { root: __dirname }));
app.get('/client.js', (req, res) => res.sendFile('client.js', { root: __dirname }));
/// //////////////

// Kick off a new job by adding it to the work queue
app.post('/job', async (req, res) => {
  const job = await workQueue.add(req.body);
  res.json({ id: job.id, job: job });
});

// Allows the client to query the state of a background job
app.get('/job/:id', async (req, res) => {
  const id = req.params.id;
  const job = await workQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    const jobstate = await job.getState();
    const progress = job._progress;
    const reason = job.failedReason;
    const returnvalue = job.returnvalue;
    res.json({ id, jobstate, progress, reason, result: returnvalue });
  }
});

// You can listen to global events to get notified when jobs are processed
workQueue.on('global:completed', (jobId, result) => {
  console.log(`Job completed with result ${result}`);
});

app.listen(PORT, () => console.log('Server started!'));
