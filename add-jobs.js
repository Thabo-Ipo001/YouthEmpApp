const jobForm = document.getElementById('jobForm');
const successMsg = document.getElementById('successMsg');

jobForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get values from form
  const title = document.getElementById('title').value.trim();
  const company = document.getElementById('company').value.trim();
  const location = document.getElementById('location').value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value.trim();


  // Validate required fields
  if (!title || !company || !description) {
    alert('Please fill in all required fields.');
    return;
  }

  // Create job object
  const type = document.getElementById('jobType')?.value || '';

const newJob = {
  title,
  company,
  description,
  category,
  location,
  type,
  datePosted: new Date().toISOString()
};

  let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

  // Add new job
  jobs.push(newJob);

  // Save back to localStorage
  localStorage.setItem('jobs', JSON.stringify(jobs));

  // Show success message
  successMsg.style.display = 'block';

  jobForm.reset();
});