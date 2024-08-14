import { getLocalDateFormat } from './timer';

export const zloginfo = (...msg: any[]) => {
  console.info(getLocalDateFormat() + ' ZEGOUIKit[INFO]: ', ...msg);
};

export const zlogwarning = (...msg: any[]) => {
  console.warn(getLocalDateFormat() + ' ZEGOUIKit[WARNING]: ', ...msg);
};

export const zlogerror = (...msg: any[]) => {
  console.error(getLocalDateFormat() + ' ZEGOUIKit[ERROR]: ', ...msg);
};
