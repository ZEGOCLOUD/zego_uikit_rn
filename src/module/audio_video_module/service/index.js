import ZegoExpressEngine from 'zego-express-engine-reactnative';
import { zlogerror, zloginfo, zlogwarning } from '../../../utils/logger';

export class ZegoAudioVideoService {
    constructor(sdk) {
        this._isRoomConnected = false;
        this._currentRoomState = 7; // Logout
        this._sdk = sdk;
        this._micStateMap = {};
        this._cameraStateMap = {};
        this._onMicDeviceOnCallbacks = [];
        this._onCameraDeviceOnCallbacks = [];
    }
    _isLocalUser(userID) {
        return sdk.zegoUserService.getLocalUserInfo().userID == userID;
    }
    useFrontFacingCamera(isFrontFacing) {
        return new Promise((resolve, reject) => {
            if (!this._isRoomConnected) {
                zlogerror('You are not connected to any room.')
                reject();
            } else {
                ZegoExpressEngine.instance().useFrontCamera(isFrontFacing, 0).then(() => {
                    resolve();
                }).catch((error) => {
                    reject();
                });
            }
        });
    }

    isMicDeviceOn(userID) {
        if (userID in this._micStateMap) {
            return this._micStateMap[userID];
        } else {
            zlogwarning('Can not check mic device is on for user[', userID, '], because no record!');
            return true;
        }
    }

    isCameraDeviceOn(userID) {
        if (userID in this._cameraStateMap) {
            return this._cameraStateMap[userID];
        } else {
            zlogwarning('Can not check camera device is on for user[', userID, '], because no record!');
            return true;
        }
    }

    enableSpeaker(enable) {
        return new Promise((resolve, reject) => {
            if (!this._isRoomConnected) {
                zlogerror('You are not connected to any room.')
                reject();
            } else {
                ZegoExpressEngine.instance().muteSpeaker(!enable).then(() => {
                    resolve();
                }).catch((error) => {
                    reject();
                });
            }
        });
    }

    audioOutputDeviceType() {

    }

    turnMicDeviceOn(userID, on) {
        return new Promise((resolve, reject) => {
            if (this._isLocalUser(userID)) {
                if (!this._isRoomConnected) {
                    zlogerror('You are not connected to any room.')
                    reject();
                } else {
                    ZegoExpressEngine.instance().muteMicrophone(!on).then(() => {
                        resolve();
                    }).catch((error) => {
                        reject();
                    });
                }
            } else {
                // TODO
                zlogwarning("Can not turn on other's mic device on this version");
                reject();
            }
        });
    }
    turnCameraDeviceOn(userID, on) {
        return new Promise((resolve, reject) => {
            if (this._isLocalUser(userID)) {
                if (!this._isRoomConnected) {
                    zlogerror('You are not connected to any room.')
                    reject();
                } else {
                    // Default to Main Channel
                    ZegoExpressEngine.instance().enableCamera(on, 0).then(() => {
                        resolve();
                    }).catch((error) => {
                        reject();
                    });
                }
            } else {
                // TODO
                zlogwarning("Can not turn on other's camera device on this version");
                reject();
            }
        });
    }
    onMicDeviceOn(callback) {
        if (typeof callback !== 'function') {
            this._onMicDeviceOnCallbacks = [];
            zlogwarning('Set an invalid callback to [onMicDeviceOn], all callbacks were clear.');
        } else {
            this._onMicDeviceOnCallbacks.push(callback);
        }
    }
    onCameraDeviceOn(callback) {
        if (typeof callback !== 'function') {
            this._onCameraDeviceOnCallbacks = [];
            zlogwarning('Set an invalid callback to [onCameraDeviceOn], all callbacks were clear.');
        } else {
            this._onCameraDeviceOnCallbacks.push(callback);
        }
    }
    onAudioOutputDeviceTypeChange(callback) {
        // TODO SDK missing API for this callback
    }
    setAudioConfig(config) {
        // TODO
    }
    setVideoConfig(config) {
        // TODO
    }

    // Event from engine >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    _onRoomStateChanged(roomID, reason, errorCode, extendedData) {
        // Not support multi-room right now
        if (reason == 1 || reason == 4) { // Logined || Reconnected
            this._isRoomConnected = true;
        } else {
            this._currentRoomState = reason;
        }
    }
    _onRemoteCameraStateUpdate(streamID, state) {
        // StreamID format: roomid_userid_main
        const streamIDParts = streamID.split('_');
        const userID = streamIDParts[1];
        this._cameraStateMap[userID] = state == 10; // 10 for Open
        this._onCameraDeviceOnCallbacks.forEach(callback => {
            callback(userID, this._cameraStateMap[userID]);
        });
    }
    _onRemoteMicStateUpdate(streamID, state) {
        // StreamID format: roomid_userid_main
        const streamIDParts = streamID.split('_');
        const userID = streamIDParts[1];
        this._micStateMap[userID] = state == 10; // 10 for Open
        this._onMicDeviceOnCallbacks.forEach(callback => {
            callback(userID, this._micStateMap[userID]);
        });
    }
}