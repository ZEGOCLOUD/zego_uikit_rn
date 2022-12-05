export class ZegoInvitationImplResult {
  code = '';
  message = '';
  constructor(code = '', message = '') {
    this.code = code;
    this.message = message;
  }
}

export const ZegoInvitationConnectionState = {
  disconnected: 0,
  connecting: 1,
  connected: 2,
  reconnecting: 3,
};

export const ZegoLiveAudioRoomRole = {
  host: 0,
  speaker: 1,
  audience: 2,
};
