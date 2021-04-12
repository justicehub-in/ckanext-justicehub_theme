export default class Dataset {
  constructor() {
    this.name = '';
    this.description = '';
    this.files = [];
    this.license = {};
    this.viewPermission = '';
    this.publisher = {
      type: '',
      authors: []
    };
    this.region = {
      country: '',
      subRegions: []
    };
    this.date = '';
    this.month = '';
    this.year = '';
    this.timePeriod = {
      from: { month: '', year: '' },
      to: { month: '', year: '' }
    };
    this.language = '';
    this.keywords = [];
    this.sources = [];
    this.referenceLinks = [];
  }

  updateProperty = (property, value) => {
    this[property] = value;
  };

  addItemToListProperty = (property, item) => {
    this[property] = [...this[property], item];
  };
}
