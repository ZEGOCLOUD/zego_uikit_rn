import ZegoExpressEngine from 'zego-express-engine-reactnative';
import { zlogerror, zloginfo, zlogwarning } from '../../utils/logger';

var _isRoomConnected = false;
var _currentRoomState = 7; // Logout
var _currentRoomID = '';

var _onMicDeviceOnCallbackMap = {};
var _onCameraDeviceOnCallbackMap = {};
var _onRoomStateChangedCallbackMap = {};
var _onUserJoinCallbackMap = {};
var _onUserLeaveCallbackMap = {};

var _localCoreUser = _createCoreUser('', '', '', {});
var _streamCoreUserMap = {}; // <streamID, CoreUser>
var _coreUserMap = {}; // <userID, CoreUser>

function _createCoreUser(userID, userName, profileUrl, extendInfo) {
    return {
        userID: userID,
        userName: userName,
        profileUrl: profileUrl,
        extendInfo: extendInfo,
        viewID: 0,
        viewFillMode: 1,
        streamID: '',
        isMicDeviceOn: true,
        isCameraDeviceOn: true,
        audioOutputType: 0,
        publisherQuality: 0,
    }
}
function _isLocalUser(userID) {
    return userID === undefined || userID === '' || _localCoreUser.userID === userID;
}

function _onRoomUserUpdate(roomID, updateType, userList) {
    // No need for roomID, does not support multi-room right now.
    const userInfoList = [];
    if (updateType == 0) {
        userList.forEach(user => {
            const coreUser = _createCoreUser(user.userID, user.userName);
            _coreUserMap[user.userID] = coreUser;

            const userInfo = {
                userID: user.userID,
                userName: user.userName,
                profileUrl: '', // TODO read from zim sdk
                extendInfo: {} // TODO read from zim sdk
            }
            userInfoList.push(userInfo);

            // Start after user insert into list
            _tryStartPlayStream(user.userID);
        });

        Object.keys(_onUserJoinCallbackMap).forEach(callbackID => {
            _onUserJoinCallbackMap[callbackID](userInfoList);
        });
    } else {
        userList.forEach(user => {
            if (user.userID in _coreUserMap) {
                const coreUser = _coreUserMap[user.userID];
                const userInfo = {
                    userID: coreUser.userID,
                    userName: coreUser.userName,
                    profileUrl: coreUser.profileUrl,
                    extendInfo: coreUser.extendInfo
                }
                userInfoList.push(userInfo);

                // Stop play stream before remove user list
                _tryStopPlayStream(coreUser.userID, true);
                delete _coreUserMap[user.userID];
            }
        });
        _onUserLeaveCallbacks.forEach(callback => {
            callback(userInfoList);
        });
    }
}
function _onRoomStreamUpdate(roomID, updateType, streamList) {
    if (updateType == 0) { // Add
        streamList.forEach(stream => {
            const userID = stream.user.userID;
            const userName = stream.user.userName;
            const streamID = stream.streamID;
            if (userID in _coreUserMap) {
                _coreUserMap[userID].streamID = streamID;
                _streamCoreUserMap[streamID] = _coreUserMap[userID];
                _tryStartPlayStream(userID);
            } else {
                _streamCoreUserMap[streamID] = _createCoreUser(userID, userName, '', {});
                _streamCoreUserMap[streamID].streamID = streamID;
            }
        })
    } else {
        streamList.forEach(stream => {
            const userID = stream.user.userID;
            const streamID = stream.streamID;
            if (userID in _coreUserMap) {
                _tryStopPlayStream(userID, true);
                _coreUserMap[userID].streamID = '';
                delete _streamCoreUserMap[streamID];
            }
        })
    }
}
function _onRemoteCameraStateUpdate(streamID, state) {
    const userID = _getUserIDByStreamID(streamID);
    if (userID in _coreUserMap) {
        const isOn = state == 10; // 10 for Open
        _coreUserMap[userID].isCameraDeviceOn = isOn;

        Object.keys(_onCameraDeviceOnCallbackMap).forEach(callbackID => {
            _onCameraDeviceOnCallbackMap[callbackID](userID, isOn);
        });

        if (isOn) {
            _tryStartPlayStream(userID);
        } else {
            _tryStopPlayStream(userID);
        }
    }
}
function _onRemoteMicStateUpdate(streamID, state) {
    const userID = _getUserIDByStreamID(streamID);
    if (userID in _coreUserMap) {
        const isOn = state == 10; // 10 for Open
        _coreUserMap[userID].isMicDeviceOn = isOn;

        Object.keys(_onMicDeviceOnCallbackMap).forEach(callbackID => {
            _onMicDeviceOnCallbackMap[callbackID](userID, isOn);
        });

        if (isOn) {
            _tryStartPlayStream(userID);
        } else {
            _tryStopPlayStream(userID);
        }
    }
}
function _onRoomStateChanged(roomID, reason, errorCode, extendedData) {
    zloginfo('Room state chaged: ', roomID, reason, errorCode, extendedData);
    // Not support multi-room right now
    if (reason == 1 || reason == 4) { // Logined || Reconnected
        _isRoomConnected = true;
    } else {
        _isRoomConnected = false;
    }
    _currentRoomState = reason;

    Object.keys(_onRoomStateChangedCallbackMap).forEach(callbackID => {
        _onRoomStateChangedCallbackMap[callbackID](reason, errorCode, extendedData);
    });
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
            _onRoomStreamUpdate(roomID, updateType, streamList);
        },
    );
    ZegoExpressEngine.instance().on(
        'publisherQualityUpdate',
        (streamID, quality) => {
            zloginfo('[publisherQualityUpdate callback]', streamID, quality);
            if (streamID.split('_')[2] === 'main') {
                _localCoreUser.publisherQuality = quality;
                _coreUserMap[_localCoreUser.userID].publisherQuality = quality;
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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Stream Handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function _getUserIDByStreamID(streamID) {
    // StreamID format: roomid_userid_main
    return streamID.split('_')[1]
}
function _getPublishStreamID() {
    return _currentRoomID + '_' + _localCoreUser.userID + '_main';
}
function _tryStartPublishStream() {
    if (_localCoreUser.isMicDeviceOn || _localCoreUser.isCameraDeviceOn) {
        ZegoExpressEngine.instance().startPublishingStream(_localCoreUser.streamID);
        if (_localCoreUser.viewID > 0) {
            ZegoExpressEngine.instance().startPreview({
                'reactTag': _localCoreUser.viewID,
                'viewMode': _localCoreUser.fillMode,
                'backgroundColor': 0
            });
        }
    }
}
function _tryStopPublishStream(force = false) {
    if (!_localCoreUser.isMicDeviceOn && !_localCoreUser.isCameraDeviceOn) {
        ZegoExpressEngine.instance().stopPublishingStream();
        ZegoExpressEngine.instance().stopPreview();
    }
}
function _tryStartPlayStream(userID) {
    if (userID in _coreUserMap) {
        const user = _coreUserMap[userID];
        if (user.viewID > 0 && user.streamID !== '') {
            ZegoExpressEngine.instance().startPlayingStream(user.streamID, {
                'reactTag': user.viewID,
                'viewMode': user.fillMode,
                'backgroundColor': 0
            });
        }
    }
}
function _tryStopPlayStream(userID, force = false) {
    if (userID in _coreUserMap) {
        const user = _coreUserMap[userID];
        if (force || (user.viewID < 0 || (!user.isMicDeviceOn && !user.isCameraDeviceOn))) {
            ZegoExpressEngine.instance().stopPlayingStream(user.streamID);
        }
    }
}

export default {
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SDK <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    connectSDK(appID, appSign, userInfo) {
        return new Promise((resolve, reject) => {
            const engineProfile = {
                appID: appID,
                appSign: appSign,
                scenario: 0,
            }
            ZegoExpressEngine.createEngineWithProfile(engineProfile).then((engine) => {
                zloginfo('Create ZegoExpressEngine succeed!');
                _unregisterEngineCallback();
                _registerEngineCallback();

                if (_localCoreUser.userID === '') {
                    this.setLocalUserInfo(userInfo);
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
    updateRenderingProperty(userID, viewID, fillMode) {
        if (userID in _coreUserMap) {
            _coreUserMap[userID].viewID = viewID;
            _coreUserMap[userID].fillMode = fillMode;

            if (_localCoreUser.userID == userID) {
                _localCoreUser.viewID = viewID;
                _localCoreUser.fillMode = fillMode;
                if (viewID > 0) {
                    _tryStartPublishStream();
                } else {
                    _tryStopPublishStream();
                }
            } else {
                // Check if stream is ready to play for remote user
                if (viewID > 0) {
                    _tryStartPlayStream(userID);
                } else {
                    _tryStopPlayStream(userID);
                }
            }
        }
    },
    useFrontFacingCamera(isFrontFacing) {
        return new Promise((resolve, reject) => {
            if (!_isRoomConnected) {
                zlogerror('You are not connected to any room.')
                reject();
            } else {
                ZegoExpressEngine.instance().useFrontCamera(isFrontFacing, 0);
                resolve();
            }
        });
    },
    isMicDeviceOn(userID) {
        if (userID in _coreUserMap) {
            return _coreUserMap[userID].isMicDeviceOn;
        } else {
            zlogwarning('Can not check mic device is on for user[', userID, '], because no record!');
            return true;
        }
    },
    isCameraDeviceOn(userID) {
        if (userID in _coreUserMap) {
            return _coreUserMap[userID].isCameraDeviceOn;
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
                ZegoExpressEngine.instance().muteSpeaker(!enable);
                resolve();
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
                    zloginfo('turnMicDeviceOn: ', userID, on);
                    ZegoExpressEngine.instance().muteMicrophone(!on);
                    _onRemoteMicStateUpdate(_getPublishStreamID(), on ? 10 : 1); // 10 for open, 1 for disable
                    _localCoreUser.isMicDeviceOn = on;
                    _coreUserMap[_localCoreUser.userID].isMicDeviceOn = on;
                    if (on) {
                        _tryStartPublishStream();
                    } else {
                        _tryStopPublishStream();
                    }
                    resolve();
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
                    zloginfo('turnCameraDeviceOn: ', userID, on);
                    ZegoExpressEngine.instance().enableCamera(on, 0);
                    _onRemoteCameraStateUpdate(_getPublishStreamID(), on ? 10 : 1); // 10 for open, 1 for disable
                    _localCoreUser.isCameraDeviceOn = on;
                    _coreUserMap[_localCoreUser.userID].isCameraDeviceOn = on;
                    if (on) {
                        _tryStartPublishStream();
                    } else {
                        _tryStopPublishStream();
                    }
                    resolve();
                }
            } else {
                // TODO
                zlogwarning("Can not turn on other's camera device on this version");
                reject();
            }
        });
    },
    onMicDeviceOn(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onMicDeviceOnCallbackMap) {
                zloginfo('[onMicDeviceOn] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onMicDeviceOnCallbackMap[callbackID];
            }
        } else {
            _onMicDeviceOnCallbackMap[callbackID] = callback;
        }
    },
    onCameraDeviceOn(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onCameraDeviceOnCallbackMap) {
                zloginfo('[onCameraDeviceOn] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onCameraDeviceOnCallbackMap[callbackID];
            }
            zlogwarning('Set an invalid callback to [onCameraDeviceOn], all callbacks were clear.');
        } else {
            _onCameraDeviceOnCallbackMap[callbackID] = callback;
        }
    },
    onAudioOutputDeviceTypeChange(callbackID, callback) {
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
            const user = { userID: _localCoreUser.userID, userName: _localCoreUser.userName };
            const config = { isUserStatusNotify: true }
            ZegoExpressEngine.instance().loginRoom(roomID, user, config).then(() => {
                zloginfo('Join room success.')
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
    onRoomStateChanged(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onRoomStateChangedCallbackMap) {
                zloginfo('[onRoomStateChanged] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onRoomStateChangedCallbackMap[callbackID];
            }
        } else {
            _onRoomStateChangedCallbackMap[callbackID] = callback;
        }
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    setLocalUserInfo(userInfo) {
        _localCoreUser.userID = userInfo.userID;
        _localCoreUser.userName = userInfo.userName;
        _localCoreUser.profileUrl = userInfo.profileUrl;
        _localCoreUser.extendInfo = userInfo.extendInfo;
        _localCoreUser.streamID = _getPublishStreamID();
        if (!(userInfo.userID in _coreUserMap)) {
            _coreUserMap[userInfo.userID] = _localCoreUser;
        }
    },
    getLocalUserInfo() {
        return {
            userID: _localCoreUser.userID,
            userName: _localCoreUser.userName,
            profileUrl: _localCoreUser.profileUrl,
            extendInfo: _localCoreUser.extendInfo,
        };
    },
    onUserJoin(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onUserJoinCallbackMap) {
                zloginfo('[onUserJoin] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onUserJoinCallbackMap[callbackID];
            }
        } else {
            _onUserJoinCallbackMap[callbackID] = callback;
        }
    },
    onUserLeave(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onUserLeaveCallbackMap) {
                zloginfo('[onUserLeave] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onUserLeaveCallbackMap[callbackID];
            }
        } else {
            _onUserLeaveCallbackMap[callbackID] = callback;
        }
    }
}