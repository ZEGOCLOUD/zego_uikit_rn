import { ZegoUIKitCore } from '../../module/ZegoUIKitCore';

import {
    INIT_SDK,
    SET_SDK_LOADING,
    RESET_SDK,
    SDK_ERROR,
} from './actionTypes';

import {
    zloginfo,
    zlogwarning,
    zlogerror,
} from './utils/logger'

export const disconnectSdk = ({ sdkDispatcher, sdk, onDisconnect }) => {
    // Set state to preparing disconnect
    sdkDispatcher({ type: SET_SDK_LOADING, payload: true });
    if (sdk && sdk.disconnect) {
        sdk.disconnect().then(() => {
            // Set state to initialed state
            sdkDispatcher({ type: RESET_SDK });
        }).finally(() => {
            onDisconnect();
        })
    } else {
        onDisconnect();
    }
}

export const connectSDK = ({ appID, appSign, userID, userName, userProfileUrl, userExtendInfo, configureSession, sdk }, dispatchers) => {
    const { sdkDispatcher } = dispatchers;
    // Disconnect the sdk before connect again
    disconnectSdk({
        sdkDispatcher, sdk, onDisconnect: () => {
            zloginfo('Setup sdk connection');
            let sessionHandler = null;
            sdkDispatcher({ type: SET_SDK_LOADING, payload: true });
            if (appID && appSign) {
                const sdk = new ZegoUIKitCore();
                if (configureSession && typeof configureSession === 'function') {
                    sessionHandler = configureSession(sdk);
                }
                sdk.connect(appID, appSign, {userID, userName, userProfileUrl, userExtendInfo}).then(() => {
                    sdkDispatcher({ type: INIT_SDK, payload: sdk });
                }).catch((error) => {
                    zlogerror('Create ZegoExpressEngine Failed: ', error);
                    sdkDispatcher({ type: SDK_ERROR });
                });
            } else {
                zlogerror('Connect SDK failed! appID or appSign missing!');
                sdkDispatcher({ type: SDK_ERROR });
            }
        }
    })
}

