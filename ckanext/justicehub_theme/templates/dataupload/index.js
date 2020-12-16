import DataUploadSteps from './dataUploadSteps.js';
import Dataset from './dataset.js';

const dataUploadSteps = new DataUploadSteps();
const dataset = new Dataset();

const dataUploadSections = document.querySelectorAll('.data-upload-section');
const stepIndicators = document.querySelectorAll('.step-indicator');

// functions to update DOM

function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function updateActiveSectionDOM() {
  scrollToTop();
  dataUploadSections.forEach((section) => {
    if (section.classList.contains(dataUploadSteps.activeStep.section)) {
      section.classList.remove('hide');
    } else {
      section.classList.add('hide');
    }
  });

  stepIndicators.forEach((step) => {
    if (parseInt(step.dataset.value) === dataUploadSteps.activeStep.id) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

// next and previous buttons' click handlers

const nextButtons = document.querySelectorAll('.next-button');
const previousButtons = document.querySelectorAll('.previous-button');

nextButtons.forEach((button) => {
  button.addEventListener('click', () => {
    dataUploadSteps.goToNextStep(updateActiveSectionDOM);
  });
});

previousButtons.forEach((button) => {
  button.addEventListener('click', () => {
    dataUploadSteps.goToPreviousStep(updateActiveSectionDOM);
  });
});

// step indicator click handlers

stepIndicators.forEach((step) => {
  step.addEventListener('click', () => {
    dataUploadSteps.setActiveStep(parseInt(step.dataset.value), updateActiveSectionDOM);
  });
});

// file upload handler

const fileInputs = document.querySelectorAll('input[type="file"]');

const addMoreFilesButton = document.querySelector('.add-more--files');

function generateFileUploadField(fileId) {
  return `
    <div class="file-upload" id="${fileId}">
      <div class="file-upload__name">
        <div class="upload-box">
          <input type="file" />
          <span class="iconify" data-icon="fe:upload" data-inline="false"></span>
        </div>
        <div class="name-field">
          <h4>Name of the file</h4>
          <input type="text" class="form-control" id="fileNameField" />
        </div>
      </div>
      <div class="file-upload__description">
        <h4>Description</h4>
        <textarea class="form-control" cols="25" rows="5"></textarea>
      </div>
    </div>
  `;
}

addMoreFilesButton.addEventListener('click', () => {
  const fileUploadForm = document.querySelector('.data-upload-section__form__field--file');
  fileUploadForm.innerHTML = fileUploadForm.innerHTML + generateFileUploadField(Math.random());
});

fileInputs.forEach((fileInput) => {
  fileInput.addEventListener('change', autoPopulateFileName);
});

function autoPopulateFileName(event) {
  const file = event.target.files[0];
  const correspondingFileNameInput = this.parentElement.nextSibling.nextSibling.querySelector('input');
  correspondingFileNameInput.value = file.name;
}

// author section handlers
const addAuthorsButton = document.querySelector('.add-more--authors');
function generateAuthorField(publisherType) {
  return `
    <div class="item-addition item-addition--author">
      <div class="item-addition__name-field">
        <h5>${publisherType}'s name</h5>
        <input type="text" class="form-control" />
      </div>
      <div class="item-addition__email-field">
        <h5>Email of ${publisherType} (optional)</h5>
        <input type="email" class="form-control" />
      </div>
    </div>
  `;
}

addAuthorsButton.addEventListener('click', () => {
  const authorAdditionForm = document.querySelector('.data-upload-section__form__field--authors');
  const publisherType = getRadioValue('primary-publisher') === 'individual' ? 'Author' : 'Organization';
  authorAdditionForm.innerHTML = authorAdditionForm.innerHTML + generateAuthorField(publisherType);
});

// data relevancy handlers

const regionRadioOptions = document.querySelectorAll(`input[name="region-options"]`);
const otherStatesInput = document.getElementById('otherStatesInput');
const otherCountriesInput = document.getElementById('otherCountriesInput');
regionRadioOptions.forEach((option) =>
  option.addEventListener('click', (event) => {
    if (event.target.checked && event.target.value === 'Partial India') {
      otherStatesInput.style.display = 'inline-block';
      otherCountriesInput.style.display = 'none';
    } else if (event.target.checked && event.target.value === 'Other countries') {
      otherStatesInput.style.display = 'none';
      otherCountriesInput.style.display = 'inline-block';
    } else {
      otherStatesInput.style.display = 'none';
      otherCountriesInput.style.display = 'none';
    }
  })
);

const languageRadioOptions = document.querySelectorAll(`input[name="language-options"]`);
languageRadioOptions.forEach((option) =>
  option.addEventListener('click', (event) => {
    if (event.target.checked && event.target.value === 'other') {
      document.getElementById('otherLanguageInput').style.display = 'inline-block';
    } else {
      document.getElementById('otherLanguageInput').style.display = 'none';
    }
  })
);

// document.getElementById('other').onclick = function () {
//   console.log('helo');
//   document.getElementById('otherLanguageInput').style.display = 'block';
// };

// references handlers
const addReferencesButton = document.querySelector('.add-more--references');
function generateReferenceField(referenceId) {
  return `
    <div class="item-addition item-addition--reference" id="${referenceId}">
      <div class="item-addition__link-field">
        <h5>Paste Link</h5>
        <input type="text" class="form-control" />
      </div>
      <div class="item-addition__title-field">
        <h5>Give your link a title</h5>
        <input type="text" class="form-control" />
      </div>
    </div>
  `;
}

addReferencesButton.addEventListener('click', () => {
  const referenceAdditionForm = document.querySelector('.data-upload-section__form__field--references');
  referenceAdditionForm.innerHTML = referenceAdditionForm.innerHTML + generateReferenceField(Math.random());
});

// add months options into months dropdowns

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

let monthOptions = '';

MONTHS.forEach((month) => {
  monthOptions = monthOptions + `<option value="${month}">${month}</option>`;
});

const monthDropdowns = document.querySelectorAll('.months-select');
monthDropdowns.forEach((dropdown) => {
  dropdown.innerHTML = monthOptions;
});

// license options

const LICENSES = [
  { name: 'CC0 License', description: 'Can be freely shared, modified, and distributed by anyone' },
  { name: 'CCBY License', description: 'Can be used freely by all but must credit the source' },
  { name: 'Public Sharing Licence', description: 'Anyone share it but not edit the contents' },
  { name: 'Copyrights Licence', description: 'Cannot be shared or modified' },
  { name: 'Non-Commercial Licence', description: 'Can be used only for personal projects not seeking profit' }
];

function generateLicenseOptionHTML(license) {
  return `
    <optgroup label="${license.description}">
      <option value="${license.name}">${license.name}</option>
    </optgroup>
  `;
}

const licenseSelect = document.getElementById('licenseSelect');

let licenseOptions = '';

LICENSES.forEach((license) => {
  licenseOptions = licenseOptions + generateLicenseOptionHTML(license);
});

licenseSelect.innerHTML = licenseOptions;

// proceed from file upload
const proceedFromFilesButton = document.querySelector('#proceedFromFilesButton');
proceedFromFilesButton.addEventListener('click', () => {
  dataset.updateProperty('name', getValueFromInputSelector('#datasetNameField'));
  const fileUploads = document.querySelectorAll('.file-upload');
  fileUploads.forEach((file) => {
    dataset.addItemToListProperty('files', getFileDetailsFromFileUploadElement(file));
  });
});

// proceed from ownership
const proceedFromOwnershipButton = document.querySelector('#proceedFromOwnershipButton');
proceedFromOwnershipButton.addEventListener('click', () => {
  const selectedLicense = getValueFromInputSelector('#licenseSelect');
  const licenseDescription = LICENSES.find((license) => license.name === selectedLicense).description;
  dataset.updateProperty('license', {
    licenseName: selectedLicense,
    licenseDescription: licenseDescription
  });
  dataset.updateProperty('viewPermission', getRadioValue('view-permissions'));
  const authors = document.querySelectorAll('.item-addition--author');
  let publisher = { type: '', authors: [] };
  publisher.type = getRadioValue('primary-publisher');
  authors.forEach((author) => {
    publisher.authors.push(getAuthorDetailsFromAuthorAdditionElement(author));
  });
  dataset.updateProperty('publisher', publisher);
});

// proceed from data relevancy
const proceedFromRelevancyButton = document.querySelector('#proceedFromRelevancyButton');
proceedFromRelevancyButton.addEventListener('click', () => {
  const language =
    getRadioValue('language-options') === 'other'
      ? getValueFromInputSelector('#otherLanguageInput')
      : getRadioValue('language-options');
  dataset.updateProperty('language', language);
  const region = { country: getRadioValue('region-options'), subRegions: [] };
  dataset.updateProperty('region', region);
  dataset.updateProperty('timePeriod', {
    from: getTimePeriodDetailsFromSelector('.period--from'),
    to: getTimePeriodDetailsFromSelector('.period--to')
  });
});

// preview button updates the dataset info

function getValueFromInputSelector(inputSelector, element = document) {
  return element.querySelector(inputSelector).value;
}

function getRadioValue(name) {
  let value;
  const allRadioOptions = document.querySelectorAll(`input[name="${name}"]`);
  allRadioOptions.forEach((option) => {
    if (option.checked) {
      value = option.value;
      return;
    }
  });
  return value;
}

function getFileDetailsFromFileUploadElement(fileUploadElement) {
  return {
    file: fileUploadElement.querySelector('input[type="file"]').files[0],
    fileName: getValueFromInputSelector('.name-field input', fileUploadElement),
    fileDescription: getValueFromInputSelector('.file-upload__description textarea', fileUploadElement),
    fileId: `${Math.random()}`
  };
}

function getReferenceLinksFromReferenceElement(referenceElement) {
  return {
    link: getValueFromInputSelector('.item-addition__link-field input', referenceElement),
    title: getValueFromInputSelector('.item-addition__title-field input', referenceElement)
  };
}

function getAuthorDetailsFromAuthorAdditionElement(authorElement) {
  return {
    authorName: getValueFromInputSelector('.item-addition__name-field input', authorElement),
    authorEmail: getValueFromInputSelector('.item-addition__email-field input', authorElement)
  };
}

function getTimePeriodDetailsFromSelector(timePeriodSelector) {
  return {
    month: getValueFromInputSelector(`${timePeriodSelector} select`),
    year: getValueFromInputSelector(`${timePeriodSelector} input`)
  };
}

const previewButton = document.querySelector('#previewButton');

// break this into multiple functions and call them upon clicking proceed at each section

previewButton.addEventListener('click', () => {
  dataset.updateProperty('keywords', getValueFromInputSelector('#keywordsInput').split(','));
  dataset.updateProperty('sources', getValueFromInputSelector('#sourcesInput').split(','));
  const references = document.querySelectorAll('.item-addition--reference');
  references.forEach((reference) => {
    dataset.addItemToListProperty('referenceLinks', getReferenceLinksFromReferenceElement(reference));
  });

  const dataRelevancyPreviewTableHTML = `
    <tr>
      <td>Region(s) covered:</td>
      <td>${dataset.region.country}</td>
    </tr>
    <tr>
      <td>Time period covered:</td>
      <td>${dataset.timePeriod.from.month} ${dataset.timePeriod.from.year} - ${dataset.timePeriod.to.month} ${dataset.timePeriod.to.year}</td>
    </tr>
    <tr>
      <td>Language:</td>
      <td>${dataset.language}</td>
    </tr>
  `;

  const ownershipPreviewTableHTML = `
    <tr>
      <td>Licensing permissions:</td>
      <td>(${dataset.license.licenseName}) ${dataset.license.licenseDescription}</td>
    </tr>
    <tr>
      <td>Viewing Permissions:</td>
      <td>${dataset.viewPermission}</td>
    </tr>
    <tr>
      <td>Primary Author(s): </td>
      <td>${dataset.publisher.type}</td>
    </tr>
  `;

  const sourcePreviewTableHTML = `
    <tr>
      <td>Keywords:</td>
      <td>${dataset.keywords.join(', ')}</td>
    </tr>
    <tr>
      <td>Data Source(s):</td>
      <td>${dataset.sources.join(', ')}</td>
    </tr>
    <tr>
      <td>Reference Links:</td>
      <td>${dataset.referenceLinks[0].title} - ${dataset.referenceLinks[0].link}</td>
    </tr>
  `;
  // change the references links to get all the items

  document.querySelector('#dataRelevancyPreviewTable').innerHTML = dataRelevancyPreviewTableHTML;
  document.querySelector('#ownershipPreviewTable').innerHTML = ownershipPreviewTableHTML;
  document.querySelector('#sourcePreviewTable').innerHTML = sourcePreviewTableHTML;

  document.querySelector('#datasetNameOnPreviewModal').innerHTML = dataset.name;

  console.log(dataset);
});

const submitDatasetButton = document.getElementById('submitDatasetButton');
submitDatasetButton.addEventListener('click', () => {
  postDatasetRequest('http://localhost:5000');
});

const saveAsDatasetButtons = document.querySelectorAll('.draft-button');
saveAsDatasetButtons.forEach((button) =>
  button.addEventListener('click', () => {
    postDatasetRequest('http://localhost:5000', (state = 'draft'));
  })
);

function getCookie(name) {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=');
    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function postDatasetRequest(baseUrl, state = 'active') {
  fetch(`${baseUrl}/api/dataset/new`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Cookie: getCookie('auth_tkn')
    },
    body: {
      title: dataset.name,
      license_id: dataset.license.licenseName,
      private: dataset.viewPermission === 'Anyone' ? false : true,
      publisher_type: dataset.publisher.type,
      language: dataset.language,
      tag_string: dataset.keywords.join(','),
      source: dataset.sources.join(','),
      dataset_state: state
    }
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      fetch(`${baseUrl}/api/dataset/${pkg_name}/resource/new`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Cookie: getCookie('auth_tkn')
        },
        body: {
          upload: dataset.files[0].file,
          name: dataset.files[0].fileName,
          description: dataset.files[0].fileDescription
        }
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
}
