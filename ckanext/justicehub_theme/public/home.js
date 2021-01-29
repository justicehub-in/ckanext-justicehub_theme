(function () {

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
    document.getElementById('side-nav').style.marginLeft = '0';
    document.getElementById('side-nav').style.paddingLeft = '25px';
    document.body.style.backgroundColor = 'rgba(0,0,0,0.5)';
    document.body.style.overflowY = 'hidden';
  }
  function closeNav() {
    document.getElementById('side-nav').style.marginLeft = '-280px';
    document.getElementById('side-nav').style.paddingLeft = '0';
    document.body.style.backgroundColor = '';
    document.body.style.overflowY = '';
  }

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
    }
    else {
      this.style.boxShadow = 'none';
    }
  }, 500);

  passwordField.addEventListener('keydown', passwordValidator);
})();
