export default class DataUploadSteps {
  constructor() {
    this.steps = [
      { id: 1, section: 'files-section' },
      { id: 2, section: 'ownership-section' },
      { id: 3, section: 'relevancy-section' },
      { id: 4, section: 'source-section' }
    ];
    this.activeStep = { id: 1, section: 'files-section' };
  }

  setActiveStep = (sectionId, next) => {
    this.activeStep = this.steps.find((section) => section.id === sectionId);
    next();
  };

  setActiveStepByName = (sectionName, next) => {
    this.activeStep = this.steps.find((step) => step.section === sectionName);
    next();
  }

  goToNextStep = (next) => {
    if (this.activeStep.id < 4) {
      this.setActiveStep(this.activeStep.id + 1, next);
    }
  };

  goToPreviousStep = (next) => {
    if (this.activeStep.id > 1) {
      this.setActiveStep(this.activeStep.id - 1, next);
    }
  };
}
