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
function generateAuthorField(authorId) {
  return `
    <div class="item-addition item-addition--author" id="${authorId}">
      <div class="item-addition__name-field">
        <h5>Author's name</h5>
        <input type="text" class="form-control" />
      </div>
      <div class="item-addition__email-field">
        <h5>Email of author</h5>
        <input type="email" class="form-control" />
      </div>
    </div>
  `;
}

addAuthorsButton.addEventListener('click', () => {
  const authorAdditionForm = document.querySelector('.data-upload-section__form__field--authors');
  authorAdditionForm.innerHTML = authorAdditionForm.innerHTML + generateAuthorField(Math.random());
});

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

const months = [
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

months.forEach((month) => {
  monthOptions = monthOptions + `<option value="${month}">${month}</option>`;
});

const monthDropdowns = document.querySelectorAll('.months-select');
monthDropdowns.forEach((dropdown) => {
  dropdown.innerHTML = monthOptions;
});

// proceed from file upload
const proceedFromFilesButton = document.querySelector('#proceedFromFilesButton');
proceedFromFilesButton.addEventListener('click', () => {
  dataset.updateProperty('name', getValueFromInputSelector('#datasetNameField'));
  const fileUploads = document.querySelectorAll('.file-upload');
  fileUploads.forEach((file) => {
    dataset.addItemToListProperty('files', getFileDetailsFromFileUploadElement(file));
  });

  console.log(dataset);
});

// proceed from ownership
const proceedFromOwnershipButton = document.querySelector('#proceedFromOwnershipButton');
proceedFromOwnershipButton.addEventListener('click', () => {
  dataset.updateProperty('license', {
    licenseName: '1',
    licenseDescription: getValueFromInputSelector('#licenseSelect')
  });
  dataset.updateProperty('viewPermission', getRadioValue('view-permissions'));
  const authors = document.querySelectorAll('.item-addition--author');
  let publisher = { type: '', authors: [] };
  publisher.type = getRadioValue('primary-publisher');
  authors.forEach((author) => {
    publisher.authors.push(getAuthorDetailsFromAuthorAdditionElement(author));
  });
  dataset.updateProperty('publisher', publisher);

  console.log(dataset);
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
  dataset.updateProperty('language', getRadioValue('language-options'));
  const region = { country: getRadioValue('region-options'), subRegions: [] };
  dataset.updateProperty('region', region);
  dataset.updateProperty('timePeriod', {
    from: getTimePeriodDetailsFromSelector('.period--from'),
    to: getTimePeriodDetailsFromSelector('.period--to')
  });

  dataset.updateProperty('keywords', getValueFromInputSelector('#keywordsInput').split(','));
  dataset.updateProperty('sources', getValueFromInputSelector('#sourcesInput').split(','));
  const references = document.querySelectorAll('.item-addition--reference');
  references.forEach((reference) => {
    dataset.addItemToListProperty('referenceLinks', getReferenceLinksFromReferenceElement(reference));
  });

  console.log(dataset);
});
