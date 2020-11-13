(function () {
  const categoriesRow = document.querySelector('.categories__row');

  const categories = [
    { name: 'Courts', icon: '/assets/icons/courts.svg' },
    { name: 'Policing', icon: '/assets/icons/policing.svg' },
    { name: 'Corporate', icon: '/assets/icons/corporate.svg' },
    { name: 'Child Rights', icon: '/assets/icons/childrights.svg' },
    { name: 'Land Rights', icon: '/assets/icons/landrights.svg' },
    { name: 'Education', icon: '/assets/icons/education.svg' },
    { name: 'Health', icon: '/assets/icons/health.svg' },
    { name: 'Economy', icon: '/assets/icons/economy.svg' },
    { name: 'Migration', icon: '/assets/icons/migration.svg' },
    { name: 'Legal Aid', icon: '/assets/icons/legalaid.svg' },
    { name: 'Human Rights', icon: '/assets/icons/humanrights.svg' },
    { name: 'Consititution', icon: '/assets/icons/constitution.svg' }
  ];

  function categoryTemplate(category) {
    return `
      <div class="col-lg-3 col-md-4 col-sm-4 col-xs-4 category-item">
        <div class="icon-container">
          <img src="${category.icon}" alt="${category.name}" />
        </div>
        <p>${category.name}</p>
      </div>
    `;
  }

  categories.forEach((category) => (categoriesRow.innerHTML += categoryTemplate(category)));

  // Code for adding contributors to the homepage

  const contributors = [
    { name: `AKP Legal`, imagePath: '/assets/company_1.png' },
    { name: `Legal Check`, imagePath: '/assets/company_2.png' },
    { name: `Marcelo D'Cruz`, imagePath: '/assets/person_1.png' },
    { name: `Pavithra K`, imagePath: '/assets/person_2.png' }
  ];

  function contributorTemplate(contributor) {
    return `
    <div class="col-lg-3 col-md-3 col-sm-3 col-xs-6">
      <div class="contributor-info">
        <img src="${contributor.imagePath}" alt="${contributor.name}" />
        <p>${contributor.name}</p>
      </div>
    </div>
    `;
  }

  const contributorsRow = document.querySelector('.contributors-row');

  contributors.forEach((contributor) => (contributorsRow.innerHTML += contributorTemplate(contributor)));

  const mobileMenu = document.querySelector('.mobile-menu');
  const closeNavButton = document.querySelector('.closebtn');

  mobileMenu.addEventListener('click', openNav);
  closeNavButton.addEventListener('click', closeNav);

  function openNav() {
    document.getElementById('side-nav').style.width = '280px';
    document.getElementById('side-nav').style.paddingLeft = '25px';
    document.body.style.backgroundColor = "rgba(0,0,0,0.5)";
    document.body.style.overflowY = "hidden";
  }
  function closeNav() {
    document.getElementById('side-nav').style.width = '0';
    document.getElementById('side-nav').style.paddingLeft = '0';
    document.body.style.backgroundColor = "";
    document.body.style.overflowY = "";
  }
})();
