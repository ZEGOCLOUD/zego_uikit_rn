import ZegoUIKitLogger from '../../utils/kitlogger';

export const zloginfo = (...msg: any[]) => {
  ZegoUIKitLogger.logInfo('SignalingPlugin', ...msg);
};

export const zlogwarning = (...msg: any[]) => {
  ZegoUIKitLogger.logWarning('SignalingPlugin', ...msg);
};

export const zlogerror = (...msg: any[]) => {
  ZegoUIKitLogger.logError('SignalingPlugin', ...msg);
};
