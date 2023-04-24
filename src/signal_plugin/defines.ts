export const ZegoUIKitPluginType = {
  signaling: 1,
};

export enum CXCallEndedReason {
  Failed = 1,
  RemoteEnded = 2,
  Unanswered = 3,
  AnsweredElsewhere = 4,
  DeclinedElsewhere = 5
}
export enum ZIMConnectionState {
  Disconnected = 0,
  Connecting = 1,
  Connected = 2,
  Reconnecting = 3
}

export enum ZIMCallUserState {
  Inviting = 0,
  Accepted = 1,
  Rejected = 2,
  Cancelled = 3,
  Offline = 4,
  Received = 5
}

