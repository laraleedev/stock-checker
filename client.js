const productsToCheck = [
  {
    name: 'PS5',
    url: 'https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG'
  },
  {
    name: '3080 Asus TUF OC',
    url: 'https://www.amazon.com/ASUS-GeForce-Graphics-DisplayPort-Bearings/dp/B08HH5WF97'
  },
  {
    name: '3080 Asus TUF',
    url: 'https://www.amazon.com/ASUS-Graphics-DisplayPort-Military-Grade-Certification/dp/B08HHDP9DW'
  },
  {
    name: '3080 EVGA FTW3',
    url: 'https://www.amazon.com/EVGA-10G-P5-3895-KR-GeForce-Technology-Backplate/dp/B08HR3DPGW'
  },
  {
    name: '3080 EVGA FTW3 ULTRA',
    url: 'https://www.amazon.com/EVGA-10G-P5-3897-KR-GeForce-Technology-Backplate/dp/B08HR3Y5GQG'
  },
  {
    name: '3080 EVGA XC3',
    url: 'https://www.amazon.com/EVGA-10G-P5-3883-KR-GeForce-Cooling-Backplate/dp/B08HR4RJ3Q'
  },
  {
    name: '3080 EVGA XC3 BLACK',
    url: 'https://www.amazon.com/EVGA-10G-P5-3881-KR-GeForce-GAMING-Cooling/dp/B08HR6FMF3'
  },
  {
    name: '3080 EVGA XC3 ULTRA',
    url: 'https://www.amazon.com/EVGA-10G-P5-3885-KR-GeForce-Cooling-Backplate/dp/B08HR55YB5'
  },
  {
    name: '3070 Asus OC',
    url: 'https://www.amazon.ca/Graphics-DisplayPort-Axial-tech-Protective-Backplate/dp/B08L8LG4M3'
  },
  {
    name: 'Nintendo Switch Pro Controller',
    note: 'control item, should be in stock',
    url: 'https://www.amazon.com/Nintendo-Switch-Pro-Controller/dp/B01NAWKYZ0'
  }
];

// Store for all of the jobs in progress
let jobs = {};

// Kick off a new job by POST-ing to the server
async function addJob (data) {
  const res = await fetch('/job/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productsToCheck[Math.floor(Math.random() * productsToCheck.length)])
  });
  const resJson = await res.json();
  jobs[resJson.id] = { id: resJson.id + ' | ' + resJson.job.data.name, state: 'queued' };
  render();
}

// Fetch updates for each job
async function updateJobs () {
  for (const id of Object.keys(jobs)) {
    if (jobs[id].jobstate === "completed" || jobs[id].jobstate === "failed" ) {
      continue;
    };

    const res = await fetch(`/job/${id}`);
    const resJson = await res.json();
    if (jobs[id]) {
      jobs[id].jobstate = resJson.jobstate;
      jobs[id].progress = resJson.progress;
      jobs[id].result = resJson.result;
    }
    render();
  }
}

// Delete all stored jobs
function clear () {
  jobs = {};
  render();
}

// Update the UI
function render () {
  let s = '';
  for (const id of Object.keys(jobs)) {
    s += renderJob(jobs[id]);
  }

  // For demo simplicity this blows away all of the existing HTML and replaces it,
  // which is very inefficient. In a production app a library like React or Vue should
  // handle this work
  document.querySelector('#job-summary').innerHTML = s;
}

// Renders the HTML for each job object
function renderJob (job) {
  let progress = job.progress || 0;
  let color = 'bg-light-purple';

  if (job.state === 'completed') {
    color = 'bg-purple';
    progress = 100;
  } else if (job.state === 'failed') {
    color = 'bg-dark-red';
    progress = 100;
  }

  return document.querySelector('#job-template')
    .innerHTML
    .replace('{{id}}', job.id)
    .replace('{{state}}', job.state)
    .replace('{{result}}', job.result || 'waiting')
    .replace('{{color}}', color)
    .replace('{{progress}}', progress);
}

// Attach click handlers and kick off background processes
window.onload = function () {
  document.querySelector('#add-job').addEventListener('click', addJob);
  document.querySelector('#clear').addEventListener('click', clear);

  setInterval(updateJobs, 1000);
};
