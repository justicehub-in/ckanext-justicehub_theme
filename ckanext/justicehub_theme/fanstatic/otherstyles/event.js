const students = [
  { name: 'Shaswata Kapat', image: '/assets/students/shaswata-kapat.jpeg' },
  { name: 'Yash Prakash Yadav', image: '/assets/students/yash-prakash-yadav.JPG' },
  { name: 'Gokul Suresh Nair', image: '/assets/students/gokul-suresh-nair.jpg' },
  { name: 'Antara Balaji', image: '/assets/students/antara-balaji.jpg' },
  { name: 'Indrasish Majumder', image: '/assets/students/indrasish-majumder.jpg' },
  { name: 'Swati Banerjee', image: '/assets/students/swati-banerjee.jpeg' },
  { name: 'Krishna Nair', image: '/assets/students/krishna-nair.jpg' },
  { name: 'Daaman Kaushal', image: '/assets/students/daaman-kaushal.jpg' },
  { name: 'Viraj Aditya', image: '/assets/students/viraj-aditya.jpg' },
  { name: 'Anugra Anna Shaju', image: '/assets/students/anugra-anna-shaju.jpeg' },
  { name: 'Anaika Martin', image: '/assets/students/anaika-martin.jpg' },
  { name: 'Shivam Kumar Mishra', image: '/assets/students/shivam-kumar-mishra.jpg' },
  { name: 'Ananya Malaviya ', image: '/assets/students/ananya-malaviya.jpeg' },
  { name: 'Smarak Samal', image: '/assets/students/smarak-samal.jpg' },
  { name: 'Mohnish Solanki', image: '/assets/students/mohnish-solanki.jpg' },
  { name: 'Ankita Kamath', image: '/assets/students/ankita-kamath.jpg' },
  { name: 'Shivam Patel', image: '/assets/students/shivam-patel.jpg' },
  { name: 'Harshita Tyagi', image: '/assets/students/harshita-tyagi.jpg' },
  { name: 'Kathi Thriveni', image: '/assets/students/kathi-thriveni.jpg' },
  { name: 'Manya Thapliyal', image: '/assets/students/manya-thapliyal.jpeg' },
  { name: 'Rishi Saraf', image: '/assets/students/rishi-saraf.jpg' },
  { name: 'Shreyas Rao A', image: '/assets/students/shreyas-rao-a.jpeg' },
  { name: 'Varun Ahuja', image: '/assets/students/varun-ahuja.jpg' },
  { name: 'Smita Gupta', image: '/assets/students/smita-gupta.JPG' },
  { name: 'Abhishek Anand', image: '/assets/students/abhishek-anand.jpg' },
  { name: 'Mahi Jaiswal', image: '/assets/students/mahi-jaiswal.jpg' },
  { name: 'Nikita Bansal', image: '/assets/students/nikita-bansal.jpg' },
  { name: 'Biswajeet Mishra', image: '/assets/students/biswajeet-mishra.jpg' },
  { name: 'Gunjan Rathore', image: '/assets/students/gunjan-rathore.jpg' },
  { name: 'Vidit Parmar', image: '/assets/students/vidit-parmar.jpg' },
  { name: 'Sneha Rath', image: '/assets/students/sneha-rath.jpg' },
  { name: 'Parv Pancholi', image: '/assets/students/parv-pancholi.png' },
  { name: 'Piyush Sinha', image: '/assets/students/piyush-sinha.jpg' },
  { name: 'Prakhar Gupta', image: '/assets/students/prakhar-gupta.jpg' },
  { name: 'Ishita Khandelwal', image: '/assets/students/ishita-khandelwal.jpg' },
  { name: 'Nisha Munshi', image: '/assets/students/nisha-munshi.jpg' },
  { name: 'Ashna D', image: '/assets/students/ashna-d.JPEG' }
];

const datasets = [
  { name: 'View Datasets', url: 'https://justicehub.in/dataset?groups=khoj' },
  { name: 'Download Datasets', url: 'https://github.com/justicehub-in/know-your-high-court-judges/raw/main/data/final-files/khoj-data-package.zip' },
  { name: 'About KHOJ (Methodology)', url: 'https://justicehub-in.github.io/know-your-high-court-judges/docs/KHOJ%20Final%20Booklet.pdf' },
  { name: 'Data Codebook', url: 'https://justicehub.in/dataset/khoj-india/resource/fa59eb2e-04a5-461f-94e3-1367f67c3a8c' },
  { name: 'Data Insights', url: 'https://justicehub-in.github.io/know-your-high-court-judges/scripts/data-publishing.html' },
  { name: 'Code Repository', url: 'https://github.com/justicehub-in/know-your-high-court-judges' },
];

const resources = [
  {
    name: 'My Introduction to the World of Data: Summer of Data by Justice Hub',
    url: 'https://medium.com/@banerjeeswati08b/my-introduction-to-the-world-of-data-summer-of-data-by-justice-hub-90351909a489'
  },
  {
    name: 'Who is a Judge? Solving the Problem of Insufficiency of Judicial Data',
    url: 'https://www.barandbench.com/apprentice-lawyer/who-is-a-judge-insufficiency-of-judicial-data'
  },
  {
    name: 'Discussion Forum',
    url: 'https://forum.justicehub.in/t/queries-around-accessing-the-summer-of-data-datasets/120'
  }
];



function urlTemplate(dataset, className) {
  return `
    <a class="${className}" href="${dataset.url}" target="_blank">
      ${dataset.name}
    </a>
  `;
}

function studentTemplate(student) {
  return `
    <div class="member">
      <div>
        <img src="${student.image}" alt="${student.name}" />
      </div>
      <p>${student.name}</p>
    </div>
  `;
}

const studentsContainer = document.querySelector('.students-container');
const mentorsContainer = document.querySelector('.mentors-container');
const datasetsContainer = document.querySelector('.datasets-container');
const resourcesContainer = document.querySelector('.resources-container');

students
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .forEach((student) => (studentsContainer.innerHTML += studentTemplate(student)));
datasets.forEach((dataset) => (datasetsContainer.innerHTML += urlTemplate(dataset, 'student-dataset')));
resources.forEach((resource) => (resourcesContainer.innerHTML += urlTemplate(resource, 'resource-link')));


