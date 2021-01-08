import DataUploadSteps from './dataUploadSteps.js';
import Dataset from './dataset.js';

(function () {
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
        return;
      }
      section.classList.add('hide');
    });

    stepIndicators.forEach((step) => {
      if (parseInt(step.dataset.value) === dataUploadSteps.activeStep.id) {
        step.classList.add('active');
        step.classList.remove('done');
      } else if (parseInt(step.dataset.value) < dataUploadSteps.activeStep.id) {
        step.classList.add('done');
        step.classList.remove('active');
      } else {
        step.classList.remove('active');
        step.classList.remove('done');
      }
    });
  }

  // remove file inputs
  function removeFileInput(event) {
    if (!event.target.classList.contains('remove-input')) {
      return;
    }

    const fileInputToBeRemoved = event.target.parentElement;
    if (!fileInputToBeRemoved.parentElement) return;
    fileInputToBeRemoved.parentElement.removeChild(fileInputToBeRemoved);
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
      format: 'xls',
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
    }
  ];

  function getFileUploadBoxPropertyByFileType(fileType, property) {
    return FILEINPUT_ICONS.find((file) => file.format === fileType)[property];
  }

  // function generateFileIconNode(iconName) {
  //   return document
  //     .createElement('span')
  //     .setAttribute('class', 'iconify')
  //     .setAttribute('data-icon', iconName)
  //     .setAttribute('data-inline', 'false');
  // }

  function generateFileUploadField(fileId) {
    return `
    <div class="file-upload" id="${fileId}">
      <span class="iconify remove-input" data-icon="mdi:close" data-inline="false"></span>
      <div class="file-upload__name">
        <div class="upload-box">
          <input type="file" />
          <span class="iconify" data-icon="fe:upload" data-inline="false"></span>
        </div>
        <div class="name-field">
          <h4>Name of the file <span>(Upload a file to edit the name)</span></h4>
          <input type="text" class="form-control" id="fileNameField" disabled />
        </div>
      </div>
      <div class="file-upload__description">
        <h4>Description</h4>
        <textarea class="form-control" cols="25" rows="5"></textarea>
      </div>
    </div>
  `;
  }

  const fileUploadContainer = document.querySelector('.data-upload-section__form__field--file');
  const addMoreFilesButton = document.querySelector('.add-more--files');

  addMoreFilesButton.addEventListener('click', () => {
    const fileUploadForm = document.querySelector('.data-upload-section__form__field--file');
    fileUploadForm.insertAdjacentHTML('beforeend', generateFileUploadField(Math.random()));
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
    fileInputBackgroundElement.style.backgroundColor = getFileUploadBoxPropertyByFileType(fileType, 'backgroundColor');
    fileInputBackgroundElement.removeChild(fileInputBackgroundElement.querySelector('svg'));
    fileInputBackgroundElement.insertAdjacentHTML(
      'beforeend',
      getFileUploadBoxPropertyByFileType(fileType, 'iconTemplate')
    );
  }

  function fileInputHandler(event) {
    const file = event.target.files[0];
    const fileInputBackground = event.target.parentElement;
    fileInputBackground.style.border = '1px solid #524F4F';
    if (file.type.indexOf('csv') > -1) {
      updateFileInputBackground(fileInputBackground, 'csv');
    } else if (file.type.indexOf('spreadsheetml') > -1) {
      updateFileInputBackground(fileInputBackground, 'xls');
    } else if (file.type.indexOf('pdf') > -1) {
      updateFileInputBackground(fileInputBackground, 'pdf');
    }
    const correspondingFileNameInput = fileInputBackground.nextSibling.nextSibling.querySelector('input');
    correspondingFileNameInput.disabled = false;
    correspondingFileNameInput.value = file.name;
  }

  function updateDatasetWithValuesFromFilesSection() {
    dataset.updateProperty('files', []);
    dataset.updateProperty('name', getValueFromInputSelector('#datasetNameField'));
    const fileUploadInputs = document.querySelectorAll('.file-upload');
    fileUploadInputs.forEach((file) => {
      if (getFileDetailsFromFileUploadElement(file).fileName) {
        dataset.addItemToListProperty('files', getFileDetailsFromFileUploadElement(file));
      }
    });
  }

  const saveOnFilesSectionButton = document.getElementById('saveOnFilesSectionButton');
  saveOnFilesSectionButton.addEventListener('click', () => {
    updateDatasetWithValuesFromFilesSection();
    postDatasetRequest('http://localhost:5000', 'draft');
  });

  const proceedFromFilesButton = document.querySelector('#proceedFromFilesButton');
  proceedFromFilesButton.addEventListener('click', updateDatasetWithValuesFromFilesSection);

  // ownership section
  let authorAdditionForm;
  const addMoreAuthorsButton = document.querySelector('.add-more--authors');
  function generateAuthorField(publisherType) {
    return `
    <div class="item-addition item-addition--author">
      <span class="iconify remove-input" data-icon="mdi:close" data-inline="false"></span>
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

  addMoreAuthorsButton.addEventListener('click', () => {
    authorAdditionForm = document.querySelector('.data-upload-section__form__field--authors');
    authorAdditionForm.addEventListener('click', (event) => removeFileInput(event));
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
    dataset.updateProperty('publisher', publisher);
  }

  const saveOnOwnershipSectionButton = document.getElementById('saveOnOwnershipSectionButton');
  saveOnOwnershipSectionButton.addEventListener('click', () => {
    updateDatasetWithValuesFromOwnershipSection();
    postDatasetRequest('http://localhost:5000', 'draft');
  });

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

  let monthOptions = '';

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

    const language =
      getRadioValue('language-options') === 'other'
        ? getValueFromInputSelector('#otherLanguageInput')
        : getRadioValue('language-options');
    dataset.updateProperty('language', language);
    dataset.updateProperty('region', region);
    dataset.updateProperty('timePeriod', {
      from: getTimePeriodDetailsFromSelector('.period--from'),
      to: getTimePeriodDetailsFromSelector('.period--to')
    });
  }

  const saveOnRelevancySectionButton = document.getElementById('saveOnRelevancySectionButton');
  saveOnRelevancySectionButton.addEventListener('click', () => {
    updateDatasetWithValuesFromRelevancySection();
    postDatasetRequest('http://localhost:5000', 'draft');
  });

  const proceedFromRelevancyButton = document.getElementById('proceedFromRelevancyButton');
  proceedFromRelevancyButton.addEventListener('click', updateDatasetWithValuesFromRelevancySection);

  // sources of dataset section
  let referenceAdditionForm;
  const addMoreReferencesButton = document.querySelector('.add-more--references');
  function generateReferenceField(referenceId) {
    return `
    <div class="item-addition item-addition--reference" id="${referenceId}">
      <span class="iconify remove-input" data-icon="mdi:close" data-inline="false"></span>
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

  addMoreReferencesButton.addEventListener('click', () => {
    referenceAdditionForm = document.querySelector('.data-upload-section__form__field--references');
    referenceAdditionForm.addEventListener('click', (event) => removeFileInput(event));
    referenceAdditionForm.insertAdjacentHTML('beforeend', generateReferenceField(Math.random()));
  });

  function generateTagElement(tagName) {
    const tagElement = document.createElement('span');
    tagElement.innerHTML = `${tagName} <span class="iconify" data-tag="${tagName}" data-icon="clarity:close-line" data-inline="false"></span></span>`;
    return tagElement;
  }

  function insertTag(tagsContainerElement, tagName) {
    tagsContainerElement.insertBefore(generateTagElement(tagName), tagsContainerElement.querySelector('input'));
  }

  function addTag(event, property) {
    if (event.code === 'Comma') {
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
    const references = document.querySelectorAll('.item-addition--reference');
    references.forEach((reference) => {
      dataset.addItemToListProperty('referenceLinks', getReferenceLinksFromReferenceElement(reference));
    });

    function generateFilePreviewHTML(file) {
      let fileIcon = '';

      if (file.file.type.indexOf('csv') > -1) {
        fileIcon = getFileUploadBoxPropertyByFileType('csv', 'icon');
      } else if (file.file.type.indexOf('spreadsheetml') > -1) {
        fileIcon = getFileUploadBoxPropertyByFileType('xls', 'icon');
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
            </div>
          </div>
          <div class="file-error" style="display: none; color: red;"></div>
        </div>
      `;
    }

    const dataRelevancyPreviewTableHTML = `
    <tr>
      <td>Region(s) covered:</td>
      <td>${dataset.region.map((region) => ` <span>${region}</span>`)}</td>
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
      <td>
      ${dataset.publisher.authors.map((author) => ` <span>${author.authorName}</span>`)}
      </td>
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
      <td>
        ${dataset.referenceLinks.map((reference) => ` <span>${reference.title} - ${reference.link}</span>`)}
      </td>
    </tr>
  `;

    document.getElementById('submitDatasetButton').style.display = 'block';
    if (document.querySelector('.loader')) document.querySelector('.loader').style.display = 'none';

    document.querySelector('#filesListOnPreview').innerHTML = '';
    dataset.files.forEach((file) => {
      document.querySelector('#filesListOnPreview').insertAdjacentHTML('beforeend', generateFilePreviewHTML(file));
    });

    document.querySelector('#dataRelevancyPreviewTable').innerHTML = dataRelevancyPreviewTableHTML;
    document.querySelector('#ownershipPreviewTable').innerHTML = ownershipPreviewTableHTML;
    document.querySelector('#sourcePreviewTable').innerHTML = sourcePreviewTableHTML;
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
    postDatasetRequest('http://127.0.0.1:5000');
  });

  // api calls

  function generateFormDataForPostingMetaData(state) {
    let metaData = new FormData();
    metaData.append('title', dataset.name);
    metaData.append('license_id', dataset.license.licenseName);
    metaData.append('private', dataset.viewPermission === 'Anyone' ? false : true);
    metaData.append('publisher_type', dataset.publisher.type);
    metaData.append('start_month', `${dataset.timePeriod.from.year}-${dataset.timePeriod.from.month}`);
    metaData.append('end_month', `${dataset.timePeriod.to.year}-${dataset.timePeriod.to.month}`);
    metaData.append('region', [dataset.region]);
    dataset.publisher.authors.forEach((author, index) => {
      metaData.append(`publisher_contacts-${index + 1}-name`, author.authorName);
      metaData.append(`publisher_email-${index + 1}-name`, author.authorEmail);
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

  function postAllFilesSync(packageName, filesList, baseUrl) {
    if (filesList.length === 0) {
      window.location = '/message/success';
      return;
    }

    const filesData = new FormData();
    filesData.append('upload', filesList[0].file);
    filesData.append('name', filesList[0].fileName);
    filesData.append('description', filesList[0].fileDescription);

    fetch(`${baseUrl}/api/dataset/${packageName}/resource/new`, {
      method: 'POST',
      credentials: 'same-origin',
      body: filesData
    })
      .then(() => {
        postAllFilesSync(packageName, filesList.slice(1), baseUrl);
      })
      .catch(() => {
        const failedFileSummary = document.getElementById(`${filesList[0].fileId}`);
        failedFileSummary.querySelector('file-error').style.display = 'block';
        failedFileSummary.querySelector('file-error').innerHTML = 'This file could not be uploaded';

        document.getElementById('submitDatasetButton').style.display = 'block';
        if (document.querySelector('.loader')) document.querySelector('.loader').style.display = 'none';
      });
  }

  function postDatasetRequest(baseUrl, state = 'active') {
    fetch(`${baseUrl}/api/dataset/new`, {
      method: 'POST',
      credentials: 'same-origin',
      body: generateFormDataForPostingMetaData(state)
    })
      .then((response) => response.json())
      .then((data) => {
        window.location = '/message/success';
        postAllFilesSync(data.pkg_name, dataset.files, baseUrl);
      })
      .catch((error) => {
        console.log(error.message);
        const failedFileSummary = document.getElementById(`${dataset.files[0].fileId}`);
        failedFileSummary.querySelector('file-error').style.display = 'block';
        failedFileSummary.querySelector('file-error').innerHTML = 'This file couldn not be uploaded';

        document.getElementById('submitDatasetButton').style.display = 'block';
        if (document.querySelector('.loader')) document.querySelector('.loader').style.display = 'none';
      });
  }
})();
