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

export const ZegoInvitationConnectionState = {
  disconnected: 0,
  connecting: 1,
  connected: 2,
  reconnecting: 3,
};
