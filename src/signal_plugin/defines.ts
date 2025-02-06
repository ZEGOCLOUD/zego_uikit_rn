export const ZegoUIKitPluginType = {
  signaling: 1,
};

// synchronized from callkit 1.06
export interface CXAction {
  fail: () => void;
  fulfill: () => void;
}

// synchronized from callkit 1.06
export interface CXCallUpdate {
  remoteHandle?: CXHandle;
  localizedCallerName?: string;
  supportsHolding?: boolean;
  supportsGrouping?: boolean;
  supportsUngrouping?: boolean;
  supportsDTMF?: boolean;
  hasVideo?: boolean;
}

// synchronized from callkit 1.06
export interface CXHandle {
  type: CXHandleType;
  value: string;
}

// synchronized from callkit 1.06
export declare enum CXHandleType {
  Generic = 1,
  PhoneNumber = 2,
  EmailAddress = 3
}

// synchronized from callkit 1.06
export declare enum CXCallEndedReason {
  Failed = 1,
  RemoteEnded = 2,
  Unanswered = 3,
  AnsweredElsewhere = 4,
  DeclinedElsewhere = 5
}