import ZegoExpressEngine from 'zego-express-engine-reactnative';
import { zlogerror, zloginfo, zlogwarning } from '../../utils/logger';
import ZegoChangedCountOrProperty from './ZegoChangedCountOrProperty'

var _isRoomConnected = false;
var _currentRoomState = 7; // Logout
var _currentRoomID = '';
var _audioOutputType = 0;
var _usingFrontFacingCamera = true;

var _onMicDeviceOnCallbackMap = {};
var _onCameraDeviceOnCallbackMap = {};
var _onRoomStateChangedCallbackMap = {};
var _onUserJoinCallbackMap = {};
var _onUserLeaveCallbackMap = {};
var _onUserInfoUpdateCallbackMap = {};
var _onSoundLevelUpdateCallbackMap = {};
var _onSDKConnectedCallbackMap = {};
var _onAudioOutputDeviceTypeChangeCallbackMap = {};
var _onOnlySelfInRoomCallbackMap = {};
var _onUserCountOrPropertyChangedCallbackMap = {};
var _onAudioVideoAvailableCallbackMap = {};
var _onAudioVideoUnavailableCallbackMap = {};
var _onInRoomMessageReceivedCallbackMap = {};
var _onInRoomMessageSentCallbackMap = {};

var _localCoreUser = _createCoreUser('', '', '', {});
var _streamCoreUserMap = {}; // <streamID, CoreUser>
var _coreUserMap = {}; // <userID, CoreUser>
var _qualityUpdateLogCounter = 0;

var _inRoomMessageList = [];

function _resetData() {
    zloginfo('Reset all data.')
    _localCoreUser = _createCoreUser('', '', '', {});
    _streamCoreUserMap = {};
    _coreUserMap = {};
    _currentRoomID = '';
    _currentRoomState = 7;
    _isRoomConnected = false;
    _audioOutputType = 0;
    _inRoomMessageList = [];
}

function _resetDataForLeavingRoom() {
    zloginfo('Reset data for leaving room.')
    _streamCoreUserMap = {};
    _coreUserMap = {};
    _currentRoomID = '';
    _currentRoomState = 7;
    _isRoomConnected = false;
    const { userID, userName, profileUrl, extendInfo } = _localCoreUser;
    _localCoreUser = _createCoreUser(userID, userName, profileUrl, extendInfo);
    _coreUserMap[_localCoreUser.userID] = _localCoreUser;
    _inRoomMessageList = [];
}

function _createPublicUser(coreUser) {
    return {
        userID: coreUser.userID,
        userName: coreUser.userName,
        extendInfo: coreUser.extendInfo,
        isMicrophoneOn: coreUser.isMicDeviceOn,
        isCameraOn: coreUser.isCameraDeviceOn,
        soundLevel: coreUser.soundLevel
    }
}
function _createCoreUser(userID, userName, profileUrl, extendInfo) {
    return {
        userID: userID,
        userName: userName,
        profileUrl: profileUrl,
        extendInfo: extendInfo,
        viewID: -1,
        viewFillMode: 1,
        streamID: '',
        isMicDeviceOn: true,
        isCameraDeviceOn: true,
        publisherQuality: 0,
        soundLevel: 0,
        joinTime: 0,
    }
}
function _isLocalUser(userID) {
    return userID === undefined || userID === '' || _localCoreUser.userID === userID;
}
function _setLocalUserInfo(userInfo) {
    _localCoreUser = _createCoreUser(userInfo.userID, userInfo.userName, userInfo.profileUrl, userInfo.extendInfo);
    _coreUserMap[userInfo.userID] = _localCoreUser;
}

function _onRoomUserUpdate(roomID, updateType, userList) {
    // No need for roomID, does not support multi-room right now.
    const userInfoList = [];
    if (updateType == 0) {
        userList.forEach(user => {
            if (!(user.userID in _coreUserMap)) {
                const coreUser = _createCoreUser(user.userID, user.userName);
                _coreUserMap[user.userID] = coreUser;
            }
            const streamID = _getStreamIDByUserID(user.userID);
            if (streamID in _streamCoreUserMap) {
                _coreUserMap[user.userID].streamID = streamID;
            }
            _coreUserMap[user.userID].joinTime = Date.now();
            _notifyUserInfoUpdate(_coreUserMap[user.userID]);

            userInfoList.push(_createPublicUser(_coreUserMap[user.userID]));

            // Start after user insert into list
            _tryStartPlayStream(user.userID);
        });
        _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.userAdd);

        zloginfo("User Join: ", userInfoList)
        Object.keys(_onUserJoinCallbackMap).forEach(callbackID => {
            if (_onUserJoinCallbackMap[callbackID]) {
                _onUserJoinCallbackMap[callbackID](userInfoList);
            }
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
        _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.userDelete);
        zloginfo("User Leave: ", userInfoList)
        Object.keys(_onUserLeaveCallbackMap).forEach(callbackID => {
            if (_onUserLeaveCallbackMap[callbackID]) {
                _onUserLeaveCallbackMap[callbackID](userInfoList);
            }
        })
        if (Object.keys(_coreUserMap).length <= 1) {
            Object.keys(_onOnlySelfInRoomCallbackMap).forEach(callbackID => {
                if (_onOnlySelfInRoomCallbackMap[callbackID]) {
                    _onOnlySelfInRoomCallbackMap[callbackID]();
                }
            })
        }
    }
}
function _onRoomStreamUpdate(roomID, updateType, streamList) {
    zloginfo('_onRoomStreamUpdate: ', roomID, updateType, streamList)
    var users = [];
    if (updateType == 0) { // Add
        streamList.forEach(stream => {
            const userID = stream.user.userID;
            const userName = stream.user.userName;
            const streamID = stream.streamID;
            if (userID in _coreUserMap) {
                _coreUserMap[userID].streamID = streamID;
                _streamCoreUserMap[streamID] = _coreUserMap[userID];
                _notifyUserInfoUpdate(_coreUserMap[userID]);
                _tryStartPlayStream(userID);

                users.push(_coreUserMap[userID]);
            } else {
                _streamCoreUserMap[streamID] = _createCoreUser(userID, userName, '', {});
                _streamCoreUserMap[streamID].streamID = streamID;

                _coreUserMap[userID] = _streamCoreUserMap[streamID];

                users.push(_streamCoreUserMap[streamID]);
            }
        })

        Object.keys(_onAudioVideoAvailableCallbackMap).forEach(callbackID => {
            if (_onAudioVideoAvailableCallbackMap[callbackID]) {
                _onAudioVideoAvailableCallbackMap[callbackID](users);
            }
        })
    } else {
        streamList.forEach(stream => {
            const userID = stream.user.userID;
            const streamID = stream.streamID;
            if (userID in _coreUserMap) {
                _tryStopPlayStream(userID, true);
                _coreUserMap[userID].isCameraDeviceOn = false;
                _coreUserMap[userID].isMicDeviceOn = false;
                _coreUserMap[userID].streamID = '';
                _notifyUserInfoUpdate(_coreUserMap[userID]);

                users.push(_coreUserMap[userID]);

                delete _streamCoreUserMap[streamID];
            }
        })
        _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.cameraStateUpdate);

        Object.keys(_onAudioVideoUnavailableCallbackMap).forEach(callbackID => {
            if (_onAudioVideoUnavailableCallbackMap[callbackID]) {
                _onAudioVideoUnavailableCallbackMap[callbackID](users);
            }
        })
    }
}
function _onRemoteCameraStateUpdate(userID, state) {
    if (userID in _coreUserMap) {
        const isOn = state == 0; // 0 for Open
        _coreUserMap[userID].isCameraDeviceOn = isOn;
        _notifyUserInfoUpdate(_coreUserMap[userID]);
        _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.cameraStateUpdate);

        Object.keys(_onCameraDeviceOnCallbackMap).forEach(callbackID => {
            if (_onCameraDeviceOnCallbackMap[callbackID]) {
                _onCameraDeviceOnCallbackMap[callbackID](userID, isOn);
            }
        });

        if (userID != _localCoreUser.userID) {
            if (isOn) {
                _tryStartPlayStream(userID);
            }
        }
    }
}
function _onAudioRouteChange(type) {
    Object.keys(_onAudioOutputDeviceTypeChangeCallbackMap).forEach(callbackID => {
        if (_onAudioOutputDeviceTypeChangeCallbackMap[callbackID]) {
            _onAudioOutputDeviceTypeChangeCallbackMap[callbackID](type);
        }
    });
    _audioOutputType = type;
}
function _onRemoteMicStateUpdate(userID, state) {
    if (userID in _coreUserMap) {
        const isOn = state == 0; // 0 for Open
        _coreUserMap[userID].isMicDeviceOn = isOn;
        _notifyUserInfoUpdate(_coreUserMap[userID]);
        _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.microphoneStateUpdate);

        Object.keys(_onMicDeviceOnCallbackMap).forEach(callbackID => {
            if (_onMicDeviceOnCallbackMap[callbackID]) {
                _onMicDeviceOnCallbackMap[callbackID](userID, isOn);
            }
        });

        if (userID != _localCoreUser.userID) {
            if (isOn) {
                _tryStartPlayStream(userID);
            }
        }
    }
}
function _onRoomStateChanged(roomID, reason, errorCode, extendedData) {
    zloginfo('Room state chaged: ', roomID, reason, errorCode, extendedData);
    // Not support multi-room right now
    if (reason == 1 || reason == 4) { // Logined || Reconnected
        _isRoomConnected = true;
        _tryStartPublishStream();
    } else {
        _isRoomConnected = false;
    }
    _currentRoomState = reason;

    Object.keys(_onRoomStateChangedCallbackMap).forEach(callbackID => {
        // callback may remove from map during room state chaging
        if (callbackID in _onRoomStateChangedCallbackMap) {
            if (_onRoomStateChangedCallbackMap[callbackID]) {
                _onRoomStateChangedCallbackMap[callbackID](reason, errorCode, extendedData);
            }
        }
    });
}
function _onInRoomMessageReceived(roomID, messageList) {
    zloginfo('Received in room message: ', roomID, messageList.length);
    var messages = [];
    messageList.forEach(msg => {
        const message = {
            message: msg.message,
            messageID: msg.messageID,
            sendTime: msg.sendTime,
            sender: _createPublicUser(_coreUserMap[msg.fromUser.userID])
        }
        messages.push(message);
        _inRoomMessageList.push(message);
    })

    Object.keys(_onInRoomMessageReceivedCallbackMap).forEach(callbackID => {
        // callback may remove from map during room state chaging
        if (callbackID in _onInRoomMessageReceivedCallbackMap) {
            if (_onInRoomMessageReceivedCallbackMap[callbackID]) {
                _onInRoomMessageReceivedCallbackMap[callbackID](messages);
            }
        }
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
            if (_qualityUpdateLogCounter % 10 == 0) {
                _qualityUpdateLogCounter = 0;
                zloginfo('[publisherQualityUpdate callback]', streamID, quality);
            }
            _qualityUpdateLogCounter++;
            if (streamID.split('_')[2] === 'main') {
                _localCoreUser.publisherQuality = quality;
                _coreUserMap[_localCoreUser.userID].publisherQuality = quality;
                _notifyUserInfoUpdate(_coreUserMap[_localCoreUser.userID]);
            }
        },
    );
    // ZegoExpressEngine.instance().on(
    //     'publisherStateUpdate',
    //     (streamID, state, errorCode, extendedData) => {
    //         zloginfo('publisherStateUpdate#################', streamID, state, errorCode)
    //     },
    // );
    ZegoExpressEngine.instance().on(
        'playerQualityUpdate',
        (streamID, quality) => {
            if (_qualityUpdateLogCounter % 10 == 0) {
                zloginfo('[playerQualityUpdate callback]', streamID, quality);
            }
            // TODO
        },
    );
    ZegoExpressEngine.instance().on(
        'remoteCameraStateUpdate',
        (streamID, state) => {
            zloginfo('[remoteCameraStateUpdate callback]', streamID, state);
            _onRemoteCameraStateUpdate(_getUserIDByStreamID(streamID), state);
        },
    );
    ZegoExpressEngine.instance().on(
        'remoteMicStateUpdate',
        (streamID, state) => {
            zloginfo('[remoteMicStateUpdate callback]', streamID, state);
            _onRemoteMicStateUpdate(_getUserIDByStreamID(streamID), state);
        },
    );
    ZegoExpressEngine.instance().on(
        'playerStateUpdate',
        (streamID, state, errorCode, extendedData) => {
            zloginfo('[playerStateUpdate callback]', streamID, state, errorCode, extendedData);
        },
    );
    ZegoExpressEngine.instance().on(
        'remoteSoundLevelUpdate',
        (soundLevels) => {
            // {streamID, soundLavel} value from 0.0 to 100.0
            // zloginfo('[remoteSoundLevelUpdate callback]', soundLevels);
            Object.keys(soundLevels).forEach(streamID => {
                const userID = _getUserIDByStreamID(streamID);
                if (userID in _coreUserMap) {
                    _coreUserMap[userID].soundLevel = soundLevels[streamID];
                    _notifySoundLevelUpdate(userID, soundLevels[streamID]);
                }
            })
        },
    );
    ZegoExpressEngine.instance().on(
        'capturedSoundLevelUpdate',
        (soundLevel) => {
            if (_localCoreUser.userID === "" || !(_localCoreUser.userID in _coreUserMap)) {
                return;
            }
            _localCoreUser.soundLevel = soundLevel;
            _coreUserMap[_localCoreUser.userID].soundLevel = soundLevel;
            _notifySoundLevelUpdate(_localCoreUser.userID, soundLevel);
            // zloginfo('capturedSoundLevelUpdate', soundLevel)
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
    ZegoExpressEngine.instance().on(
        'audioRouteChange',
        (audioRoute) => {
            zloginfo('[audioRouteChange callback]', audioRoute);
            _onAudioRouteChange(audioRoute);
        },
    );
    ZegoExpressEngine.instance().on(
        'IMRecvBroadcastMessage',
        (roomID, messageList) => {
            _onInRoomMessageReceived(roomID, messageList);
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
    ZegoExpressEngine.instance().off('playerStateUpdate');
    ZegoExpressEngine.instance().off('remoteSoundLevelUpdate');
    ZegoExpressEngine.instance().off('capturedSoundLevelUpdate');
    ZegoExpressEngine.instance().off('roomStateChanged');
    ZegoExpressEngine.instance().off('audioRouteChange');
    ZegoExpressEngine.instance().off('IMRecvBroadcastMessage');
}
function _notifyUserCountOrPropertyChanged(type) {
    const msg = ["", "user add", "user delete", "mic update", "camera update"];
    const userList = Object.values(_coreUserMap).sort((user1, user2) => {
        return user2.joinTime - user1.joinTime ;
    }).map(user => _createPublicUser(user));
    zloginfo(`_notifyUserCountOrPropertyChanged ${msg[type]}`, userList);
    Object.keys(_onUserCountOrPropertyChangedCallbackMap).forEach(callbackID => {
        if (_onUserCountOrPropertyChangedCallbackMap[callbackID]) {
            _onUserCountOrPropertyChangedCallbackMap[callbackID](userList);
        }
    })
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Stream Handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function _getUserIDByStreamID(streamID) {
    // StreamID format: roomid_userid_main
    for (const userID in _coreUserMap) {
        if ( _coreUserMap[userID].streamID == streamID) {
            return userID;
        }
    }
    return ''
}
function _getPublishStreamID() {
    return _currentRoomID + '_' + _localCoreUser.userID + '_main';
}
function _getStreamIDByUserID(userID) {
    return _currentRoomID + '_' + userID + '_main';
}
function _tryStartPublishStream() {
    if (_localCoreUser.isMicDeviceOn || _localCoreUser.isCameraDeviceOn) {
        zloginfo('_tryStartPublishStream', _localCoreUser.isMicDeviceOn, _localCoreUser.isCameraDeviceOn, _localCoreUser.streamID);
        if (!_localCoreUser.streamID) {
            return;
        }
        ZegoExpressEngine.instance().startPublishingStream(_localCoreUser.streamID).then(() => {
            if ((_localCoreUser.streamID in _streamCoreUserMap)) {
                _streamCoreUserMap[_localCoreUser.streamID] = _localCoreUser;

                Object.keys(_onAudioVideoAvailableCallbackMap).forEach(callbackID => {
                    if (_onAudioVideoAvailableCallbackMap[callbackID]) {
                        _onAudioVideoAvailableCallbackMap[callbackID]([_localCoreUser]);
                    }
                })
            }
        });
        zloginfo('ZegoExpressEngine startPreview:', _localCoreUser);
        if (_localCoreUser.viewID > 0) {
            ZegoExpressEngine.instance().startPreview({
                'reactTag': _localCoreUser.viewID,
                'viewMode': _localCoreUser.fillMode,
                'backgroundColor': 0
            }).catch((error) => {
                zlogerror(error);
            });
        }
    }
}
function _tryStopPublishStream(force = false) {
    if (!_localCoreUser.isMicDeviceOn && !_localCoreUser.isCameraDeviceOn) {
        zloginfo('stopPublishStream')
        ZegoExpressEngine.instance().stopPublishingStream();
        ZegoExpressEngine.instance().stopPreview();
        if ((_localCoreUser.streamID in _streamCoreUserMap)) {
            delete _streamCoreUserMap[_localCoreUser.streamID];

            Object.keys(_onAudioVideoUnavailableCallbackMap).forEach(callbackID => {
                if (_onAudioVideoUnavailableCallbackMap[callbackID]) {
                    _onAudioVideoUnavailableCallbackMap[callbackID]([_localCoreUser]);
                }
            })
        }
    }
}
function _tryStartPlayStream(userID) {
    if (userID in _coreUserMap) {
        const user = _coreUserMap[userID];
        zloginfo('_tryStartPlayStream: ', user)
        if (user.streamID !== '') {
            if (user.viewID > 0) {
                ZegoExpressEngine.instance().startPlayingStream(user.streamID, {
                    'reactTag': user.viewID,
                    'viewMode': user.fillMode,
                    'backgroundColor': 0
                });
            } else {
                ZegoExpressEngine.instance().startPlayingStream(user.streamID);
            }
        }
    }
}
function _tryStopPlayStream(userID, force = false) {
    if (userID in _coreUserMap) {
        const user = _coreUserMap[userID];
        if (force || (!user.isMicDeviceOn && !user.isCameraDeviceOn)) {
            ZegoExpressEngine.instance().stopPlayingStream(user.streamID);
        }
    }
}
function _notifyUserInfoUpdate(userInfo) {
    Object.keys(_onUserInfoUpdateCallbackMap).forEach(callbackID => {
        if (_onUserInfoUpdateCallbackMap[callbackID]) {
            _onUserInfoUpdateCallbackMap[callbackID](userInfo);
        }
    })
}
function _notifySoundLevelUpdate(userID, soundLevel) {
    Object.keys(_onSoundLevelUpdateCallbackMap).forEach(callbackID => {
        if (_onSoundLevelUpdateCallbackMap[callbackID]) {
            _onSoundLevelUpdateCallbackMap[callbackID](userID, soundLevel);
        }
    });
}

export default {
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Internal <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    isRoomConnected() {
        return _isRoomConnected;
    },
    updateRenderingProperty(userID, viewID, fillMode) {
        zloginfo('updateRenderingProperty: ', userID, viewID, fillMode, '<<<<<<<<<<<<<<<<<<<<<<<<<<')
        if (userID === undefined) {
            zlogwarning('updateRenderingProperty: ignore undifine useid. Use empty string for local user.')
            return;
        }
        if (userID === '') {
            userID = _localCoreUser.userID;
        }
        if (userID in _coreUserMap) {
            _coreUserMap[userID].viewID = viewID;
            _coreUserMap[userID].fillMode = fillMode;
            _notifyUserInfoUpdate(_coreUserMap[userID]);

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
                }
            }
        }
    },
    onUserInfoUpdate(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onUserInfoUpdateCallbackMap) {
                zloginfo('[onUserInfoUpdate] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onUserInfoUpdateCallbackMap[callbackID];
            }
        } else {
            _onUserInfoUpdateCallbackMap[callbackID] = callback;
        }
    },
    onSoundLevelUpdate(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onSoundLevelUpdateCallbackMap) {
                zloginfo('[onSoundLevelUpdate] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onSoundLevelUpdateCallbackMap[callbackID];
            }
        } else {
            _onSoundLevelUpdateCallbackMap[callbackID] = callback;
        }
    },
    onSDKConnected(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onSDKConnectedCallbackMap) {
                zloginfo('[onSDKConnected] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onSDKConnectedCallbackMap[callbackID];
            }
        } else {
            _onSDKConnectedCallbackMap[callbackID] = callback;
        }
    },
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SDK <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    connectSDK(appID, appSign, userInfo) {
        return new Promise((resolve, reject) => {
            // set advancedConfig to monitor remote user's device changed
            ZegoExpressEngine.setEngineConfig({
                advancedConfig: {
                    'notify_remote_device_unknown_status': 'true',
                    'notify_remote_device_init_status': 'true',
                }
            });
            const engineProfile = {
                appID: appID,
                appSign: appSign,
                scenario: 0,
            }
            ZegoExpressEngine.createEngineWithProfile(engineProfile).then((engine) => {
                zloginfo('Create ZegoExpressEngine succeed!');

                _unregisterEngineCallback();
                _registerEngineCallback();

                _setLocalUserInfo(userInfo);

                Object.keys(_onSDKConnectedCallbackMap).forEach(callbackID => {
                    // TODO cause  WARN  Possible Unhandled Promise Rejection (id: 56)
                    if (_onSDKConnectedCallbackMap[callbackID]) {
                        _onSDKConnectedCallbackMap[callbackID]();
                    }
                });
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
                }).finally(() => {
                    _resetData();
                })
            } else {
                resolve();
            }
        });
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Audio Video <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    useFrontFacingCamera(isFrontFacing) {
        zloginfo('Use front facing camera: ', isFrontFacing);
        _usingFrontFacingCamera = isFrontFacing;
        return ZegoExpressEngine.instance().useFrontCamera(isFrontFacing, 0);
    },
    isUsingFrontFacingCamera() {
        return _usingFrontFacingCamera;
    },
    isMicDeviceOn(userID) {
        if (!userID) {
            return _localCoreUser.isMicDeviceOn;
        }
        else if (userID in _coreUserMap) {
            return _coreUserMap[userID].isMicDeviceOn;
        } else {
            zlogwarning('Can not check mic device is on for user[', userID, '], because no record!');
            return true;
        }
    },
    isCameraDeviceOn(userID) {
        if (!userID) {
            return _localCoreUser.isCameraDeviceOn;
        }
        else if (userID in _coreUserMap) {
            return _coreUserMap[userID].isCameraDeviceOn;
        } else {
            zlogwarning('No record for user: ', userID, '. Can not check camera device is on.')
            return true;
        }
    },
    enableSpeaker(enable) {
        // TODO
        return new Promise((resolve, reject) => {
            if (!_isRoomConnected) {
                zlogerror('You are not connect to any room.')
                reject();
            } else {
                ZegoExpressEngine.instance().muteSpeaker(!enable);
                resolve();
            }
        });
    },
    audioOutputDeviceType() {
        return _audioOutputType;
    },
    turnMicDeviceOn(userID, on) {
        return new Promise((resolve, reject) => {
            if (_isLocalUser(userID)) {
                zloginfo('turnMicDeviceOn: ', _localCoreUser.userID, on);
                ZegoExpressEngine.instance().muteMicrophone(!on);

                _onRemoteMicStateUpdate(_localCoreUser.userID, on ? 0 : 10); // 0 for open, 10 for mute

                _localCoreUser.isMicDeviceOn = on;
                _coreUserMap[_localCoreUser.userID].isMicDeviceOn = on;
                _notifyUserInfoUpdate(_localCoreUser);
                _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.microphoneStateUpdate);

                if (on) {
                    _tryStartPublishStream();
                } else {
                    _tryStopPublishStream();
                }
                resolve();
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
                // Default to Main Channel
                zloginfo('turnCameraDeviceOn: ', _localCoreUser.userID, on);
                ZegoExpressEngine.instance().enableCamera(on, 0);

                _onRemoteCameraStateUpdate(_localCoreUser.userID, on ? 0 : 10); // 0 for open, 10 for mute

                _localCoreUser.isCameraDeviceOn = on;
                // if (!on) {
                //     _localCoreUser.viewID = -1;
                // }
                _coreUserMap[_localCoreUser.userID] = _localCoreUser;
                _notifyUserInfoUpdate(_localCoreUser);
                _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.cameraStateUpdate);

                if (on) {
                    _tryStartPublishStream();
                } else {
                    _tryStopPublishStream();
                }
                resolve();
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
        } else {
            _onCameraDeviceOnCallbackMap[callbackID] = callback;
        }
    },
    setAudioOutputToSpeaker(isSpeaker) {
        ZegoExpressEngine.instance().setAudioRouteToSpeaker(isSpeaker);
    },
    onAudioOutputDeviceTypeChange(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onAudioOutputDeviceTypeChangeCallbackMap) {
                zloginfo('[onAudioOutputDeviceTypeChange] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onAudioOutputDeviceTypeChangeCallbackMap[callbackID];
            }
        } else {
            _onAudioOutputDeviceTypeChangeCallbackMap[callbackID] = callback;
        }
    },
    setAudioConfig(config) {
        // TODO
    },
    setVideoConfig(config) {
        // TODO
    },
    onAudioVideoAvailable(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onAudioVideoAvailableCallbackMap) {
                zloginfo('[onAudioVideoAvailable] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onAudioVideoAvailableCallbackMap[callbackID];
            }
        } else {
            _onAudioVideoAvailableCallbackMap[callbackID] = callback;
        }
    },
    onAudioVideoUnavailable(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onAudioVideoUnavailableCallbackMap) {
                zloginfo('[onAudioVideoUnavailable] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onAudioVideoUnavailableCallbackMap[callbackID];
            }
        } else {
            _onAudioVideoUnavailableCallbackMap[callbackID] = callback;
        }
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Room <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    joinRoom(roomID) {
        return new Promise((resolve, reject) => {
            const user = { userID: _localCoreUser.userID, userName: _localCoreUser.userName };
            const config = { isUserStatusNotify: true }
            _currentRoomID = roomID;
            ZegoExpressEngine.instance().loginRoom(roomID, user, config).then(() => {
                zloginfo('Join room success.', user)
                ZegoExpressEngine.instance().startSoundLevelMonitor();

                _localCoreUser.streamID = _getPublishStreamID();
                _coreUserMap[_localCoreUser.userID] = _localCoreUser;
                _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.userAdd);
                resolve();
            }).catch((error) => {
                zlogerror('Join room falied: ', error);
                _currentRoomID = '';
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
                zloginfo('leaveRoom: ', _currentRoomID)
                ZegoExpressEngine.instance().logoutRoom(_currentRoomID).then(() => {
                    zloginfo('Leave room succeed.')
                    ZegoExpressEngine.instance().stopSoundLevelMonitor();
                    _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.userDelete);
                    _resetDataForLeavingRoom();
                    resolve();
                }).catch((error) => {
                    zlogerror('Leave room failed: ', error);
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
    connectUser(userID, userName) {
        _setLocalUserInfo({ userID: userID, userName: userName });
        // TODO ZIM login
    },
    disconnectUser() {
        delete _coreUserMap[_localCoreUser.userID];
        _localCoreUser = _createCoreUser('', '', '', {});
        // TODO ZIM logout
    },
    getLocalUserInfo() {
        return _localCoreUser;
    },
    getUser(userID) {
        return _coreUserMap[userID];
    },
    getAllUsers() {
        const users = Object.values(_coreUserMap);
        users.sort((a, b) => { return a.joinTime > b.joinTime })
        var publicUsers = [];
        users.forEach(user => {
            publicUsers.push(_createPublicUser(user));
        })
        return publicUsers;
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
    },
    onOnlySelfInRoom(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onOnlySelfInRoomCallbackMap) {
                zloginfo('[onOnlySelfInRoom] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onOnlySelfInRoomCallbackMap[callbackID];
            }
        } else {
            _onOnlySelfInRoomCallbackMap[callbackID] = callback;
        }
    },
    onUserCountOrPropertyChanged(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onUserCountOrPropertyChangedCallbackMap) {
                zloginfo('[onUserCountOrPropertyChanged] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onUserCountOrPropertyChangedCallbackMap[callbackID];
            }
        } else {
            _onUserCountOrPropertyChangedCallbackMap[callbackID] = callback;
        }
    },

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Message <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    getInRoomMessages() {
        return _inRoomMessageList;
    },
    sendInRoomMessage(message) {
        return new Promise((resolve, reject) => {
            ZegoExpressEngine.instance().sendBroadcastMessage(_currentRoomID, message).then((result) => {
                zloginfo('SendInRoomMessage finished.', result);
                const { errorCode, messageID } = result;
                if (errorCode > 0) {
                    reject(errorCode)
                } else {
                    const inRoomMessage = {
                        message: message,
                        messageID: messageID,
                        sendTime: Date.now(),
                        sender: _createPublicUser(_localCoreUser)
                    }
                    _inRoomMessageList.push(inRoomMessage);

                    Object.keys(_onInRoomMessageSentCallbackMap).forEach(callbackID => {
                        // callback may remove from map during room state chaging
                        if (callbackID in _onInRoomMessageSentCallbackMap) {
                            if (_onInRoomMessageSentCallbackMap[callbackID]) {
                                _onInRoomMessageSentCallbackMap[callbackID](errorCode, messageID);
                            }
                        }
                    });

                    resolve(result);
                }
            }).catch((error) => {
                zlogerror('SendInRoomMessage falied: ', error);
                reject(error);
            });
        });
    },
    onInRoomMessageReceived(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onInRoomMessageReceivedCallbackMap) {
                zloginfo('[onInRoomMessageReceived] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onInRoomMessageReceivedCallbackMap[callbackID];
            }
        } else {
            _onInRoomMessageReceivedCallbackMap[callbackID] = callback;
        }
    },
    onInRoomMessageSent(callbackID, callback) {
        if (typeof callback !== 'function') {
            if (callbackID in _onInRoomMessageSentCallbackMap) {
                zloginfo('[onInRoomMessageSent] Remove callback for: [', callbackID, '] because callback is not a valid function!');
                delete _onInRoomMessageSentCallbackMap[callbackID];
            }
        } else {
            _onInRoomMessageSentCallbackMap[callbackID] = callback;
        }
    }
}