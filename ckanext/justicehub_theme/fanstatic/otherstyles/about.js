const members = [
  { name: 'Abhinav Singh', image: '/assets/team/abhinav.png' },
  { name: 'Akhil Sagiraju', image: '/assets/team/akhil.jpeg' },
  { name: 'Apoorv Anand', image: '/assets/team/apoorv.png' },
  { name: 'Gaurav Godhwani', image: '/assets/team/gaurav.jpg' },
  { name: 'Saurabh Karn', image: '/assets/team/saurabh.jpg' },
  { name: 'Shashank Sharma', image: '/assets/team/shashank.jpg' },
  { name: 'Supriya Sankaran', image: '/assets/team/supriya.jpg' },
  { name: 'Varun Hemachandran', image: '/assets/team/varun.jpg' }
];

function teamTemplate(member) {
  return `
    <div class="member">
      <div>
        <img src="${member.image}" alt="${member.name}" />
      </div>
      <p>${member.name}</p>
    </div>
  `;
}

const teamContainer = document.querySelector('.team-members-container');

members.forEach((member) => (teamContainer.innerHTML += teamTemplate(member)));
