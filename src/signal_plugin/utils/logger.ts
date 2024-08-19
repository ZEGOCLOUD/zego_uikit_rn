import ZegoUIKitLogger from '../../utils/kitlogger';

export const zloginfo = (...msg: any[]) => {
  ZegoUIKitLogger.kitLogInfo('SignalingPlugin', ...msg);
};

export const zlogwarning = (...msg: any[]) => {
  ZegoUIKitLogger.kitLogWarning('SignalingPlugin', ...msg);
};

export const zlogerror = (...msg: any[]) => {
  ZegoUIKitLogger.kitLogError('SignalingPlugin', ...msg);
};
