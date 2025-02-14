export default class ZegoPluginResult {
  code = '';
  message = '';
  data = {};

  constructor(code = '', message = '', data = {}) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
