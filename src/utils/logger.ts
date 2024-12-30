import ZegoUIKitLogger from './kitlogger';

const module = 'ZegoUIKit'

export const zloginfo = (...msg: any[]) => {
  ZegoUIKitLogger.logInfo(module, ...msg);
};

export const zlogwarning = (...msg: any[]) => {
  ZegoUIKitLogger.logWarning(module, ...msg);
};

export const zlogerror = (...msg: any[]) => {
  ZegoUIKitLogger.logError(module, ...msg);
};
