import DataUploadSteps from './dataUploadSteps.js';
import Dataset from './dataset.js';

(function () {
  const fullURL = window.location.href;
  const splitURL = fullURL.split('/');

  const BASE_URL = `${splitURL[0]}//${splitURL[2]}`;

  const dataUploadSteps = new DataUploadSteps();
  const dataset = new Dataset();

  function isEditMode() {
    return splitURL.indexOf('edit') > 0;
  }

  let receivedResources = [];
  let receivedResourcesIds = [];
  let resourcesByType = { added: [], deleted: [], updated: [] };
  let datasetIdName = '';

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
        return;
      }
      section.classList.add('hide');
    });

    stepIndicators.forEach((step) => {
      if (parseInt(step.dataset.value) === dataUploadSteps.activeStep.id) {
        step.classList.add('active');
      } else if (parseInt(step.dataset.value) < dataUploadSteps.activeStep.id) {
        step.classList.remove('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  function resetInput(event) {
    const fileInputToBeReset = event.target.parentElement;
    const textArea = fileInputToBeReset.querySelector('textarea');
    if (textArea) {
      textArea.value = '';
    }
    const allFields = fileInputToBeReset.querySelectorAll('input');
    allFields.forEach((field) => (field.value = ''));
    updateFileInputBackground(fileInputToBeReset.querySelector('.upload-box'), 'none');
  }

  // remove file inputs
  function removeFileInput(event) {
    if (event.target.classList.contains('reset-input')) {
      resetInput(event);
      return;
    } else if (event.target.classList.contains('remove-input')) {
      const fileInputToBeRemoved = event.target.parentElement;
      if (!fileInputToBeRemoved.parentElement) return;
      if (receivedResourcesIds.indexOf(fileInputToBeRemoved.id) > -1) {
        resourcesByType.deleted.push(fileInputToBeRemoved.id);
      }
      fileInputToBeRemoved.parentElement.removeChild(fileInputToBeRemoved);
    }
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

  // file upload section

  const FILEINPUT_ICONS = [
    {
      format: 'xlsx',
      backgroundColor: '#CEE1CE',
      icon: 'vscode-icons:file-type-excel2',
      iconTemplate: '<span class="iconify" data-icon="vscode-icons:file-type-excel2" data-inline="false"></span>'
    },
    {
      format: 'pdf',
      backgroundColor: '#F8BE67',
      icon: 'icomoon-free:file-pdf',
      iconTemplate: '<span class="iconify" data-icon="icomoon-free:file-pdf" data-inline="false"></span>'
    },
    {
      format: 'csv',
      backgroundColor: '#F8BE67',
      icon: 'grommet-icons:document-csv',
      iconTemplate: '<span class="iconify" data-icon="grommet-icons:document-csv" data-inline="false"></span>'
    },
    {
      format: 'none',
      backgroundColor: 'transparent',
      icon: 'fe:upload',
      iconTemplate: '<span class="iconify" data-icon="fe:upload" data-inline="false"></span>'
    },
    {
      format: 'unknown',
      backgroundColor: 'trasparent',
      icon: 'akar-icons:file',
      iconTemplate: '<span class="iconify" data-icon="akar-icons:file" data-inline="false"></span>'
    }
  ];

  function getFileUploadBoxPropertyByFileType(fileType, property) {
    if (FILEINPUT_ICONS.find((file) => file.format === fileType)) {
      return FILEINPUT_ICONS.find((file) => file.format === fileType)[property];
    }

    return FILEINPUT_ICONS.find((file) => file.format === 'unknown')[property];
  }

  function generateFileUploadField(fileId, fileName = '', fileDescription = '', fileFormat = '') {
    return `
    <div class="file-upload" id="${fileId}" data-format="${fileFormat}">
      <span class="iconify remove-input" data-icon="mdi:close" data-inline="false"></span>
      <div class="file-upload__name">
        <div class="upload-box">
          <input type="file" />
          <span class="iconify" data-icon="fe:upload" data-inline="false"></span>
        </div>
        <div class="name-field">
          <h4>Name of the file <span>(Upload a file to edit the name)</span></h4>
          <input type="text" class="form-control file-name" id="fileNameField" value="${fileName}" ${
      fileName ? '' : 'disabled'
    } />
        </div>
      </div>
      <div class="file-upload__description">
        <h4>Description</h4>
        <textarea class="form-control file-description" cols="25" rows="5">${fileDescription}</textarea>
      </div>
    </div>
  `;
  }

  const fileUploadContainer = document.querySelector('.data-upload-section__form__field--file');
  const addMoreFilesButton = document.querySelector('.add-more--files');

  addMoreFilesButton.addEventListener('click', () => {
    const numberOfFileInputs = document.querySelectorAll('.file-upload');
    if (numberOfFileInputs.length >= 30) return;
    fileUploadContainer.insertAdjacentHTML('beforeend', generateFileUploadField(`added-${Math.random()}`));
  });

  fileUploadContainer.addEventListener('change', (event) => {
    // handle event bubbling
    if (!event.target.matches('input[type="file"]')) {
      return;
    }
    fileInputHandler(event);
  });

  fileUploadContainer.addEventListener('click', (event) => removeFileInput(event));

  function updateFileInputBackground(fileInputBackgroundElement, fileType) {
    if (fileType === 'none' && fileInputBackgroundElement) {
      fileInputBackgroundElement.style.border = '1px dashed #F65940';
    }
    fileInputBackgroundElement.style.border = '1px solid #524F4F';
    fileInputBackgroundElement.style.backgroundColor = getFileUploadBoxPropertyByFileType(fileType, 'backgroundColor');
    fileInputBackgroundElement.removeChild(fileInputBackgroundElement.querySelector('.iconify'));
    fileInputBackgroundElement.insertAdjacentHTML(
      'beforeend',
      getFileUploadBoxPropertyByFileType(fileType, 'iconTemplate')
    );
  }

  function fileInputHandler(event) {
    const file = event.target.files[0];
    const fileInputBackground = event.target.parentElement;
    if (file.type.indexOf('csv') > -1) {
      updateFileInputBackground(fileInputBackground, 'csv');
    } else if (file.type.indexOf('spreadsheetml') > -1) {
      updateFileInputBackground(fileInputBackground, 'xlsx');
    } else if (file.type.indexOf('pdf') > -1) {
      updateFileInputBackground(fileInputBackground, 'pdf');
    } else {
      updateFileInputBackground(fileInputBackground, 'unknown');
    }
    const correspondingFileNameInput = fileInputBackground.nextSibling.nextSibling.querySelector('input');
    correspondingFileNameInput.disabled = false;
    correspondingFileNameInput.value = file.name;
  }

  function updateDatasetWithValuesFromFilesSection() {
    dataset.updateProperty('files', []);
    dataset.updateProperty('name', getValueFromInputSelector('#datasetNameField'));

    if (!!getValueFromInputSelector('#datasetNameField')) {
      document.querySelector(".step-indicator[data-value='1']").classList.add('done');
    }

    const fileUploadInputs = document.querySelectorAll('.file-upload');
    fileUploadInputs.forEach((file) => {
      if (
        file.id.indexOf('added') > -1 ||
        (file.id.indexOf('file') > -1 && resourcesByType.added.indexOf(file.id) < 0)
      ) {
        resourcesByType.added.push(file.id);
        if (getFileDetailsFromFileUploadElement(file).fileName) {
          dataset.addItemToListProperty('files', getFileDetailsFromFileUploadElement(file));
        }
      } else if (receivedResourcesIds.indexOf(file.id) > -1) {
        const existingResourceDetails = receivedResources.find((resource) => resource.id === file.id);
        const currentFileDetails = getFileDetailsFromFileUploadElement(file);
        if (
          existingResourceDetails.name !== currentFileDetails.fileName ||
          existingResourceDetails.description !== currentFileDetails.fileDescription ||
          currentFileDetails.file
        ) {
          if (resourcesByType.updated.indexOf(file.id) < 0) {
            resourcesByType.updated.push(file.id);
          }
        }
      }
    });

    console.log(resourcesByType);
  }

  // const saveOnFilesSectionButton = document.getElementById('saveOnFilesSectionButton');
  // saveOnFilesSectionButton.addEventListener('click', () => {
  //   updateDatasetWithValuesFromFilesSection();
  //   postDatasetRequest('http://localhost:5000', 'draft');
  // });

  const proceedFromFilesButton = document.querySelector('#proceedFromFilesButton');
  proceedFromFilesButton.addEventListener('click', updateDatasetWithValuesFromFilesSection);

  // ownership section
  let authorAdditionForm = document.querySelector('.data-upload-section__form__field--authors');
  authorAdditionForm.addEventListener('click', (event) => {
    if (event.target.id === 'organizationRadio') {
      removeAllInputsOfAPublisherType('individual');
      authorAdditionForm.insertAdjacentHTML('beforeend', generateAuthorField('Organization'));
    } else if (event.target.id === 'individualRadio') {
      removeAllInputsOfAPublisherType('organization');
      authorAdditionForm.insertAdjacentHTML('beforeend', generateAuthorField('Author'));
    } else {
      removeFileInput(event);
    }
  });

  function removeAllInputsOfAPublisherType(type) {
    const targetInputs = document.querySelectorAll(`.item-addition--${type}`);
    targetInputs.forEach((input) => {
      input.parentNode.removeChild(input);
    });
  }

  const addMoreAuthorsButton = document.querySelector('.add-more--authors');
  function generateAuthorField(publisherType, name = '', email = '') {
    return `
    <div class="item-addition item-addition--author item-addition--${
      publisherType === 'Author' ? 'individual' : 'organization'
    }">
      <span class="iconify remove-input" data-icon="mdi:close" data-inline="false"></span>
      <div class="item-addition__name-field">
        <h5>${publisherType}'s name</h5>
        <input type="text" class="form-control" value="${name}" />
      </div>
      <div class="item-addition__email-field">
        <h5>Email of ${publisherType} (optional)</h5>
        <input type="email" class="form-control" value="${email}" />
      </div>
    </div>
  `;
  }

  addMoreAuthorsButton.addEventListener('click', () => {
    const publisherType = getRadioValue('primary-publisher') === 'individual' ? 'Author' : 'Organization';
    authorAdditionForm.insertAdjacentHTML('beforeend', generateAuthorField(publisherType));
  });

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
    licenseOptions += generateLicenseOptionHTML(license);
  });

  licenseSelect.innerHTML = licenseOptions;

  function updateDatasetWithValuesFromOwnershipSection() {
    dataset.updateProperty('publisher', {});
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
    if (!!publisher.authors) {
      document.querySelector(".step-indicator[data-value='2']").classList.add('done');
    }
    dataset.updateProperty('publisher', publisher);
  }

  // const saveOnOwnershipSectionButton = document.getElementById('saveOnOwnershipSectionButton');
  // saveOnOwnershipSectionButton.addEventListener('click', () => {
  //   updateDatasetWithValuesFromOwnershipSection();
  //   postDatasetRequest('http://localhost:5000', 'draft');
  // });

  const proceedFromOwnershipButton = document.getElementById('proceedFromOwnershipButton');
  proceedFromOwnershipButton.addEventListener('click', updateDatasetWithValuesFromOwnershipSection);

  // data relevancy section
  const regionRadioOptions = document.querySelectorAll(`input[name="region-options"]`);
  const statesMultiSelect = document.getElementById('multi-select-states');
  const otherCountriesInput = document.getElementById('otherCountriesInput');

  regionRadioOptions.forEach((option) =>
    option.addEventListener('click', (event) => {
      const nativeMultiSelect = document.querySelector('span.multiselect-native-select');
      const multiSelectToggle = document.querySelector('.multiselect.dropdown-toggle');
      if (event.target.checked && event.target.value === 'Partial India') {
        nativeMultiSelect.style.display = 'inline-block';
        multiSelectToggle.style.display = 'inline-block';
        otherCountriesInput.style.display = 'none';
      } else if (event.target.checked && event.target.value === 'Other countries') {
        nativeMultiSelect.style.display = 'none';
        multiSelectToggle.style.display = 'none';
        otherCountriesInput.style.display = 'inline-block';
      } else {
        nativeMultiSelect.style.display = 'none';
        multiSelectToggle.style.display = 'none';
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

  const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

  let monthOptions = '<option value="">--</option>';

  MONTHS.forEach((month) => {
    monthOptions = monthOptions + `<option value="${month}">${month}</option>`;
  });

  let stateOptions = '';
  INDIAN_STATES.forEach((state) => {
    stateOptions = stateOptions + `<option value="${state}">${state}</option>`;
  });

  statesMultiSelect.innerHTML = stateOptions;

  const monthDropdowns = document.querySelectorAll('.months-select');
  monthDropdowns.forEach((dropdown) => {
    dropdown.innerHTML = monthOptions;
  });

  function updateDatasetWithValuesFromRelevancySection() {
    let region = [];
    const regionRadioValue = getRadioValue('region-options');
    if (regionRadioValue === 'Partial India') {
      const statesButton = document.querySelector('.multi-states-btn');
      region = statesButton.getAttribute('title').split(', ');
    } else if (regionRadioValue == 'Other countries') {
      region = document.getElementById('otherCountriesInput').value.split(', ');
    } else {
      region = [regionRadioValue];
    }

    const dateOfPublication = getValueFromInputSelector('#pubDate input');
    const monthOfPublication = getValueFromInputSelector('#pubMonth select');
    const yearOfPublication = getValueFromInputSelector('#pubYear input');

    const language =
      getRadioValue('language-options') === 'other'
        ? getValueFromInputSelector('#otherLanguageInput')
        : getRadioValue('language-options');
    dataset.updateProperty('language', language);
    dataset.updateProperty('region', region);
    dataset.updateProperty('date', dateOfPublication);
    dataset.updateProperty('month', monthOfPublication);
    dataset.updateProperty('year', yearOfPublication);
    dataset.updateProperty('timePeriod', {
      from: getTimePeriodDetailsFromSelector('.period--from'),
      to: getTimePeriodDetailsFromSelector('.period--to')
    });

    if (!!dataset.timePeriod.from.year && !!dataset.timePeriod.to.year && !!dataset.language) {
      document.querySelector(".step-indicator[data-value='3']").classList.add('done');
    }
  }

  // const saveOnRelevancySectionButton = document.getElementById('saveOnRelevancySectionButton');
  // saveOnRelevancySectionButton.addEventListener('click', () => {
  //   updateDatasetWithValuesFromRelevancySection();
  //   postDatasetRequest('http://localhost:5000', 'draft');
  // });

  const proceedFromRelevancyButton = document.getElementById('proceedFromRelevancyButton');
  proceedFromRelevancyButton.addEventListener('click', updateDatasetWithValuesFromRelevancySection);

  // sources of dataset section
  let referenceAdditionForm;
  const addMoreReferencesButton = document.querySelector('.add-more--references');
  function generateReferenceField(referenceId, title = '', link = '') {
    return `
    <div class="item-addition item-addition--reference" id="${referenceId}">
      <span class="iconify remove-input" data-icon="mdi:close" data-inline="false"></span>
      <div class="item-addition__link-field">
        <h5>Paste Link</h5>
        <input type="text" class="form-control" value="${link}" />
      </div>
      <div class="item-addition__title-field">
        <h5>Give your link a title</h5>
        <input type="text" class="form-control" value="${title}" />
      </div>
    </div>
  `;
  }

  addMoreReferencesButton.addEventListener('click', () => {
    referenceAdditionForm = document.querySelector('.data-upload-section__form__field--references');
    referenceAdditionForm.addEventListener('click', (event) => removeFileInput(event));
    referenceAdditionForm.insertAdjacentHTML('beforeend', generateReferenceField(Math.random()));
  });

  function updateDatasetWithReferences() {
    const references = document.querySelectorAll('.item-addition--reference');

    let referenceList = [];
    references.forEach((reference) => {
      referenceList.push(getReferenceLinksFromReferenceElement(reference));
    });

    dataset.updateProperty('referenceLinks', referenceList);
  }

  function generateTagElement(tagName) {
    const tagElement = document.createElement('span');
    tagElement.innerHTML = `${tagName} <span class="iconify" data-tag="${tagName}" data-icon="clarity:close-line" data-inline="false"></span></span>`;
    return tagElement;
  }

  function insertTag(tagsContainerElement, tagName) {
    tagsContainerElement.insertBefore(generateTagElement(tagName), tagsContainerElement.querySelector('input'));
  }

  function addTag(event, property) {
    if (event.code === 'Comma' && event.target.value.length >= 3) {
      // remove the comma at the end
      const tagName = event.target.value.substring(0, event.target.value.length - 1);
      // add tag to the dataset
      dataset.addItemToListProperty(property, tagName);
      // add tag to DOM
      insertTag(event.target.parentElement, tagName);
      event.target.value = '';
    }
  }

  function removeTag(event, property, parentElement) {
    if (!event.target.matches('svg')) {
      return;
    }
    // remove tag from the dataset
    const updatedTagsList = dataset[property].filter((tag) => tag !== event.target.dataset.tag);
    dataset.updateProperty(property, updatedTagsList);
    // remove tag from DOM
    const tagToBeDeleted = event.target.parentElement;
    parentElement.removeChild(tagToBeDeleted);
  }

  const keywordsContainer = document.getElementById('keywordsContainer');
  const sourcesContainer = document.getElementById('sourcesContainer');
  keywordsContainer.addEventListener('click', (event) => removeTag(event, 'keywords', keywordsContainer));
  sourcesContainer.addEventListener('click', (event) => removeTag(event, 'sources', sourcesContainer));

  const keywordsInput = document.getElementById('keywordsInput');
  const sourcesInput = document.getElementById('sourcesInput');
  keywordsInput.addEventListener('keyup', (event) => addTag(event, 'keywords'));
  sourcesInput.addEventListener('keyup', (event) => addTag(event, 'sources'));

  // functions for getting all values and updating dataset object

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
    const uploadedFile = fileUploadElement.querySelector('input[type="file"]').files
      ? fileUploadElement.querySelector('input[type="file"]').files[0]
      : null;

    const fileFormat = fileUploadElement.dataset.format;

    return {
      file: uploadedFile,
      fileName: getValueFromInputSelector('.name-field input', fileUploadElement),
      fileDescription: getValueFromInputSelector('.file-upload__description textarea', fileUploadElement),
      fileId: fileUploadElement.id,
      fileFormat: fileFormat
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

  // save as draft
  const saveAsDraftButtons = document.querySelectorAll('.draft-button');
  saveAsDraftButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!getValueFromInputSelector('#datasetNameField').length) {
        return;
      }
      const loader = document.querySelector('.loader');
      if (loader) {
        loader.style.display = 'none';
      }

      button.style.display = 'none';
      button.insertAdjacentHTML('afterend', `<div class="loader"></div>`);
      updateDatasetWithValuesFromFilesSection();
      updateDatasetWithValuesFromOwnershipSection();
      updateDatasetWithValuesFromRelevancySection();
      updateDatasetWithReferences();
      postDatasetRequest('draft');
    });
  });

  const previewButton = document.querySelector('#previewButton');

  function generateFilePreviewHTML(file) {
    let fileIcon = '';

    if (isEditMode()) {
      fileIcon = getFileUploadBoxPropertyByFileType(file.fileFormat.toLowerCase(), 'icon');
    } else if (file.file.type.indexOf('csv') > -1) {
      fileIcon = getFileUploadBoxPropertyByFileType('csv', 'icon');
    } else if (file.file.type.indexOf('spreadsheetml') > -1) {
      fileIcon = getFileUploadBoxPropertyByFileType('xlsx', 'icon');
    } else if (file.file.type.indexOf('pdf') > -1) {
      fileIcon = getFileUploadBoxPropertyByFileType('pdf', 'icon');
    }

    return `
      <div class="file-summary" id="${file.fileId}">
        <div class="file-summary__icon-container">
          <span class="iconify" data-icon="${fileIcon}" data-inline="false"></span>
        </div>
        <div class="file-summary__text">
          <h4>${file.fileName}</h4>
          <div class="file-summary__text__description">
            <p>Description:</p>
            <p>${file.fileDescription}</p>
            <div class="file-error" style="color: red;"></div>
          </div>
        </div>
      </div>
    `;
  }

  function generateDataRelevancyPreviewTableHTML(dataset) {
    return `
    <tr>
      <td>Region(s) covered:</td>
      <td>${
        dataset.region
          ? dataset.region.map((region) => ` <span>${region}</span>`)
          : `<span style="color:red;">No regions selected</span>`
      }</td>
    </tr>
    <tr>
      <td>Date of Publication:</td>
      <td>${dataset.date} ${dataset.month} ${dataset.year}</td>
    </tr>
    <tr>
      <td>Time period covered:</td>
      <td>${dataset.timePeriod.from.month} ${dataset.timePeriod.from.year} - ${dataset.timePeriod.to.month} ${
      dataset.timePeriod.to.year
    }</td>
    </tr>
    <tr>
      <td>Language:</td>
      <td>${dataset.language}</td>
    </tr>
  `;
  }

  function generateSourcePreviewTableHTML(dataset) {
    return `
    <tr>
      <td>Keywords:</td>
      <td>${
        dataset.keywords.length ? dataset.keywords.join(', ') : `<span style="color:red;">No keywords entered</span>`
      }</td>
    </tr>
    <tr>
      <td>Data Source(s):</td>
      <td>${
        dataset.sources.length ? dataset.sources.join(', ') : `<span style="color:red;">No sources entered</span>`
      }</td>
    </tr>
    <tr>
      <td>Reference Links:</td>
      <td>
        ${dataset.referenceLinks.map((reference) => ` <span>${reference.title} - ${reference.link}</span>`)}
      </td>
    </tr>
  `;
  }

  function generateOwnershipPreviewTableHTML(dataset) {
    return `
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
    <td>
    ${
      dataset.publisher.authors[0].authorName
        ? dataset.publisher.authors.map((author) => ` <span>${author.authorName}</span>`)
        : `<span style="color:red;">No publishers entered</span>`
    }
    </td>
  </tr>
`;
  }

  previewButton.addEventListener('click', () => {
    updateDatasetWithReferences();
    const filesListPreviewSection = document.querySelector('#filesListOnPreview');

    if(areMandatoryFieldsEmpty()) {
      submitDatasetButton.disabled = true;
    }

    submitDatasetButton.style.display = 'block';
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.style.display = 'none';
    }

    filesListPreviewSection.innerHTML = '';
    if (!isEditMode()) {
      dataset.files.forEach((file) => {
        filesListPreviewSection.insertAdjacentHTML('beforeend', generateFilePreviewHTML(file));
      });
    } else {
      const updatedFiles = resourcesByType.updated.map((resourceId) => document.getElementById(resourceId));

      updatedFiles.forEach((fileUploadElement) =>
        filesListPreviewSection.insertAdjacentHTML(
          'beforeend',
          generateFilePreviewHTML(getFileDetailsFromFileUploadElement(fileUploadElement))
        )
      );

      const addedFiles = resourcesByType.added.map((resourceId) => document.getElementById(resourceId));

      addedFiles.forEach((fileUploadElement) =>
        filesListPreviewSection.insertAdjacentHTML(
          'beforeend',
          generateFilePreviewHTML(getFileDetailsFromFileUploadElement(fileUploadElement))
        )
      );

      const untouchedFiles = receivedResources
        .filter(
          (resource) => resourcesByType.updated.indexOf(resource.id) < 0 && resourcesByType.deleted.indexOf(resource.id)
        )
        .map((resource) => document.getElementById(resource.id));

      console.log(untouchedFiles);

      if (untouchedFiles) {
        untouchedFiles.forEach((fileUploadElement) =>
          filesListPreviewSection.insertAdjacentHTML(
            'beforeend',
            generateFilePreviewHTML(getFileDetailsFromFileUploadElement(fileUploadElement))
          )
        );
      }
    }

    document.querySelector('#dataRelevancyPreviewTable').innerHTML = generateDataRelevancyPreviewTableHTML(dataset);
    document.querySelector('#ownershipPreviewTable').innerHTML = generateOwnershipPreviewTableHTML(dataset);
    document.querySelector('#sourcePreviewTable').innerHTML = generateSourcePreviewTableHTML(dataset);
    document.querySelector('#datasetNameOnPreviewModal').innerHTML = dataset.name;

    console.log(dataset);
  });

  // preview modal

  const editSectionButtons = document.querySelectorAll('.preview-edit');
  editSectionButtons.forEach((button) =>
    button.addEventListener('click', () => {
      dataUploadSteps.setActiveStepByName(button.dataset.section, updateActiveSectionDOM);
    })
  );

  const submitDatasetButton = document.getElementById('submitDatasetButton');
  submitDatasetButton.addEventListener('click', () => {
    submitDatasetButton.style.display = 'none';
    submitDatasetButton.insertAdjacentHTML('afterend', `<div class="loader"></div>`);
    postDatasetRequest();
  });

  function areMandatoryFieldsEmpty() {
    return (
      !dataset.name ||
      !dataset.publisher.authors[0].authorName ||
      !dataset.keywords.length ||
      !dataset.sources.length ||
      !dataset.timePeriod.from.year ||
      !dataset.timePeriod.to.year ||
      !dataset.language
    );
  }

  // don't check when it is draft

  // api calls

  function generateFormDataForPostingMetaData(state) {
    let metaData = new FormData();
    if (isEditMode()) {
      metaData.append('pkg_name', datasetIdName);
    }
    metaData.append('title', dataset.name);
    metaData.append('license_id', dataset.license.licenseName);
    metaData.append('private', dataset.viewPermission === 'Anyone' ? false : true);
    metaData.append('publisher_type', dataset.publisher.type);
    metaData.append('publication_date', `${dataset.date}/${dataset.month}/${dataset.year}`);
    metaData.append('start_month', `${dataset.timePeriod.from.year}-${dataset.timePeriod.from.month}`);
    metaData.append('end_month', `${dataset.timePeriod.to.year}-${dataset.timePeriod.to.month}`);
    metaData.append('region', [dataset.region]);
    dataset.publisher.authors.forEach((author, index) => {
      metaData.append(`publisher_contacts-${index + 1}-name`, author.authorName);
      metaData.append(`publisher_contacts-${index + 1}-email`, author.authorEmail);
    });
    dataset.referenceLinks.forEach((referenceLink, index) => {
      metaData.append(`links-${index + 1}-link`, referenceLink.link);
      metaData.append(`links-${index + 1}-title`, referenceLink.title);
    });
    metaData.append('language', dataset.language);
    metaData.append('tag_string', dataset.keywords.join(','));
    metaData.append('source', dataset.sources.join(','));
    metaData.append('dataset_state', state);

    return metaData;
  }

  function postAllFilesSync(packageName, filesList) {
    if (filesList.length === 0) {
      window.location = '/message/success';
      return;
    }

    const filesData = new FormData();
    filesData.append('upload', filesList[0].file);
    filesData.append('name', filesList[0].fileName);
    filesData.append('description', filesList[0].fileDescription);

    fetch(`${BASE_URL}/api/dataset/${packageName}/resource/new`, {
      method: 'POST',
      credentials: 'same-origin',
      body: filesData
    })
      .then(() => {
        postAllFilesSync(packageName, filesList.slice(1));
      })
      .catch(() => {
        const failedFileSummary = document.getElementById(`${filesList[0].fileId}`);
        failedFileSummary.querySelector('file-error').style.display = 'block';
        failedFileSummary.querySelector('file-error').innerHTML = 'This file could not be uploaded';

        submitDatasetButton.style.display = 'block';
        if (loader) {
          loader.style.display = 'none';
        }
        postAllFilesSync(packageName, filesList.slice(1));
      });
  }

  // function to delete a single resource
  function deleteAllResources(resourceList, packageName) {
    if (!resourceList.length) {
      updateResources(resourcesByType.updated, packageName);
    } else {
      const resourceToBeDeleted = resourceList[0];

      fetch(`${BASE_URL}/api/dataset/${packageName}/resource/${resourceToBeDeleted}/delete`, {
        method: 'POST'
      })
        .then(() => deleteAllResources(resourceList.slice(1)))
        .catch((error) => {
          deleteAllResources(resourceList.slice(1));
          console.log(error.message);
        });
    }
  }

  function updateResources(resourcesList, packageName) {
    if (!resourcesList.length) {
      const filesList = resourcesByType.added.map((resourceId) =>
        getFileDetailsFromFileUploadElement(document.getElementById(resourceId))
      );
      postAllFilesSync(datasetIdName, filesList);
    } else {
      const resource = getFileDetailsFromFileUploadElement(document.getElementById(resourcesList[0]));

      const fileData = new FormData();
      if (resource.file) {
        fileData.append('upload', resource.file);
      }
      fileData.append('name', resource.fileName);
      fileData.append('description', resource.fileDescription);

      fetch(`${BASE_URL}/api/dataset/${packageName}/resource/${resourcesList[0]}/edit`, {
        method: 'POST',
        credentials: 'same-origin',
        body: fileData
      })
        .then(() => updateResources(resourcesList.slice(1)))
        .catch((error) => {
          console.log(error.message);
          updateResources(resourcesList.slice(1));
        });
    }
  }

  // function to update a single resource

  function updateAllResources(packageName = datasetIdName) {
    // first - send request to delete resources (sync)
    deleteAllResources(resourcesByType.deleted, packageName);
    // second - send request to update resources (sync)
    // updateResources(resourcesByType.updated, packageName);
    // // third - send request to add resources (sync)
    // const filesList = resourcesByType.added.map((resourceId) =>
    //   getFileDetailsFromFileUploadElement(document.getElementById(resourceId))
    // );
    // setTimeout(() => postAllFilesSync(packageName, filesList), 0);
  }

  function postDatasetRequest(state = 'active') {
    const modalBody = document.querySelector('#previewDatasetModal .modal-body');
    const existingErrorMessageElement = modalBody.querySelector('.dataset-fail');
    if (existingErrorMessageElement) {
      existingErrorMessageElement.remove();
    }

    if (state === 'active' && areMandatoryFieldsEmpty()) {
      modalBody.insertAdjacentHTML(
        'afterbegin',
        `<p class="dataset-fail" style="color:red;">Some fields are empty. Please populate them.</p>`
      );
      return;
    }

    if (state === 'draft' && !dataset.name) {
      document.getElementById('datasetNameField').setAttribute('placeholder', 'Enter a name for the dataset');
      document.getElementById('datasetNameField').style.border = '1px solid red';
      dataUploadSteps.setActiveStep(1, updateActiveSectionDOM);
      setTimeout(() => {
        document.getElementById('datasetNameField').style.border = '1px solid #ccc';
      }, 2000);
      return;
    }

    if (isEditMode()) {
      console.log('sending update request');
      fetch(`${BASE_URL}/api/dataset/new`, {
        method: 'POST',
        credentials: 'same-origin',
        body: generateFormDataForPostingMetaData(state)
      })
        .then((response) => response.json())
        .then(() => {
          updateAllResources();
        })
        .catch((error) => {
          console.log(error.message);
          modalBody.insertAdjacentHTML(
            'afterbegin',
            `<p class="dataset-fail" style="color:red;">${error.message} - Couldn't update dataset. Please try again.</p>`
          );

          submitDatasetButton.style.display = 'block';

          if (state == 'draft') {
            saveAsDraftButtons.forEach((button) => {
              button.addEventListener('click', () => {
                button.style.display = 'block';
              });
            });
          }
          if (loader) {
            loader.style.display = 'none';
          }
        });
    } else {
      fetch(`${BASE_URL}/api/dataset/new`, {
        method: 'POST',
        credentials: 'same-origin',
        body: generateFormDataForPostingMetaData(state)
      })
        .then((response) => response.json())
        .then((data) => {
          const filesList = resourcesByType.added.map((resourceId) =>
            getFileDetailsFromFileUploadElement(document.getElementById(resourceId))
          );
          postAllFilesSync(data.pkg_name, filesList);
        })
        .catch((error) => {
          console.log(error.message);
          modalBody.insertAdjacentHTML(
            'afterbegin',
            `<p class="dataset-fail" style="color:red;">${error.message} - Couldn't upload dataset. Please try again.</p>`
          );

          submitDatasetButton.style.display = 'block';

          if (state == 'draft') {
            saveAsDraftButtons.forEach((button) => {
              button.addEventListener('click', () => {
                button.style.display = 'block';
              });
            });
          }

          if (loader) {
            loader.style.display = 'none';
          }
        });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (isEditMode()) {
      const datasetName = splitURL[splitURL.length - 2];
      fetch(`${BASE_URL}/api/dataset/${datasetName}`, {
        method: 'GET',
        credentials: 'same-origin'
      })
        .then((response) => response.json())
        .then((data) => fillFieldsWithData(data))
        .catch((error) => console.log(error.message));
    }
  });

  function fillFieldsWithData(data) {
    console.log(data);

    datasetIdName = data.name;

    const fileUploadSections = document.querySelectorAll('.file-upload');
    fileUploadSections.forEach((section) => {
      section.parentElement.removeChild(section);
    });

    // file section
    document.getElementById('datasetNameField').value = data.title;
    receivedResources = data.resources;
    receivedResourcesIds = receivedResources.map((resource) => resource.id);
    receivedResources.forEach((resource) => {
      fileUploadContainer.insertAdjacentHTML(
        'beforeend',
        generateFileUploadField(resource.id, resource.name, resource.description.replace('\n', '\r\n'), resource.format)
      );
      const uploadBox = document.getElementById(resource.id).querySelector('.upload-box');
      updateFileInputBackground(uploadBox, resource.format.toLowerCase());
      // WIP - fix upload box not getting icons
    });

    // ownership section
    document.getElementById('licenseSelect').value = data.license_id;
    document.querySelector(`input[name="view-permissions"]`).value = data.public === 'false' ? 'Only me' : 'Anyone';
    document.querySelector(`input[name="primary-publisher"]`).value = data.publisher_type;

    const publisherAdditionInputs = document.querySelectorAll('.item-addition--author');
    publisherAdditionInputs.forEach((input) => {
      input.parentElement.removeChild(input);
    });

    data.publisher_contacts.forEach((publisher) => {
      authorAdditionForm.insertAdjacentHTML(
        'beforeend',
        generateAuthorField(
          data.publisher_type === 'individual' ? 'Author' : 'Organization',
          publisher.name,
          publisher.email ? publisher.email : ''
        )
      );
    });

    // relevancy section
    const [fromYear, fromMonth] = data.start_month.split('-');
    const [toYear, toMonth] = data.end_month.split('-');
    const [pubDate, pubMonth, pubYear] = data.publication_date.split('/');

    // regions WIP

    document.getElementById('fromYear').value = fromYear;
    document.getElementById('toYear').value = toYear;
    document.getElementById('fromMonth').value = fromMonth ? fromMonth : '--';
    document.getElementById('toMonth').value = toMonth ? toMonth : '--';

    document.getElementById('pubDateInput').value = pubDate;
    document.getElementById('pubMonthInput').value = pubMonth ? pubMonth : '--';
    document.getElementById('pubYearInput').value = pubYear;

    if (data.language === 'English' || data.language === 'Hindi') {
      document.querySelector(`input[name="language-options"]`).value = data.language;
    } else {
      document.querySelector(`input[name="language-options"]`).value = 'other';
      document.getElementById('otherLanguageInput').style.display = 'inline-block';
      document.getElementById('otherLanguageInput').value = data.language;
    }

    // sources section

    data.tags.forEach((tag) => {
      insertTag(keywordsInput.parentElement, tag.display_name);
      dataset.addItemToListProperty('keywords', tag.display_name);
    });
    data.source.forEach((s) => {
      insertTag(sourcesInput.parentElement, s);
      dataset.addItemToListProperty('sources', s);
    });

    const referenceInputs = document.querySelectorAll('.item-addition--reference');

    referenceInputs.forEach((input) => {
      input.parentElement.removeChild(input);
    });

    data.links.forEach((link) => {
      const referenceAdditionForm = document.querySelector('.data-upload-section__form__field--references');
      referenceAdditionForm.insertAdjacentHTML(
        'beforeend',
        generateReferenceField(Math.random(), link.title, link.link)
      );
    });
  }
})();
