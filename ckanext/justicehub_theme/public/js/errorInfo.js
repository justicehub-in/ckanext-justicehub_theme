export default class ErrorInfo {
  constructor() {
    this.latestErrorMessage = '';
  }

  get error() {
    return !!this.latestErrorMessage;
  }

  updateErrorMessage(message) {
    this.latestErrorMessage = message;
    return this;
  }
}
