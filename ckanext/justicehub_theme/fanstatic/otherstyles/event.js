const students = [
  { name: 'Shaswata Kapat', image: '' },
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

const mentors = [
  {
    name: 'Prof. Rangin Pallav Tripathy',
    org: 'NLU, Odisha',
    image: '/assets/events/rangin.jpg',
    description:
      'Rangin has been teaching at National Law University Odisha since 2010 and works in the area of constitutional governance, civil liberties, criminal law and human rights. His current research focuses on the functioning of institutions within constitutional democracies and the way they affect realization of democratic rights. He was a Fulbright Post-Doctoral Research Scholar at Harvard Law School (2019-2020).'
  },
  {
    name: 'Apoorv Anand',
    org: 'CivicDataLab',
    image: '/assets/team/apoorv.png',
    description:
      'Apoorv works with CivicDataLab and is part of the Justice Hub team where his role is to find collaboration opportunities that seek to bridge the gap between the demand and supply of key datasets. Currently, he is figuring out ways to build simple and robust data standards for curating open datasets that can aid in the research and analysis of key indicators around Law and Justice. '
  },
  {
    name: 'Gaurav Godhwani',
    org: 'CivicDataLab',
    image: '/assets/team/gaurav.jpg',
    description:
      'Gaurav Godhwani is co-founder and director at CivicDataLab - a research lab harnessing data, tech, design and social science to strengthen the course of civic engagements in India. He works to leverage the open-source movement to enable citizens in engaging better with public reforms.He has been instrumental in starting initiatives like DataKind Bangalore & Open Budgets India. He is focused to grow open data and FOSS innovations in sectors like Public Finance, Law & Justice, Urban Planning and more. '
  },
  { name: 'Saurabh Karn', org: 'Agami', image: '/assets/team/saurabh.jpg', description: '' }
];

const datasets = [
  {
    name: 'Chattisgarh High Court',
    url: 'https://justicehub.in/dataset/dataset-on-judges-of-the-chhattisgarh-high-court'
  },
  {
    name: 'Himachal Pradesh High Court',
    url: 'https://justicehub.in/dataset/groups/dataset-on-judges-of-the-himachal-pradesh-high-court'
  },
  { name: 'Madras High Court', url: 'https://justicehub.in/dataset/dataset-on-judges-of-the-madras-high-court' }
];

const resources = [
  {
    name: 'My Introduction to the World of Data: Summer of Data by Justice Hub',
    url: 'https://medium.com/@banerjeeswati08b/my-introduction-to-the-world-of-data-summer-of-data-by-justice-hub-90351909a489'
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

function mentorTemplate(mentor) {
  return `
    <div class="mentor col-md-3 col-sm-6 col-xs-12" data-toggle="tooltip" data-placement="bottom" title="${mentor.description}">
      <div class="mentor__header">
        <img src="${mentor.image}" alt="${mentor.name}" />
        <div>
          <h5>${mentor.name}</h5>
          <p>${mentor.org}</p>
        </div>
      </div>
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
mentors.forEach((mentor) => (mentorsContainer.innerHTML += mentorTemplate(mentor)));
datasets.forEach((dataset) => (datasetsContainer.innerHTML += urlTemplate(dataset, 'student-dataset')));
resources.forEach((resource) => (resourcesContainer.innerHTML += urlTemplate(resource, 'resource-link')));
