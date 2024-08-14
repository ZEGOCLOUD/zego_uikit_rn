import { getLocalDateFormat } from '../../utils/timer';

export const zloginfo = (...msg: any[]) => {
  console.info(getLocalDateFormat() + ' SignalingPlugin[INFO]: ', ...msg);
};

export const zlogwarning = (...msg: any[]) => {
  console.warn(getLocalDateFormat() + ' SignalingPlugin[WARNING]: ', ...msg);
};

export const zlogerror = (...msg: any[]) => {
  console.error(getLocalDateFormat() + ' SignalingPlugin[ERROR]: ', ...msg);
};
