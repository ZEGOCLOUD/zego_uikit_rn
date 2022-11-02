export class ZegoInvitationServiceResult {
  code = '';
  message = '';
  result = '';
  constructor(code = '', message = '', result = '') {
    this.code = code;
    this.message = message;
    this.result = result;
  }
}
