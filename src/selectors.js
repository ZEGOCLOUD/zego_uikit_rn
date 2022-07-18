import { zlogerror } from "./utils/logger";

export const getSdk = (store) => {
    const { stores = {} } = store;
    const { sdkStore = {} } = stores;
    const { sdk } = sdkStore;
    return sdk;
}

export const getZegoAudioVideoService = (store) => () => {
    const sdk = getSdk(store);
    if (!sdk) {
        zlogerror('ZegoUIKit SDK instance is invalid!')
        return undefined;
    } else {
        return sdk.zegoAudioVideoService;
    }
}

export const getZegoRoomService = (store) => () => {
    const sdk = getSdk(store);
    if (!sdk) {
        zlogerror('ZegoUIKit SDK instance is invalid!')
        return undefined;
    } else {
        return sdk.zegoRoomService;
    }
}

export const getZegoUserService = (store) => () => {
    const sdk = getSdk(store);
    if (!sdk) {
        zlogerror('ZegoUIKit SDK instance is invalid!')
        return undefined;
    } else {
        return sdk.zegoUserService;
    }
}