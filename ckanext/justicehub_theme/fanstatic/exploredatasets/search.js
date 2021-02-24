(function () {
  const params = new URLSearchParams(window.location.search);
  const activeGroup = params.get('groups');

  const linkElements = document.querySelectorAll('.category-link');

  linkElements.forEach((element) => {
    const group = element.innerHTML.toLowerCase().split(' ').join('-');
    if (group === activeGroup) {
      element.style.borderColor = 'var(--primary-color)';
      element.style.color = 'var(--primary-color)';
    }
  });
})();
