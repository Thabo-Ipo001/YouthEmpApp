/* ==========================================================
   WORKCONNECT - JOB PORTAL SCRIPT
   Handles: Jobs, Filters, Add/Edit/Delete, Details & Apply
   Author: Thabo Maletswa
   ========================================================== */

// === Select Elements ===
const jobList = document.getElementById('jobList');
const searchInput = document.getElementById('searchInput');
const jobForm = document.getElementById('jobForm');
const successMsg = document.getElementById('successMsg');

const categoryFilter = document.getElementById('categoryFilter');
const locationFilter = document.getElementById('locationFilter');
const typeFilter = document.getElementById('typeFilter');
const sortFilter = document.getElementById('sortFilter');

// === Load Jobs ===
let jobs = JSON.parse(localStorage.getItem('jobs')) || [{
        "Job Title": "Test Software Developer",
        "Company Name": "ABC Solutions",
        "Location": "Johannesburg ",
        "Category": "IT",
        "Job Description": " ",
        "Job Type": "Full time "
    }

    ,];

// === Save Jobs ===
function saveJobs() {
  localStorage.setItem('jobs', JSON.stringify(jobs));
}

// === Escape HTML (Security) ===
function escapeHtml(str) {
  if (!str && str !== '') return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* ==========================================================
   INDEX PAGE - JOB LISTINGS
========================================================== */

function displayJobs(filteredJobs = jobs) {
  if (!jobList) return; // Only run on index.html

  jobList.innerHTML = '';

  if (filteredJobs.length === 0) {
    jobList.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No jobs found.</p>';
    return;
  }

  filteredJobs.forEach((job, index) => {
    const daysAgo = job.datePosted
      ? Math.floor((Date.now() - new Date(job.datePosted)) / (1000 * 60 * 60 * 24))
      : 0;

    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.innerHTML = `
      <h3>${escapeHtml(job.title)}</h3>
      <p><strong>${escapeHtml(job.company)}</strong> - ${escapeHtml(job.location)}</p>
      <p><em>${escapeHtml(job.type || 'Type not specified')}</em></p>
      <p>${escapeHtml(job.description).substring(0, 100)}...</p>
      <p class="posted-date">Posted ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago</p>

      <div class="job-actions">
        <button class="details-btn" onclick="openJobDetails(${index})">View Details</button>
        <button class="edit-btn" data-index="${index}" data-action="edit">Edit</button>
        <button class="delete-btn" data-index="${index}" data-action="delete">Delete</button>
      </div>
    `;
    jobList.appendChild(jobCard);
  });
}

/* ==========================================================
   EDIT / DELETE JOBS
========================================================== */

// === Delete Job ===
function deleteJob(index) {
  if (confirm('Are you sure you want to delete this job?')) {
    jobs.splice(index, 1);
    saveJobs();
    displayJobs();
  }
}

// === Edit Job (Redirect to Post Page) ===
function editJob(index) {
  localStorage.setItem('editIndex', index);
  window.location.href = 'add-job.html';
}

// === Handle Edit/Delete Button Clicks ===
if (jobList) {
  jobList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const index = parseInt(btn.dataset.index, 10);

    if (action === 'delete') deleteJob(index);
    if (action === 'edit') editJob(index);
  });
}

/* ==========================================================
   FILTERING & SEARCHING
========================================================== */

function filterJobs() {
  const query = searchInput?.value.toLowerCase() || '';
  const category = categoryFilter?.value || '';
  const location = locationFilter?.value || '';
  const type = typeFilter?.value || '';

  let filtered = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query);

    const matchesCategory = category ? job.category?.toLowerCase() === category.toLowerCase() : true;
    const matchesLocation = location ? job.location?.toLowerCase() === location.toLowerCase() : true;
    const matchesType = type ? job.type?.toLowerCase() === type.toLowerCase() : true;

    return matchesSearch && matchesCategory && matchesLocation && matchesType;
  });

  if (sortFilter) {
    if (sortFilter.value === 'newest') {
      filtered.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
    } else if (sortFilter.value === 'oldest') {
      filtered.sort((a, b) => new Date(a.datePosted) - new Date(b.datePosted));
    }
  }

  displayJobs(filtered);
}

// === Event Listeners for Filters ===
if (searchInput) searchInput.addEventListener('input', filterJobs);
if (categoryFilter) categoryFilter.addEventListener('change', filterJobs);
if (locationFilter) locationFilter.addEventListener('change', filterJobs);
if (typeFilter) typeFilter.addEventListener('change', filterJobs);
if (sortFilter) sortFilter.addEventListener('change', filterJobs);

/* ==========================================================
   ADD / EDIT JOB FORM (add-job.html)
========================================================== */

if (jobForm) {
  document.addEventListener('DOMContentLoaded', () => {
    const editIndex = localStorage.getItem('editIndex');
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];

    if (editIndex !== null && jobs[editIndex]) {
      const job = jobs[editIndex];

      // Prefill form with existing data
      document.getElementById('title').value = job.title || '';
      document.getElementById('company').value = job.company || '';
      document.getElementById('location').value = job.location || '';
      document.getElementById('description').value = job.description || '';
      if (document.getElementById('type')) document.getElementById('type').value = job.type || '';
      if (document.getElementById('category')) document.getElementById('category').value = job.category || '';

      // Change button text to Update
      const submitBtn = jobForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Update Job';

      jobForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedJob = {
          ...job,
          title: document.getElementById('title').value.trim(),
          company: document.getElementById('company').value.trim(),
          location: document.getElementById('location').value.trim(),
          description: document.getElementById('description').value.trim(),
          type: document.getElementById('type')?.value.trim() || '',
          category: document.getElementById('category')?.value.trim() || '',
          datePosted: new Date().toISOString(),
        };

        jobs[editIndex] = updatedJob;
        localStorage.setItem('jobs', JSON.stringify(jobs));
        localStorage.removeItem('editIndex');

        alert('✅ Job updated successfully!');
        window.location.href = 'index.html';
      });
    } else {
      // Normal new job submission
      jobForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const company = document.getElementById('company').value.trim();
        const location = document.getElementById('location').value.trim();
        const description = document.getElementById('description').value.trim();
        const type = document.getElementById('type')?.value.trim() || '';
        const category = document.getElementById('category')?.value.trim() || '';

        if (!title || !company || !description) {
          alert('Please fill in all required fields.');
          return;
        }

        const newJob = {
          title, company, location, description, type, category,
          datePosted: new Date().toISOString()
        };

        jobs.push(newJob);
        localStorage.setItem('jobs', JSON.stringify(jobs));

        if (successMsg) successMsg.style.display = 'block';
        jobForm.reset();
      });
    }
  });
}

/* ==========================================================
   JOB DETAILS PAGE (job-details.html)
========================================================== */

function openJobDetails(index) {
  window.location.href = `job-details.html?index=${index}`;
}

function loadJobDetails() {
  const params = new URLSearchParams(window.location.search);
  const index = params.get('index');
  const jobDetails = document.getElementById('jobDetails');
  if (!jobDetails) return;

  const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  const job = jobs[index];

  if (!job) {
    jobDetails.innerHTML = `<p style="text-align:center;">Job not found.</p>`;
    return;
  }

  jobDetails.innerHTML = `
    <h2>${job.title}</h2>
    <p><strong>Company:</strong> ${job.company}</p>
    <p><strong>Location:</strong> ${job.location || 'Not specified'}</p>
    <p><strong>Type:</strong> ${job.type || 'Not specified'}</p>
    <p><strong>Category:</strong> ${job.category || 'Not specified'}</p>
    <p>${job.description}</p>

    <div class="job-actions">
      <button class="apply-btn" onclick="openApplyModal('${job.title}', '${job.company}')">Apply Now</button>
      <button class="back-btn" onclick="window.location.href='index.html'">Back to Listings</button>
    </div>

    <!-- Apply Modal -->
    <div id="applyModal" class="modal">
      <div class="modal-content">
        <span class="close-btn" onclick="closeApplyModal()">&times;</span>
        <h3>Apply for ${job.title}</h3>
        <form id="applyForm">
          <label for="applicantName">Full Name</label>
          <input type="text" id="applicantName" placeholder="Enter your full name" required>

          <label for="applicantEmail">Email</label>
          <input type="email" id="applicantEmail" placeholder="Enter your email" required>

          <label for="coverLetter">Cover Letter</label>
          <textarea id="coverLetter" rows="4" placeholder="Write a short cover letter..." required></textarea>

          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  `;
}

// === Apply Modal Functions ===
function openApplyModal(title, company) {
  const modal = document.getElementById('applyModal');
  modal.style.display = 'flex';

  const form = document.getElementById('applyForm');
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('applicantName').value.trim();
    const email = document.getElementById('applicantEmail').value.trim();
    const message = document.getElementById('coverLetter').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }

    alert(`✅ Thank you, ${name}! Your application for ${title} at ${company} has been submitted.`);
    closeApplyModal();
    form.reset();
  };
}

function closeApplyModal() {
  const modal = document.getElementById('applyModal');
  if (modal) modal.style.display = 'none';
}

window.onclick = function (event) {
  const modal = document.getElementById('applyModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

/* ==========================================================
   APPLICATIONS PAGE (applications.html)
========================================================== */

function loadApplications() {
  const list = document.getElementById('applicationsList');
  if (!list) return;

  const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  const applications = JSON.parse(localStorage.getItem('applications')) || [];

  if (applications.length === 0) {
    list.innerHTML = `<p style="text-align:center;">No applications yet.</p>`;
    return;
  }

  list.innerHTML = '';
  applications.forEach((app, index) => {
    const job = jobs[app.jobIndex] || { title: 'Deleted Job', company: 'N/A' };

    const card = document.createElement('div');
    card.className = 'application-card';
    card.innerHTML = `
      <h3>${app.name}</h3>
      <p><strong>Email:</strong> ${app.email}</p>
      <p><strong>Applied for:</strong> ${job.title}</p>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Message:</strong> ${app.message || 'No message provided.'}</p>
      <p><em>Applied on ${new Date(app.date).toLocaleDateString()}</em></p>
      <button onclick="deleteApplication(${index})">Delete</button>
    `;
    list.appendChild(card);
  });
}

function deleteApplication(index) {
  const applications = JSON.parse(localStorage.getItem('applications')) || [];
  if (confirm('Are you sure you want to delete this application?')) {
    applications.splice(index, 1);
    localStorage.setItem('applications', JSON.stringify(applications));
    loadApplications();
  }
}

/* ==========================================================
   INITIAL LOAD
========================================================== */

displayJobs();
