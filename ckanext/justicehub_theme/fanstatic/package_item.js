const datasetStatusChangeDropdowns = document.querySelectorAll('.dataset-status-change');

datasetStatusChangeDropdowns.forEach((dropdown) => {
  dropdown.addEventListener('change', (event) => {
    const pkgDetails = event.target.value.split(',');
    const pkgName = pkgDetails[0];
    const pkgState = pkgDetails[1];
    const requestBody = { name: pkgName, state: pkgState };
    console.log(requestBody);

    const fullURL = window.location.href;
    const splitURL = fullURL.split('/');

    const BASE_URL = `${splitURL[0]}//${splitURL[2]}`;

    fetch(`${BASE_URL}/api/dataset/status`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then((response) => {
        response
          .json()
          .then(() => {
            if (confirm(`Status updated successfully! Please click OK.`)) {
              window.location.reload();
            }
          })
          .catch(() => {
            alert('Sorry, that did not work. Please try again.');
          });
      })
      .catch(() => {
        alert('Sorry, that did not work. Please try again.');
      });
  });
});
