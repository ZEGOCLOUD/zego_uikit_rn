import ZegoUIKitLogger from './kitlogger';

export const zloginfo = (...msg: any[]) => {
  ZegoUIKitLogger.kitLogInfo('ZEGOUIKit', ...msg);
};

export const zlogwarning = (...msg: any[]) => {
  ZegoUIKitLogger.kitLogWarning('ZEGOUIKit', ...msg);
};

export const zlogerror = (...msg: any[]) => {
  ZegoUIKitLogger.kitLogError('ZEGOUIKit', ...msg);
};
