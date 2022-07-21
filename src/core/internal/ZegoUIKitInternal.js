import ZegoExpressEngine from 'zego-express-engine-reactnative';
import { zlogerror, zloginfo, zlogwarning } from '../../../utils/logger';

var _isRoomConnected = false;
var _currentRoomState = 7; // Logout
var _currentRoomID = '';
var _onMicDeviceOnCallbacks = [];
var _onCameraDeviceOnCallbacks = [];
var _onRoomStateChangedCallbacks = [];
var _onUserJoinCallbacks = [];
var _onUserLeaveCallbacks = [];
// Structure for export
var _localUserInfo = {
    userID: '',
    userName: '',
    profileUrl: '',
    extendInfo: {}
}
/*
Internal infomation
{
    userID: '',
    userName: '',
    profileUrl: '',
    extendInfo: '',
    viewID: 0,
    isMicDeviceOn: true,
    isCameraDeviceOn: true,
    audioOutputType: 0,
    publisherQuality: 0,
}
*/
var _coreUserList = [];

function _createCoreUser(userID, userName) {
    return {
        userID: userID,
        userName: userName,
        profileUrl: '',
        extendInfo: '',
        viewID: 0,
        isMicDeviceOn: true,
        isCameraDeviceOn: true,
        audioOutputType: 0,
        publisherQuality: 0,
    }
}
function _isLocalUser(userID) {
    return _localUserInfo.userID === userID;
}

function _getUserIDByStreamID(streamID) {
    // StreamID format: roomid_userid_main
    return streamID.split('_')[1]
}

function _onRoomUserUpdate(roomID, updateType, userList) {
    // No need for roomID, does not support multi-room right now.
    const userInfoList = [];
    if (updateType == 0) {
        userList.forEach(user => {
            const coreUser = _createCoreUser(user.userID, user.userName);
            _coreUserList.push(coreUser);

            const userInfo = {
                userID: user.userID,
                userName: user.userName,
                profileUrl: '', // TODO read from zim sdk
                extendInfo: {} // TODO read from zim sdk
            }
            userInfoList.push(userInfo);
        });
        _onUserJoinCallbacks.forEach(callback => {
            callback(userInfoList);
        })
    } else {
        userList.forEach(user => {
            const coreUser = _coreUserList[_getCoreUserIndexByID(user.userID)];
            const userInfo = {
                userID: coreUser.userID,
                userName: coreUser.userName,
                profileUrl: coreUser.profileUrl,
                extendInfo: coreUser.extendInfo
            }
            userInfoList.push(userInfo);
            if (index !== -1) {
                _coreUserList.splice(index, 1);
            }
        });
        _onUserLeaveCallbacks.forEach(callback => {
            callback(userInfoList);
        });
    }
}
function _onRemoteCameraStateUpdate(streamID, state) {
    const userID = _getUserIDByStreamID(streamID);
    const index = _getCoreUserIndexByID(userID);
    if (index != -1) {
        const isOn = state == 10; // 10 for Open
        _coreUserList[index].isCameraDeviceOn = isOn;
        _onCameraDeviceOnCallbacks.forEach(callback => {
            callback(userID, isOn);
        });
    }
}
function _onRemoteMicStateUpdate(streamID, state) {
    const userID = _getUserIDByStreamID(streamID);
    const index = _getCoreUserIndexByID(userID);
    if (index != -1) {
        const isOn = state == 10; // 10 for Open
        _coreUserList[index].isMicDeviceOn = isOn
        _onMicDeviceOnCallbacks.forEach(callback => {
            callback(userID, isOn);
        });
    }
}
function _onRoomStateChanged(roomID, reason, errorCode, extendedData) {
    // Not support multi-room right now
    if (reason == 1 || reason == 4) { // Logined || Reconnected
        _isRoomConnected = true;
    } else {
        _currentRoomState = reason;
    }
    // Trigger callback
    _onRoomStateChangedCallbacks.forEach(callback => {
        callback(reason, errorCode, extendedData);
    })
}
function _registerEngineCallback() {
    zloginfo('Register callback for ZegoExpressEngine...')
    ZegoExpressEngine.instance().on(
        'roomUserUpdate',
        (roomID, updateType, userList) => {
            zloginfo('[roomUserUpdate callback]', roomID, updateType, userList);
            _onRoomUserUpdate(roomID, updateType, userList);
        },
    );
    ZegoExpressEngine.instance().on(
        'roomStreamUpdate',
        (roomID, updateType, streamList) => {
            zloginfo('[roomStreamUpdate callback]', roomID, updateType, streamList);
            // TODO
        },
    );
    ZegoExpressEngine.instance().on(
        'publisherQualityUpdate',
        (streamID, quality) => {
            zloginfo('[publisherQualityUpdate callback]', streamID, quality);
            const index = _getCoreUserIndexByID(_localUserInfo.userID);
            if (index != -1) {
                _coreUserList[index].publisherQuality = quality;
            }
        },
    );
    ZegoExpressEngine.instance().on(
        'playerQualityUpdate',
        (streamID, quality) => {
            zloginfo('[playerQualityUpdate callback]', streamID, quality);
            _services.forEach(service => {
                if (service && service._onPlayerQualityUpdate) {
                    service._onPlayerQualityUpdate(streamID, quality);
                }
            })
        },
    );
    ZegoExpressEngine.instance().on(
        'remoteCameraStateUpdate',
        (streamID, state) => {
            zloginfo('[remoteCameraStateUpdate callback]', streamID, state);
            _onRemoteCameraStateUpdate(streamID, state);
        },
    );
    ZegoExpressEngine.instance().on(
        'remoteMicStateUpdate',
        (streamID, state) => {
            zloginfo('[remoteMicStateUpdate callback]', streamID, state);
            _onRemoteMicStateUpdate(streamID, state);
        },
    );
    // https://doc-en-api.zego.im/ReactNative/enums/_zegoexpressdefines_.zegoroomstatechangedreason.html
    ZegoExpressEngine.instance().on(
        'roomStateChanged',
        (roomID, reason, errorCode, extendedData) => {
            zloginfo('[roomStateChanged callback]', roomID, reason, errorCode, extendedData);
            _onRoomStateChanged(roomID, reason, errorCode, extendedData);
        },
    );
}
function _unregisterEngineCallback() {
    zloginfo('Unregister callback from ZegoExpressEngine...');
    ZegoExpressEngine.instance().off('roomUserUpdate');
    ZegoExpressEngine.instance().off('roomStreamUpdate');
    ZegoExpressEngine.instance().off('publisherQualityUpdate');
    ZegoExpressEngine.instance().off('playerQualityUpdate');
    ZegoExpressEngine.instance().off('remoteCameraStateUpdate');
    ZegoExpressEngine.instance().off('remoteMicStateUpdate');
    ZegoExpressEngine.instance().off('roomStateChanged');
}

function _getCoreUserIndexByID(id) {
    _coreUserList.forEach(user, index => {
        if (user.userID === id) {
            return index;
        }
    });
    zlogwarning('User with id: [', id, '] does not exist!');
    return - 1;
}

export default {
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SDK <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    connectSDK(appID, appSign, userInfo) {
        new Promise((resolve, reject) => {
            const engineProfile = {
                appID: appID,
                appSign: appSign,
                scenario: ZegoScenario.General,
            }
            ZegoExpressEngine.createEngineWithProfile(engineProfile).then((engine) => {
                zloginfo('Create ZegoExpressEngine succeed!');
                _unregisterEngineCallback();
                _registerEngineCallback();

                // Set userInfo if valid
                const { userID } = userInfo;
                if (userID) {
                    zegoUserService.setLocalUserInfo(userInfo);
                }
                resolve();
            }).catch((error) => {
                zlogerror('Create ZegoExpressEngine Failed: ', error);
                reject(error);
            });
        });
    },
    disconnectSDK() {
        return new Promise((resolve, reject) => {
            if (ZegoExpressEngine.instance()) {
                ZegoExpressEngine.destroyEngine().then(() => {
                    zloginfo('Destroy ZegoExpressEngine finished!')
                    resolve();
                }).catch((error) => {
                    zlogerror('Destroy ZegoExpressEngine failed!', error);
                    reject(error);
                })
            } else {
                resolve();
            }
        });
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Audio Video <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    useFrontFacingCamera(isFrontFacing) {
        return new Promise((resolve, reject) => {
            if (!_isRoomConnected) {
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
    },
    isMicDeviceOn(userID) {
        const index = _getCoreUserIndexByID(userID);
        if (index != -1) {
            return _coreUserList[index].isMicDeviceOn;
        } else {
            zlogwarning('Can not check mic device is on for user[', userID, '], because no record!');
            return true;
        }
    },
    isCameraDeviceOn(userID) {
        const index = _getCoreUserIndexByID(userID);
        if (index != -1) {
            return _coreUserList[index].isCameraDeviceOn;
        } else {
            zlogwarning('Can not check camera device is on for user[', userID, '], because no record!');
            return true;
        }
    },
    enableSpeaker(enable) {
        // TODO
        return new Promise((resolve, reject) => {
            if (!_isRoomConnected) {
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
    },
    audioOutputDeviceType() {
        // TODO
    },
    turnMicDeviceOn(userID, on) {
        return new Promise((resolve, reject) => {
            if (_isLocalUser(userID)) {
                if (!_isRoomConnected) {
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
    },
    turnCameraDeviceOn(userID, on) {
        return new Promise((resolve, reject) => {
            if (_isLocalUser(userID)) {
                if (!_isRoomConnected) {
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
    },
    onMicDeviceOn(callback) {
        if (typeof callback !== 'function') {
            _onMicDeviceOnCallbacks = [];
            zlogwarning('Set an invalid callback to [onMicDeviceOn], all callbacks were clear.');
        } else {
            _onMicDeviceOnCallbacks.push(callback);
        }
    },
    onCameraDeviceOn(callback) {
        if (typeof callback !== 'function') {
            _onCameraDeviceOnCallbacks = [];
            zlogwarning('Set an invalid callback to [onCameraDeviceOn], all callbacks were clear.');
        } else {
            _onCameraDeviceOnCallbacks.push(callback);
        }
    },
    onAudioOutputDeviceTypeChange(callback) {
        // TODO SDK missing API for this callback
    },
    setAudioConfig(config) {
        // TODO
    },
    setVideoConfig(config) {
        // TODO
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Room <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    joinRoom(roomID) {
        return new Promise((resolve, reject) => {
            const user = { userID: _localUserInfo.userID, userName: _localUserInfo.userName };
            const config = { isUserStatusNotify: true }
            ZegoExpressEngine.instance().loginRoom(roomID, user, config).then(() => {
                _currentRoomID = roomID;
                resolve();
            }).catch((error) => {
                zlogerror('Join room falied: ', error);
                reject(error);
            });
        });
    },
    leaveRoom() {
        return new Promise((resolve, reject) => {
            if (_currentRoomID == '') {
                zlogwarning('You are not join in any room, no need to leave room.');
                resolve();
            } else {
                ZegoExpressEngine.instance().logoutRoom(roomID).then(() => {
                    _currentRoomID = '';
                    resolve();
                }).catch((error) => {
                    zlogerror('Leave room falied: ', error);
                    reject(error);
                });
            }
        });
    },
    onRoomStateChanged(callback) {
        if (typeof callback !== 'function') {
            _onRoomStateChangedCallbacks = [];
            zlogwarning('Set an invalid callback to [onRoomStateChanged], all callbacks were clear.');
        } else {
            _onRoomStateChangedCallbacks.push(callback);
        }
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    setLocalUserInfo(userInfo) {
        _localUserInfo = userInfo;
        if (_getCoreUserIndexByID(userInfo.userID) == -1) {
            _coreUserList.push({
                userID: userInfo.userID,
                userName: userInfo.userName,
                profileUrl: userInfo.profileUrl,
                extendInfo: userInfo.extendInfo,
                viewID: -1,
                isMicDeviceOn: true,
                isCameraDeviceOn: true,
                audioOutputType: 0
            });
        }
    },
    getLocalUserInfo() {
        return _localUserInfo;
    },
    onUserJoin(callback) {
        if (typeof callback !== 'function') {
            _onUserJoinCallbacks = [];
            zlogwarning('Set an invalid callback to [onUserJoin], all callbacks were clear.');
        } else {
            _onUserJoinCallbacks.push(callback);
        }
    },
    onUserLeave(callback) {
        if (typeof callback !== 'function') {
            _onUserLeaveCallbacks = [];
            zlogwarning('Set an invalid callback to [onUserLeave], all callbacks were clear.');
        } else {
            _onUserLeaveCallbacks.push(callback);
        }
    }
}