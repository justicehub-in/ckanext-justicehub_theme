(function () {
  // Code for adding contributors to the homepage

  const contributors = [
    { name: `Indian Kanoon`, imagePath: '/assets/contributors/indiankanoon.png' },
    { name: `HAQ`, imagePath: '/assets/contributors/haq.png' },
    { name: `Project 39A`, imagePath: '/assets/contributors/P39A.png' },
    { name: `Vidhi`, imagePath: '/assets/contributors/vidhi.jpg' },
    { name: `CHRI`, imagePath: '/assets/contributors/chri.png' },
    { name: `NIPFP`, imagePath: '/assets/contributors/nipfp.png' },
    { name: `CLPR`, imagePath: '/assets/contributors/clpr.svg' },
    { name: `IDFC`, imagePath: '/assets/contributors/idfc.svg' },
    { name: `Tata Trusts`, imagePath: '/assets/contributors/tata.png' },
    { name: `DevDataLab`, imagePath: '/assets/contributors/ddl.png' },
    { name: `Studio Nilima`, imagePath: '/assets/contributors/studio-nilima.jpg' },
    { name: `Internet Freedom Foundation`, imagePath: '/assets/contributors/iff.png' },
    { name: `Madhav S Aney`, type: 'person', imagePath: '/assets/contributors/madhav.jpg' },
    { name: `Manaswini Rao`, type: 'person', imagePath: '/assets/contributors/rao.jpg' },
    { name: `Johannes Boehm`, type: 'person', imagePath: '/assets/contributors/boehm.jpg' },
    { name: `Amrit Amirapu`, type: 'person', imagePath: '/assets/contributors/amirapu.JPG' }
  ];

  function contributorTemplate(contributor) {
    return `
      <div class="contributor-info ${contributor.type ? contributor.type : ''}">
        <div>
          <img src="${contributor.imagePath}" alt="${contributor.name}" />
        </div>
        ${contributor.type === 'person' ? `<p>${contributor.name}</p>` : ``}
      </div>
    `;
  }

  const individualContributors = contributors.filter((contributor) => contributor.type === 'person');

  const orgContributors = contributors.filter((contributor) => !contributor.type);

  const individualContributorsRow = document.querySelector('.contributors-row--individual');
  const orgContributorsRow = document.querySelector('.contributors-row--org');

  individualContributors.forEach(
    (contributor) =>
      (individualContributorsRow.innerHTML +=  contributorTemplate(contributor))
  );

  orgContributors.forEach(
    (contributor) =>
      (orgContributorsRow.innerHTML += contributorTemplate(contributor))
  );

  const switchToSignIn = document.querySelector('.click-to-login');
  const switchToSignUp = document.querySelector('.click-to-signup');
  const switchToForgot = document.querySelector('.click-to-forgot');

  switchToSignIn.addEventListener('click', () => {
    $('#signUpModal').removeClass('fade').modal('hide');
    $('#signInModal').addClass('fade').modal('show');
  });

  switchToSignUp.addEventListener('click', () => {
    $('#signInModal').removeClass('fade').modal('hide');
    $('#signUpModal').addClass('fade').modal('show');
  });

  switchToForgot.addEventListener('click', () => {
    $('#signInModal').removeClass('fade').modal('hide');
    $('#signUpModal').removeClass('fade').modal('hide');
    $('#forgotPasswordModal').addClass('fade').modal('show');
  });

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  const passwordRegex = new RegExp(/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/);

  const passwordField = document.querySelector('input[type="password"]');

  const passwordValidator = debounce(function () {
    if (!passwordRegex.test(this.value)) {
      this.style.boxShadow = 'rgb(255, 0, 0) 0px 0px 1.5px 1px';
    } else {
      this.style.boxShadow = 'none';
    }
  }, 500);

  passwordField.addEventListener('keydown', passwordValidator);
})();
