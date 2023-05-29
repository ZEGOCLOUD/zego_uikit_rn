import ZegoExpressEngine, {
  ZegoRoomStateChangedReason,
  ZegoAudioRoute,
  ZegoUser,
  ZegoEngineProfile,
  ZegoRoomConfig,
} from 'zego-express-engine-reactnative';
import { zlogerror, zloginfo, zlogwarning } from '../../utils/logger';
import { ZegoAudioVideoResourceMode, ZegoChangedCountOrProperty, ZegoRoomPropertyUpdateType } from './defines'

var _appInfo = {
  appID: 0,
  appSign: '',
};
var _isRoomConnected = false;
var _currentRoomState = 7; // Logout
var _currentRoomID = '';
var _audioOutputType = 0;
var _usingFrontFacingCamera = true;

var _onMicDeviceOnCallbackMap: any = {};
var _onCameraDeviceOnCallbackMap: any = {};
var _onRoomStateChangedCallbackMap: any = {};
var _onRequireNewTokenCallbackMap: any = {};
var _onUserJoinCallbackMap: any = {};
var _onUserLeaveCallbackMap: any = {};
var _onUserInfoUpdateCallbackMap: any = {};
var _onSoundLevelUpdateCallbackMap: any = {};
var _onSDKConnectedCallbackMap: any = {};
var _onAudioOutputDeviceTypeChangeCallbackMap: any = {};
var _onOnlySelfInRoomCallbackMap: any = {};
var _onUserCountOrPropertyChangedCallbackMap: any = {};
var _onAudioVideoAvailableCallbackMap: any = {};
var _onAudioVideoUnavailableCallbackMap: any = {};
var _onInRoomMessageReceivedCallbackMap: any = {};
var _onInRoomMessageSentCallbackMap: any = {};
var _onRoomPropertyUpdatedCallbackMap: any = {};
var _onRoomPropertiesFullUpdatedCallbackMap: any = {};
var _onInRoomCommandReceivedCallbackMap: any = {};
var _onMeRemovedFromRoomCallbackMap: any = {};
var _onTurnOnYourCameraRequestCallbackMap: any = {};
var _onTurnOnYourMicrophoneRequestCallbackMap: any = {};

// Force update component callback
var _onMemberListForceSortCallbackMap: any = {};
var _onAudioVideoListForceSortCallbackMap: any = {};
var _onVideoViewForceRenderCallbackMap: any = {};

var _localCoreUser: any = _createCoreUser('', '', '', {});
var _streamCoreUserMap: any = {}; // <streamID, CoreUser>
var _coreUserMap: any = {}; // <userID, CoreUser>
var _qualityUpdateLogCounter = 0;

var _inRoomMessageList: any[] = [];
var _audioVideoResourceMode = ZegoAudioVideoResourceMode.Default;
var _roomProperties: any = {};
var _isLargeRoom = false;
var _roomMemberCount = 0;
var _markAsLargeRoom = false;

function _resetData() {
  zloginfo('Reset all data.');
  _appInfo = { appID: 0, appSign: '' };
  _localCoreUser = _createCoreUser('', '', '', {});
  _streamCoreUserMap = {};
  _coreUserMap = {};
  _currentRoomID = '';
  _currentRoomState = 7;
  _isRoomConnected = false;
  _audioOutputType = 0;
  _inRoomMessageList = [];
  _audioVideoResourceMode = ZegoAudioVideoResourceMode.Default;
  _isLargeRoom = false;
  _roomMemberCount = 0;
  _markAsLargeRoom = false;
}

function _resetDataForLeavingRoom() {
  zloginfo('Reset data for leaving room.');
  _streamCoreUserMap = {};
  _coreUserMap = {};
  _currentRoomID = '';
  _currentRoomState = 7;
  _isRoomConnected = false;
  const { userID, userName, profileUrl, extendInfo } = _localCoreUser;
  _localCoreUser = _createCoreUser(userID, userName, profileUrl, extendInfo);
  _coreUserMap[_localCoreUser.userID] = _localCoreUser;
  _inRoomMessageList = [];
  _roomProperties = {};
  _isLargeRoom = false;
  _roomMemberCount = 0;
  _markAsLargeRoom = false;
}

function _createPublicUser(coreUser: any) {
  return {
    userID: coreUser.userID,
    userName: coreUser.userName,
    extendInfo: coreUser.extendInfo,
    isMicrophoneOn: coreUser.isMicDeviceOn,
    isCameraOn: coreUser.isCameraDeviceOn,
    soundLevel: coreUser.soundLevel,
    inRoomAttributes: coreUser.inRoomAttributes,
    avatar: coreUser.avatar,
  };
}
function _createCoreUser(userID: string, userName: string, profileUrl?: string, extendInfo?: any) {
  return {
    userID: userID,
    userName: userName,
    profileUrl: profileUrl,
    extendInfo: extendInfo,
    viewID: -1,
    viewFillMode: 1,
    streamID: '',
    isMicDeviceOn: false,
    isCameraDeviceOn: false,
    publisherQuality: 0,
    soundLevel: 0,
    joinTime: 0,
    inRoomAttributes: {},
    avatar: '',
  };
}
function _isLocalUser(userID: string) {
  return (
    userID === undefined || userID === '' || _localCoreUser.userID === userID
  );
}
function _setLocalUserInfo(userInfo: any) {
  _localCoreUser = _createCoreUser(
    userInfo.userID,
    userInfo.userName,
    userInfo.profileUrl,
    userInfo.extendInfo
  );
  _coreUserMap[userInfo.userID] = _localCoreUser;
}

function _onRoomUserUpdate(roomID: string, updateType: number, userList: any[]) {
  // No need for roomID, does not support multi-room right now.
  const userInfoList: any[] = [];
  if (updateType == 0) {
    _roomMemberCount += userList.length;
    if (_roomMemberCount >= 500) {
      _isLargeRoom = true;
    }
    userList.forEach((user) => {
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

    zloginfo('User Join: ', userInfoList);
    Object.keys(_onUserJoinCallbackMap).forEach((callbackID) => {
      if (_onUserJoinCallbackMap[callbackID]) {
        _onUserJoinCallbackMap[callbackID](userInfoList);
      }
    });
  } else {
    _roomMemberCount -= userList.length;
    userList.forEach((user) => {
      if (user.userID in _coreUserMap) {
        const coreUser = _coreUserMap[user.userID];
        const userInfo = {
          userID: coreUser.userID,
          userName: coreUser.userName,
          profileUrl: coreUser.profileUrl,
          extendInfo: coreUser.extendInfo,
        };
        userInfoList.push(userInfo);

        // Stop play stream before remove user list
        _tryStopPlayStream(coreUser.userID, true);
        delete _coreUserMap[user.userID];
      }
    });
    _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.userDelete);
    zloginfo('User Leave: ', userInfoList);
    Object.keys(_onUserLeaveCallbackMap).forEach((callbackID) => {
      if (_onUserLeaveCallbackMap[callbackID]) {
        _onUserLeaveCallbackMap[callbackID](userInfoList);
      }
    });
    if (Object.keys(_coreUserMap).length <= 1) {
      Object.keys(_onOnlySelfInRoomCallbackMap).forEach((callbackID) => {
        if (_onOnlySelfInRoomCallbackMap[callbackID]) {
          _onOnlySelfInRoomCallbackMap[callbackID]();
        }
      });
    }
  }
}
function _onRoomStreamUpdate(roomID: string, updateType: number, streamList: any[]) {
  zloginfo('_onRoomStreamUpdate: ', roomID, updateType, streamList);
  var users: any[] = [];
  if (updateType == 0) {
    // Add
    streamList.forEach((stream) => {
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
        _streamCoreUserMap[streamID] = _createCoreUser(
          userID,
          userName,
          '',
          {}
        );
        _streamCoreUserMap[streamID].streamID = streamID;

        _coreUserMap[userID] = _streamCoreUserMap[streamID];

        users.push(_streamCoreUserMap[streamID]);
      }
    });

    Object.keys(_onAudioVideoAvailableCallbackMap).forEach((callbackID) => {
      if (_onAudioVideoAvailableCallbackMap[callbackID]) {
        _onAudioVideoAvailableCallbackMap[callbackID](users);
      }
    });
  } else {
    streamList.forEach((stream) => {
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
    });
    _notifyUserCountOrPropertyChanged(
      ZegoChangedCountOrProperty.cameraStateUpdate
    );

    Object.keys(_onAudioVideoUnavailableCallbackMap).forEach((callbackID) => {
      if (_onAudioVideoUnavailableCallbackMap[callbackID]) {
        _onAudioVideoUnavailableCallbackMap[callbackID](users);
      }
    });
  }
}
function _onRemoteCameraStateUpdate(userID: string, isOn: boolean) {
  if (userID in _coreUserMap) {
    _coreUserMap[userID].isCameraDeviceOn = isOn;
    _notifyUserInfoUpdate(_coreUserMap[userID]);
    _notifyUserCountOrPropertyChanged(
      ZegoChangedCountOrProperty.cameraStateUpdate
    );

    Object.keys(_onCameraDeviceOnCallbackMap).forEach((callbackID) => {
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
function _onAudioRouteChange(type: ZegoAudioRoute) {
  Object.keys(_onAudioOutputDeviceTypeChangeCallbackMap).forEach(
    (callbackID) => {
      if (_onAudioOutputDeviceTypeChangeCallbackMap[callbackID]) {
        _onAudioOutputDeviceTypeChangeCallbackMap[callbackID](type);
      }
    }
  );
  _audioOutputType = type;
}
function _onRemoteMicStateUpdate(userID: string, isOn: boolean) {
  if (userID in _coreUserMap) {
    _coreUserMap[userID].isMicDeviceOn = isOn;
    _notifyUserInfoUpdate(_coreUserMap[userID]);
    _notifyUserCountOrPropertyChanged(
      ZegoChangedCountOrProperty.microphoneStateUpdate
    );

    Object.keys(_onMicDeviceOnCallbackMap).forEach((callbackID) => {
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
function _onRoomStateChanged(roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, extendedData: string) {
  zloginfo('Room state chaged: ', roomID, reason, errorCode, extendedData);
  // Not support multi-room right now
  if (reason == 1 || reason == 4) {
    // Logined || Reconnected
    _isRoomConnected = true;
    _tryStartPublishStream();
  } else {
    _isRoomConnected = false;
    if (reason == 6) {
      // KickOut
      _notifyMeRemovedFromRoom();
    }
  }
  _currentRoomState = reason;

  Object.keys(_onRoomStateChangedCallbackMap).forEach((callbackID) => {
    // callback may remove from map during room state chaging
    if (callbackID in _onRoomStateChangedCallbackMap) {
      if (_onRoomStateChangedCallbackMap[callbackID]) {
        _onRoomStateChangedCallbackMap[callbackID](
          reason,
          errorCode,
          extendedData
        );
      }
    }
  });
}
function _onInRoomMessageReceived(roomID: string, messageList: any[]) {
  zloginfo('Received in room message: ', roomID, messageList.length);
  var messages: any[] = [];
  messageList.forEach((msg) => {
    const message = {
      message: msg.message,
      messageID: msg.messageID,
      sendTime: msg.sendTime,
      sender: _createPublicUser(_coreUserMap[msg.fromUser.userID]),
    };
    messages.push(message);
    _inRoomMessageList.push(message);
  });

  Object.keys(_onInRoomMessageReceivedCallbackMap).forEach((callbackID) => {
    // callback may remove from map during room state chaging
    if (callbackID in _onInRoomMessageReceivedCallbackMap) {
      if (_onInRoomMessageReceivedCallbackMap[callbackID]) {
        _onInRoomMessageReceivedCallbackMap[callbackID](messages);
      }
    }
  });
}
function _onRequireNewToken() {
  Object.keys(_onRequireNewTokenCallbackMap).forEach((callbackID) => {
    if (callbackID in _onRequireNewTokenCallbackMap) {
      if (_onRequireNewTokenCallbackMap[callbackID]) {
        const token = _onRequireNewTokenCallbackMap[callbackID]();
        if (token) {
          ZegoExpressEngine.instance()
            .renewToken(_currentRoomID, token)
            .then(() => {
              zloginfo('Renew token success');
            })
            .catch((error) => {
              zlogerror('Renew token failed: ', error);
            });
        } else {
          zlogerror('Renew token failed: the returned token is abnormal');
        }
      }
    }
  });
}
function _onRoomExtraInfoUpdate(roomID: string, roomExtraInfoList: any[]) {
  zloginfo('$$$$$$$$Room extra info update: ', roomID, roomExtraInfoList);
  const updateKeys: string[]= [];
  const oldRoomProperties = JSON.parse(JSON.stringify(_roomProperties));
  roomExtraInfoList.forEach(({ key, updateTime, updateUser, value }) => {
    if (key === 'extra_info') {
      const roomProperties = JSON.parse(value);
      Object.keys(roomProperties).forEach((propertyKey) => {
        if (oldRoomProperties[propertyKey] !== roomProperties[propertyKey]) {
          updateKeys.push(propertyKey);
          _roomProperties[propertyKey] = roomProperties[propertyKey];
          _notifyRoomPropertyUpdate(propertyKey, oldRoomProperties[propertyKey], roomProperties[propertyKey], ZegoRoomPropertyUpdateType.remote);
        }
      })
    }
  });
  if (updateKeys.length > 0) {
    _notifyRoomPropertiesFullUpdate(updateKeys, oldRoomProperties, JSON.parse(JSON.stringify(_roomProperties)), ZegoRoomPropertyUpdateType.remote);
  }
}
function _onIMCustomCommandReceived(roomID: string, fromUser: ZegoUser, command: string) {
  try {
    const commandObj = JSON.parse(command);
    if (commandObj && typeof commandObj === 'object') {
      fromUser = _createPublicUser(_coreUserMap[fromUser.userID] || fromUser);
      const removeUserIDList = commandObj.zego_remove_user;
      const turnCameraOnUserID = commandObj.zego_turn_camera_on;
      const turnCameraOffUserID = commandObj.zego_turn_camera_off;
      const turnMicrophoneOnUserID = commandObj.zego_turn_microphone_on;
      const turnMicrophoneOffUserID = commandObj.zego_turn_microphone_off;
      if (removeUserIDList && removeUserIDList.find((removeUserID: string) => removeUserID === _localCoreUser.userID)) {
        _notifyMeRemovedFromRoom();
        // Leave the room automatically
        _leaveRoom();
      } else if (turnCameraOnUserID === _localCoreUser.userID) {
        Object.keys(_onTurnOnYourCameraRequestCallbackMap).forEach((callbackID) => {
          if (_onTurnOnYourCameraRequestCallbackMap[callbackID]) {
            _onTurnOnYourCameraRequestCallbackMap[callbackID](fromUser);
          }
        });
      } else if (turnMicrophoneOnUserID === _localCoreUser.userID) {
        Object.keys(_onTurnOnYourMicrophoneRequestCallbackMap).forEach((callbackID) => {
          if (_onTurnOnYourMicrophoneRequestCallbackMap[callbackID]) {
            _onTurnOnYourMicrophoneRequestCallbackMap[callbackID](fromUser);
          }
        });
      } else if (turnCameraOffUserID === _localCoreUser.userID) {
        _turnCameraDeviceOn(_localCoreUser.userID, false);
        // Automatic shutdown
      } else if (turnMicrophoneOffUserID === _localCoreUser.userID) {
        // Automatic shutdown
        _turnMicDeviceOn(_localCoreUser.userID, false);
      }
    }
  } catch (error) {
    console.error(error);
  }
  zloginfo('_onIMCustomCommandReceived: ', roomID, fromUser, command);
  Object.keys(_onInRoomCommandReceivedCallbackMap).forEach((callbackID) => {
    if (callbackID in _onInRoomCommandReceivedCallbackMap) {
      if (_onInRoomCommandReceivedCallbackMap[callbackID]) {
        _onInRoomCommandReceivedCallbackMap[callbackID](fromUser, command);
      }
    }
  });
}
function _sendInRoomCommand(command: string, toUserList: any[]) {
  if (!_isRoomConnected) {
    zlogerror('You need to join the room before using this interface!');
    return Promise.reject();
  }
  return new Promise<void>((resolve, reject) => {
    ZegoExpressEngine.instance().sendCustomCommand(_currentRoomID, command, toUserList).then(({ errorCode }) => {
      if (errorCode === 0) {
        zloginfo('[sendInRoomCommand]Send successfully', toUserList);
        resolve();
      } else {
        zloginfo('[sendInRoomCommand]Send failure', toUserList);
        reject();
      }
    }).catch((error) => {
      zloginfo('[sendInRoomCommand]Send error', error);
      reject();
    })
  });
}
function _leaveRoom() {
  return new Promise<void>((resolve, reject) => {
    if (_currentRoomID == '') {
      zlogwarning('You are not join in any room, no need to leave room.');
      resolve();
    } else {
      zloginfo('leaveRoom: ', _currentRoomID);
      ZegoExpressEngine.instance()
        .logoutRoom(_currentRoomID)
        .then(() => {
          zloginfo('Leave room succeed.');
          ZegoExpressEngine.instance().stopSoundLevelMonitor();
          _notifyUserCountOrPropertyChanged(
            ZegoChangedCountOrProperty.userDelete
          );
          _resetDataForLeavingRoom();
          resolve();
        })
        .catch((error) => {
          zlogerror('Leave room failed: ', error);
          reject(error);
        });
    }
  });
}
function _turnMicDeviceOn(userID: string, on: boolean) {
  return new Promise<void>((resolve, reject) => {
    if (_isLocalUser(userID)) {
      zloginfo('turnMicDeviceOn: ', _localCoreUser.userID, on);
      ZegoExpressEngine.instance().muteMicrophone(!on);

      _onRemoteMicStateUpdate(_localCoreUser.userID, on);

      _localCoreUser.isMicDeviceOn = on;
      _coreUserMap[_localCoreUser.userID].isMicDeviceOn = on;
      _notifyUserInfoUpdate(_localCoreUser);
      _notifyUserCountOrPropertyChanged(
        ZegoChangedCountOrProperty.microphoneStateUpdate
      );

      // sync device status via stream extra info
      var extraInfo = {
          isCameraOn : _localCoreUser.isCameraDeviceOn,
          isMicrophoneOn : on
      }
      ZegoExpressEngine.instance().setStreamExtraInfo(JSON.stringify(extraInfo))

      if (on) {
        _tryStartPublishStream();
      } else {
        _tryStopPublishStream();
      }
      resolve();
    } else {
      const isLargeRoom = _isLargeRoom || _markAsLargeRoom;
      const command = on ? JSON.stringify({ zego_turn_microphone_on: userID }) : JSON.stringify({ zego_turn_microphone_off: userID });
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? (userInfo.userName || '') : '';
      const toUserList = isLargeRoom ? [] : [{ userID, userName }];
      _sendInRoomCommand(command, toUserList).then(() => {
        zloginfo('turnMicDeviceOn others: ', userID, on);
        resolve();
      }).catch(() => {
        zlogerror('turnMicDeviceOn others error: ', userID, on);
        reject();
      });
    }
  });
}
function _turnCameraDeviceOn(userID: string, on: boolean) {
  return new Promise<void>((resolve, reject) => {
    if (_isLocalUser(userID)) {
      // Default to Main Channel
      zloginfo('turnCameraDeviceOn: ', _localCoreUser.userID, on);
      ZegoExpressEngine.instance().enableCamera(on, 0);

      _onRemoteCameraStateUpdate(_localCoreUser.userID, on);

      _localCoreUser.isCameraDeviceOn = on;
      // if (!on) {
      //     _localCoreUser.viewID = -1;
      // }
      _coreUserMap[_localCoreUser.userID] = _localCoreUser;
      _notifyUserInfoUpdate(_localCoreUser);
      _notifyUserCountOrPropertyChanged(
        ZegoChangedCountOrProperty.cameraStateUpdate
      );

      // sync device status via stream extra info
      var extraInfo = {
          isCameraOn : on,
          isMicrophoneOn : _localCoreUser.isMicDeviceOn
      }
      ZegoExpressEngine.instance().setStreamExtraInfo(JSON.stringify(extraInfo))

      if (on) {
        _tryStartPublishStream();
      } else {
        _tryStopPublishStream();
      }
      resolve();
    } else {
      const isLargeRoom = _isLargeRoom || _markAsLargeRoom;
      const command = on ? JSON.stringify({ zego_turn_camera_on: userID }) : JSON.stringify({ zego_turn_camera_off: userID });
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? (userInfo.userName || '') : '';
      const toUserList = isLargeRoom ? [] : [{ userID, userName }];
      _sendInRoomCommand(command, toUserList).then(() => {
        zloginfo('turnCameraDeviceOn others: ', userID, on);
        resolve();
      }).catch(() => {
        zlogerror('turnCameraDeviceOn others error: ', userID, on);
        reject();
      });
    }
  });
}
function _registerEngineCallback() {
  zloginfo('Register callback for ZegoExpressEngine...');
  ZegoExpressEngine.instance().on(
    'roomUserUpdate',
    (roomID, updateType, userList) => {
      zloginfo('[roomUserUpdate callback]', roomID, updateType, userList);
      _onRoomUserUpdate(roomID, updateType, userList);
    }
  );
  ZegoExpressEngine.instance().on(
    'roomStreamUpdate',
    (roomID, updateType, streamList) => {
      zloginfo('[roomStreamUpdate callback]', roomID, updateType, streamList);
      _onRoomStreamUpdate(roomID, updateType, streamList);
    }
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
    }
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
        // zloginfo('[playerQualityUpdate callback]', streamID, quality);
      }
      // TODO
    }
  );
  ZegoExpressEngine.instance().on(
    'remoteCameraStateUpdate',
    (streamID, state) => {
      zloginfo('[remoteCameraStateUpdate callback]', streamID, state);
      // 0 for device is on
      _onRemoteCameraStateUpdate(_getUserIDByStreamID(streamID), state == 0);
    }
  );
  ZegoExpressEngine.instance().on('remoteMicStateUpdate', (streamID, state) => {
    zloginfo('[remoteMicStateUpdate callback]', streamID, state);
    // 0 for device is on
    _onRemoteMicStateUpdate(_getUserIDByStreamID(streamID), state == 0);
  });
  ZegoExpressEngine.instance().on(
    'playerStateUpdate',
    (streamID, state, errorCode, extendedData) => {
      zloginfo(
        '[playerStateUpdate callback]',
        streamID,
        state,
        errorCode,
        extendedData
      );
    }
  );
  ZegoExpressEngine.instance().on('remoteSoundLevelUpdate', (soundLevels: any) => {
    // {streamID, soundLavel} value from 0.0 to 100.0
    // zloginfo('[remoteSoundLevelUpdate callback]', soundLevels);
    Object.keys(soundLevels).forEach((streamID) => {
      const userID = _getUserIDByStreamID(streamID);
      if (userID in _coreUserMap) {
        _coreUserMap[userID].soundLevel = soundLevels[streamID];
        _notifySoundLevelUpdate(userID, soundLevels[streamID]);
      }
    });
  });
  ZegoExpressEngine.instance().on('capturedSoundLevelUpdate', (soundLevel) => {
    if (
      _localCoreUser.userID === '' ||
      !(_localCoreUser.userID in _coreUserMap)
    ) {
      return;
    }
    _localCoreUser.soundLevel = soundLevel;
    _coreUserMap[_localCoreUser.userID].soundLevel = soundLevel;
    _notifySoundLevelUpdate(_localCoreUser.userID, soundLevel);
    // zloginfo('capturedSoundLevelUpdate', soundLevel)
  });
  // https://doc-en-api.zego.im/ReactNative/enums/_zegoexpressdefines_.zegoroomstatechangedreason.html
  ZegoExpressEngine.instance().on(
    'roomStateChanged',
    (roomID, reason, errorCode, extendedData) => {
      zloginfo(
        '[roomStateChanged callback]',
        roomID,
        reason,
        errorCode,
        extendedData
      );
      _onRoomStateChanged(roomID, reason, errorCode, extendedData);
    }
  );
  ZegoExpressEngine.instance().on('audioRouteChange', (audioRoute) => {
    zloginfo('[audioRouteChange callback]', audioRoute);
    _onAudioRouteChange(audioRoute);
  });
  ZegoExpressEngine.instance().on(
    'IMRecvBroadcastMessage',
    (roomID, messageList) => {
      _onInRoomMessageReceived(roomID, messageList);
    }
  );
  ZegoExpressEngine.instance().on(
    'roomTokenWillExpire',
    (roomID, remainTimeInSecond) => {
      _onRequireNewToken();
    }
  );
  ZegoExpressEngine.instance().on('roomExtraInfoUpdate', (roomID, roomExtraInfoList) => {
    _onRoomExtraInfoUpdate(roomID, roomExtraInfoList);
  });
  ZegoExpressEngine.instance().on('roomStreamExtraInfoUpdate', (roomID, streamList) => {
    zloginfo('roomStreamExtraInfoUpdate', streamList)
    streamList.forEach((stream) => {
        try {
            var extraInfo = JSON.parse(stream.extraInfo)
            if ('isCameraOn' in extraInfo) {
                _onRemoteCameraStateUpdate(stream.user.userID, extraInfo.isCameraOn)
            }
            if ('isMicrophoneOn' in extraInfo) {
                _onRemoteMicStateUpdate(stream.user.userID, extraInfo.isMicrophoneOn)
            }
        } catch (error) {
            zlogerror('roomStreamExtraInfoUpdate ERROR: ', error)
        }
    })
  });
  ZegoExpressEngine.instance().on('IMRecvCustomCommand', (roomID, fromUser, command) => {
    zloginfo('IMRecvCustomCommand', roomID, fromUser, command);
    _onIMCustomCommandReceived(roomID, fromUser, command);
  });
}
function _unregisterEngineCallback() {
  zloginfo('Unregister callback from ZegoExpressEngine...');
  ZegoExpressEngine.instance().off('roomUserUpdate', undefined);
  ZegoExpressEngine.instance().off('roomStreamUpdate', undefined);
  ZegoExpressEngine.instance().off('publisherQualityUpdate', undefined);
  ZegoExpressEngine.instance().off('playerQualityUpdate', undefined);
  ZegoExpressEngine.instance().off('remoteCameraStateUpdate', undefined);
  ZegoExpressEngine.instance().off('remoteMicStateUpdate', undefined);
  ZegoExpressEngine.instance().off('playerStateUpdate', undefined);
  ZegoExpressEngine.instance().off('remoteSoundLevelUpdate', undefined);
  ZegoExpressEngine.instance().off('capturedSoundLevelUpdate', undefined);
  ZegoExpressEngine.instance().off('roomStateChanged', undefined);
  ZegoExpressEngine.instance().off('audioRouteChange', undefined);
  ZegoExpressEngine.instance().off('IMRecvBroadcastMessage', undefined);
  ZegoExpressEngine.instance().off('roomExtraInfoUpdate', undefined);
  ZegoExpressEngine.instance().off('roomStreamExtraInfoUpdate', undefined);
  ZegoExpressEngine.instance().off('IMRecvCustomCommand', undefined);
}
function _notifyUserCountOrPropertyChanged(type: number) {
  const msg = [
    '',
    'user add',
    'user delete',
    'mic update',
    'camera update',
    'attributes update',
  ];
  const userList = Object.values(_coreUserMap)
    .sort((user1: any, user2: any) => {
      return user2.joinTime - user1.joinTime;
    })
    .map((user) => _createPublicUser(user));
  zloginfo(`_notifyUserCountOrPropertyChanged ${msg[type]}`, userList);
  Object.keys(_onUserCountOrPropertyChangedCallbackMap).forEach(
    (callbackID) => {
      if (_onUserCountOrPropertyChangedCallbackMap[callbackID]) {
        _onUserCountOrPropertyChangedCallbackMap[callbackID](
          JSON.parse(JSON.stringify(userList))
        );
      }
    }
  );
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Stream Handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function _getUserIDByStreamID(streamID: string) {
  // StreamID format: roomid_userid_main
  for (const userID in _coreUserMap) {
    if (_coreUserMap[userID].streamID == streamID) {
      return userID;
    }
  }
  return '';
}
function _getPublishStreamID() {
  return _currentRoomID + '_' + _localCoreUser.userID + '_main';
}
function _getStreamIDByUserID(userID: string) {
  return _currentRoomID + '_' + userID + '_main';
}
function _tryStartPublishStream() {
  if (_localCoreUser.isMicDeviceOn || _localCoreUser.isCameraDeviceOn) {
    zloginfo(
      '_tryStartPublishStream',
      _localCoreUser.isMicDeviceOn,
      _localCoreUser.isCameraDeviceOn,
      _localCoreUser.streamID
    );
    if (!_localCoreUser.streamID) {
      return;
    }
    ZegoExpressEngine.instance()
      .startPublishingStream(_localCoreUser.streamID)
      .then(() => {
        zloginfo('Notify local user audioVideoAvailable start', _localCoreUser.streamID + '', JSON.parse(JSON.stringify(_streamCoreUserMap)));
        // if (_localCoreUser.streamID in _streamCoreUserMap) {
          _streamCoreUserMap[_localCoreUser.streamID] = _localCoreUser;

          zloginfo('Notify local user audioVideoAvailable end', _localCoreUser);
          Object.keys(_onAudioVideoAvailableCallbackMap).forEach(
            (callbackID) => {
              if (_onAudioVideoAvailableCallbackMap[callbackID]) {
                _onAudioVideoAvailableCallbackMap[callbackID]([_localCoreUser]);
              }
            }
          );
        // }
      });
    zloginfo('ZegoExpressEngine startPreview:', _localCoreUser);
    if (_localCoreUser.viewID > 0) {
      ZegoExpressEngine.instance()
        .startPreview({
          reactTag: _localCoreUser.viewID,
          viewMode: _localCoreUser.fillMode,
          backgroundColor: 0,
        })
        .catch((error) => {
          zlogerror(error);
        });
    }
  }
}
function _tryStopPublishStream(force = false) {
  if (!_localCoreUser.isMicDeviceOn && !_localCoreUser.isCameraDeviceOn) {
    zloginfo('stopPublishStream');
    ZegoExpressEngine.instance().stopPublishingStream();
    ZegoExpressEngine.instance().stopPreview();
    if (_localCoreUser.streamID in _streamCoreUserMap) {
      delete _streamCoreUserMap[_localCoreUser.streamID];

      Object.keys(_onAudioVideoUnavailableCallbackMap).forEach((callbackID) => {
        if (_onAudioVideoUnavailableCallbackMap[callbackID]) {
          _onAudioVideoUnavailableCallbackMap[callbackID]([_localCoreUser]);
        }
      });
    }
  }
}
function _tryStartPlayStream(userID: string) {
  if (userID in _coreUserMap) {
    const user = _coreUserMap[userID];
    zloginfo(
      '########_tryStartPlayStream##############: ',
      user,
      user.fillMode,
      _audioVideoResourceMode,
    );
    if (user.streamID !== '') {
      if (user.viewID > 0) {
        ZegoExpressEngine.instance().startPlayingStream(user.streamID, {
          reactTag: user.viewID,
          viewMode: user.fillMode,
          backgroundColor: 0,
        }, {
          resourceMode: _audioVideoResourceMode,
        });
      } else {
        ZegoExpressEngine.instance().startPlayingStream(user.streamID, undefined, {
          resourceMode: _audioVideoResourceMode,
        });
      }
    }
  }
}
function _tryStopPlayStream(userID: string, force = false) {
  if (userID in _coreUserMap) {
    const user = _coreUserMap[userID];
    if (force || (!user.isMicDeviceOn && !user.isCameraDeviceOn)) {
      ZegoExpressEngine.instance().stopPlayingStream(user.streamID);
    }
  }
}
function _notifyUserInfoUpdate(userInfo: any) {
  Object.keys(_onUserInfoUpdateCallbackMap).forEach((callbackID) => {
    if (_onUserInfoUpdateCallbackMap[callbackID]) {
      _onUserInfoUpdateCallbackMap[callbackID](userInfo);
    }
  });
}
function _notifySoundLevelUpdate(userID: string, soundLevel: number) {
  Object.keys(_onSoundLevelUpdateCallbackMap).forEach((callbackID) => {
    if (_onSoundLevelUpdateCallbackMap[callbackID]) {
      _onSoundLevelUpdateCallbackMap[callbackID](userID, soundLevel);
    }
  });
}
function _notifyRoomPropertyUpdate(key: string, oldValue: any, value: any, type: number) {
  Object.keys(_onRoomPropertyUpdatedCallbackMap).forEach((callbackID) => {
    if (_onRoomPropertyUpdatedCallbackMap[callbackID]) {
      _onRoomPropertyUpdatedCallbackMap[callbackID](key, oldValue, value, type);
    }
  });
}
function _notifyRoomPropertiesFullUpdate(keys: string[], oldRoomProperties: any, roomProperties: any, type: number) {
  Object.keys(_onRoomPropertiesFullUpdatedCallbackMap).forEach((callbackID) => {
    if (_onRoomPropertiesFullUpdatedCallbackMap[callbackID]) {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID](keys, oldRoomProperties, roomProperties, type);
    }
  });
}
function _notifyMeRemovedFromRoom() {
  Object.keys(_onMeRemovedFromRoomCallbackMap).forEach((callbackID) => {
    if (_onMeRemovedFromRoomCallbackMap[callbackID]) {
      _onMeRemovedFromRoomCallbackMap[callbackID]();
    }
  });
}
const _isEngineCreated = () => {
  try {
    return ZegoExpressEngine.instance() != undefined;
  } catch (error) {
    return false;
  }
}

export default {
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Internal <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  isRoomConnected() {
    return _isRoomConnected;
  },
  setAudioVideoResourceMode(audioVideoResourceMode: any) {
    zloginfo('setAudioVideoResourceMode', audioVideoResourceMode);
    _audioVideoResourceMode = audioVideoResourceMode || ZegoAudioVideoResourceMode.Default;
  },
  updateRenderingProperty(userID: string, viewID: number, fillMode: string) {
    zloginfo(
      'updateRenderingProperty: ',
      userID,
      viewID,
      fillMode,
      '<<<<<<<<<<<<<<<<<<<<<<<<<<'
    );
    if (userID === undefined) {
      zlogwarning(
        'updateRenderingProperty: ignore undifine useid. Use empty string for local user.'
      );
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
  onUserInfoUpdate(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserInfoUpdateCallbackMap) {
        zloginfo(
          '[onUserInfoUpdate] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onUserInfoUpdateCallbackMap[callbackID];
      }
    } else {
      _onUserInfoUpdateCallbackMap[callbackID] = callback;
    }
  },
  onSoundLevelUpdate(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onSoundLevelUpdateCallbackMap) {
        zloginfo(
          '[onSoundLevelUpdate] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onSoundLevelUpdateCallbackMap[callbackID];
      }
    } else {
      _onSoundLevelUpdateCallbackMap[callbackID] = callback;
    }
  },
  onSDKConnected(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onSDKConnectedCallbackMap) {
        zloginfo(
          '[onSDKConnected] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onSDKConnectedCallbackMap[callbackID];
      }
    } else {
      _onSDKConnectedCallbackMap[callbackID] = callback;
    }
  },
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SDK <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  connectSDK(appID: number, appSign: string, userInfo: any) {
    // Solve the problem of repeated initialization
    if (_isEngineCreated()) {
      zloginfo('Create ZegoExpressEngine succeed already!');

      
      _unregisterEngineCallback();
      _registerEngineCallback();

      Object.keys(_onSDKConnectedCallbackMap).forEach((callbackID) => {
        // TODO cause  WARN  Possible Unhandled Promise Rejection (id: 56)
        if (_onSDKConnectedCallbackMap[callbackID]) {
          _onSDKConnectedCallbackMap[callbackID]();
        }
      });

      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      // set advancedConfig to monitor remote user's device changed
      ZegoExpressEngine.setEngineConfig({
        advancedConfig: {
          // @ts-ignore
          notify_remote_device_unknown_status: 'true',
          notify_remote_device_init_status: 'true',
        },
      });
      const engineProfile: ZegoEngineProfile = {
        appID: appID,
        appSign: appSign,
        scenario: 0,
      };
      ZegoExpressEngine.createEngineWithProfile(engineProfile)
        .then((engine) => {
          zloginfo('Create ZegoExpressEngine succeed!');
          _appInfo.appID = appID;
          _appInfo.appSign = appSign;
          _unregisterEngineCallback();
          _registerEngineCallback();

          _setLocalUserInfo(userInfo);

          Object.keys(_onSDKConnectedCallbackMap).forEach((callbackID) => {
            // TODO cause  WARN  Possible Unhandled Promise Rejection (id: 56)
            if (_onSDKConnectedCallbackMap[callbackID]) {
              _onSDKConnectedCallbackMap[callbackID]();
            }
          });
          resolve();
        })
        .catch((error) => {
          zlogerror('Create ZegoExpressEngine Failed: ', error);
          reject(error);
        });
    });
  },
  disconnectSDK() {
    return new Promise<void>((resolve, reject) => {
      if (ZegoExpressEngine.instance()) {
        ZegoExpressEngine.destroyEngine()
          .then(() => {
            zloginfo('Destroy ZegoExpressEngine finished!');
            resolve();
          })
          .catch((error) => {
            zlogerror('Destroy ZegoExpressEngine failed!', error);
            reject(error);
          })
          .finally(() => {
            _resetData();
          });
      } else {
        resolve();
      }
    });
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Audio Video <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  useFrontFacingCamera(isFrontFacing: boolean) {
    zloginfo('Use front facing camera: ', isFrontFacing);
    _usingFrontFacingCamera = isFrontFacing;
    return ZegoExpressEngine.instance().useFrontCamera(isFrontFacing, 0);
  },
  isUsingFrontFacingCamera() {
    return _usingFrontFacingCamera;
  },
  isMicDeviceOn(userID: string) {
    if (!userID) {
      return _localCoreUser.isMicDeviceOn;
    } else if (userID in _coreUserMap) {
      return _coreUserMap[userID].isMicDeviceOn;
    } else {
      zlogwarning(
        'Can not check mic device is on for user[',
        userID,
        '], because no record!'
      );
      return true;
    }
  },
  isCameraDeviceOn(userID: string) {
    if (!userID) {
      return _localCoreUser.isCameraDeviceOn;
    } else if (userID in _coreUserMap) {
      return _coreUserMap[userID].isCameraDeviceOn;
    } else {
      zlogwarning(
        'No record for user: ',
        userID,
        '. Can not check camera device is on.'
      );
      return true;
    }
  },
  enableSpeaker(enable: boolean) {
    // TODO
    return new Promise<void>((resolve, reject) => {
      if (!_isRoomConnected) {
        zlogerror('You are not connect to any room.');
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
  turnMicDeviceOn(userID: string, on: boolean) {
    return _turnMicDeviceOn(userID, on);
  },
  turnCameraDeviceOn(userID: string, on: boolean) {
    return _turnCameraDeviceOn(userID, on);
  },
  onMicDeviceOn(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onMicDeviceOnCallbackMap) {
        zloginfo(
          '[onMicDeviceOn] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onMicDeviceOnCallbackMap[callbackID];
      }
    } else {
      _onMicDeviceOnCallbackMap[callbackID] = callback;
    }
  },
  onCameraDeviceOn(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onCameraDeviceOnCallbackMap) {
        zloginfo(
          '[onCameraDeviceOn] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onCameraDeviceOnCallbackMap[callbackID];
      }
    } else {
      _onCameraDeviceOnCallbackMap[callbackID] = callback;
    }
  },
  setAudioOutputToSpeaker(isSpeaker: boolean) {
    ZegoExpressEngine.instance().setAudioRouteToSpeaker(isSpeaker);
  },
  onAudioOutputDeviceTypeChange(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioOutputDeviceTypeChangeCallbackMap) {
        zloginfo(
          '[onAudioOutputDeviceTypeChange] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onAudioOutputDeviceTypeChangeCallbackMap[callbackID];
      }
    } else {
      _onAudioOutputDeviceTypeChangeCallbackMap[callbackID] = callback;
    }
  },
  setAudioConfig(config: any) {
    // TODO
  },
  setVideoConfig(config: any) {
    // TODO
  },
  onAudioVideoAvailable(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioVideoAvailableCallbackMap) {
        zloginfo(
          '[onAudioVideoAvailable] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onAudioVideoAvailableCallbackMap[callbackID];
      }
    } else {
      _onAudioVideoAvailableCallbackMap[callbackID] = callback;
    }
  },
  onAudioVideoUnavailable(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioVideoUnavailableCallbackMap) {
        zloginfo(
          '[onAudioVideoUnavailable] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onAudioVideoUnavailableCallbackMap[callbackID];
      }
    } else {
      _onAudioVideoUnavailableCallbackMap[callbackID] = callback;
    }
  },
  startPlayingAllAudioVideo() {
    ZegoExpressEngine.instance().muteAllPlayStreamAudio(false);
    ZegoExpressEngine.instance().muteAllPlayStreamVideo(false);
  },
  stopPlayingAllAudioVideo() {
    ZegoExpressEngine.instance().muteAllPlayStreamAudio(true);
    ZegoExpressEngine.instance().muteAllPlayStreamVideo(true);
  },
  onTurnOnYourCameraRequest(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onTurnOnYourCameraRequestCallbackMap) {
        zloginfo(
          '[onTurnOnYourCameraRequest] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onTurnOnYourCameraRequestCallbackMap[callbackID];
      }
    } else {
      _onTurnOnYourCameraRequestCallbackMap[callbackID] = callback;
    }
  },
  onTurnOnYourMicrophoneRequest(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onTurnOnYourMicrophoneRequestCallbackMap) {
        zloginfo(
          '[onTurnOnYourMicrophoneRequest] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onTurnOnYourMicrophoneRequestCallbackMap[callbackID];
      }
    } else {
      _onTurnOnYourMicrophoneRequestCallbackMap[callbackID] = callback;
    }
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Room <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  joinRoom(roomID: string, token: string, markAsLargeRoom = false) {
    // Solve the problem of repeated join
    if (_isRoomConnected && _currentRoomID === roomID) {
      zloginfo('Join room success already');
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const user = {
        userID: _localCoreUser.userID,
        userName: _localCoreUser.userName,
      };
      const config = { isUserStatusNotify: true } as ZegoRoomConfig;
      token && (config.token = token);
      _currentRoomID = roomID;
      ZegoExpressEngine.instance()
        .loginRoom(roomID, user, config)
        .then(() => {
          zloginfo('Join room success.', user);
          _roomMemberCount = 1
          _markAsLargeRoom = markAsLargeRoom;
          ZegoExpressEngine.instance().startSoundLevelMonitor();

          _localCoreUser.streamID = _getPublishStreamID();
          _coreUserMap[_localCoreUser.userID] = _localCoreUser;
          _notifyUserCountOrPropertyChanged(ZegoChangedCountOrProperty.userAdd);

          _tryStartPublishStream()

          resolve();
        })
        .catch((error) => {
          zlogerror('Join room falied: ', error);
          _currentRoomID = '';
          reject(error);
        });
    });
  },
  leaveRoom() {
    return _leaveRoom();
  },
  onRoomStateChanged(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomStateChangedCallbackMap) {
        zloginfo(
          '[onRoomStateChanged] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onRoomStateChangedCallbackMap[callbackID];
      }
    } else {
      _onRoomStateChangedCallbackMap[callbackID] = callback;
    }
  },
  onRequireNewToken(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRequireNewTokenCallbackMap) {
        zloginfo(
          '[onRequireNewToken] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onRequireNewTokenCallbackMap[callbackID];
      }
    } else {
      _onRequireNewTokenCallbackMap[callbackID] = callback;
    }
  },
  setRoomProperty(key: string, value: any) {
    if (!_isRoomConnected) {
      zlogerror('You need to join the room before using this interface!');
      return;
    }
    if (_roomProperties[key] === value) {
      return;
    }
    const oldValue = _roomProperties[key];
    const oldRoomProperties = JSON.parse(JSON.stringify(_roomProperties));
    _roomProperties[key] = value;
    const extraInfo = JSON.stringify(_roomProperties);
    zloginfo('[updateRoomProperties]Set start', extraInfo);
    return new Promise<void>((resolve, reject) => {
      ZegoExpressEngine.instance().setRoomExtraInfo(_currentRoomID, 'extra_info', extraInfo).then(({ errorCode }) => {
        if (errorCode === 0) {
          zloginfo('[updateRoomProperties]Set success');
          resolve();
          // Notify
          _notifyRoomPropertyUpdate(key, oldValue, value, ZegoRoomPropertyUpdateType.set);
          _notifyRoomPropertiesFullUpdate([key], oldRoomProperties, JSON.parse(extraInfo), ZegoRoomPropertyUpdateType.set);
        } else {
          // Restore
          _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
          zlogwarning('[setRoomProperty]Set failed, errorCode: ', errorCode);
          reject({ code: errorCode });
        }
      }).catch((error) => {
        // Restore
        _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
        zlogerror('[setRoomProperty]Set error', error);
        reject(error);
      });
    });
  },
  updateRoomProperties(newRoomProperties: any) {
    if (!_isRoomConnected) {
      zlogerror('You need to join the room before using this interface!');
      return Promise.reject();
    }
    const updateKeys: string[] = [];
    const oldRoomProperties = JSON.parse(JSON.stringify(_roomProperties));
    Object.keys(newRoomProperties).forEach((key) => {
      if (oldRoomProperties[key] !== newRoomProperties[key]) {
        updateKeys.push(key);
        _roomProperties[key] = newRoomProperties[key];
      }
    })
    const extraInfo = JSON.stringify(_roomProperties);
    zloginfo('[updateRoomProperties]Update start', extraInfo);
    return new Promise<void>((resolve, reject) => {
      ZegoExpressEngine.instance().setRoomExtraInfo(_currentRoomID, 'extra_info', extraInfo).then(({ errorCode }) => {
        if (errorCode === 0) {
          zloginfo('[updateRoomProperties]Update success');
          resolve();
          // Notify
          updateKeys.forEach((updateKey) => {
            const oldValue = oldRoomProperties[updateKey];
            const value = newRoomProperties[updateKey];
            _notifyRoomPropertyUpdate(updateKey, oldValue, value, ZegoRoomPropertyUpdateType.update);
          })
          updateKeys.length && _notifyRoomPropertiesFullUpdate(updateKeys, oldRoomProperties, JSON.parse(extraInfo), ZegoRoomPropertyUpdateType.update);
        } else {
          // Restore
          _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
          zlogwarning('[updateRoomProperties]Update failed, errorCode: ', errorCode);
          reject({ code: errorCode });
        }
      }).catch((error) => {
        // Restore
        _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
        zlogerror('[updateRoomProperties]Update error', error);
        reject(error);
      });
    });
  },
  getRoomProperties() {
    return _roomProperties;
  },
  onRoomPropertyUpdated(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomPropertyUpdatedCallbackMap) {
        zloginfo(
          '[onRoomPropertyUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onRoomPropertyUpdatedCallbackMap[callbackID];
      }
    } else {
      _onRoomPropertyUpdatedCallbackMap[callbackID] = callback;
    }
  },
  onRoomPropertiesFullUpdated(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomPropertiesFullUpdatedCallbackMap) {
        zloginfo(
          '[onRoomPropertiesFullUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onRoomPropertiesFullUpdatedCallbackMap[callbackID];
      }
    } else {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID] = callback;
    }
  },
  sendInRoomCommand(command: string, toUserIDs: string[] = []) {
    const toUserList = toUserIDs.map((userID) => {
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? (userInfo.userName || '') : '';
      return {
        userID,
        userName,
      };
    });
    return _sendInRoomCommand(command, toUserList);
  },
  onInRoomCommandReceived(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onInRoomCommandReceivedCallbackMap) {
        zloginfo(
          '[onInRoomCommandReceived] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onInRoomCommandReceivedCallbackMap[callbackID];
      }
    } else {
      _onInRoomCommandReceivedCallbackMap[callbackID] = callback;
    }
  },
  onMeRemovedFromRoom(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onMeRemovedFromRoomCallbackMap) {
        zloginfo(
          '[onMeRemovedFromRoom] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onMeRemovedFromRoomCallbackMap[callbackID];
      }
    } else {
      _onMeRemovedFromRoomCallbackMap[callbackID] = callback;
    }
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  connectUser(userID: string, userName: string) {
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
  getUser(userID: string) {
    return _coreUserMap[userID];
  },
  getAllUsers() {
    const users = Object.values(_coreUserMap);
    users.sort((a: any, b: any) => {
      return a.joinTime - b.joinTime;
    });
    var publicUsers: any[] = [];
    users.forEach((user) => {
      publicUsers.push(_createPublicUser(user));
    });
    return publicUsers;
  },
  onUserJoin(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserJoinCallbackMap) {
        zloginfo(
          '[onUserJoin] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onUserJoinCallbackMap[callbackID];
      }
    } else {
      _onUserJoinCallbackMap[callbackID] = callback;
    }
  },
  onUserLeave(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserLeaveCallbackMap) {
        zloginfo(
          '[onUserLeave] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onUserLeaveCallbackMap[callbackID];
      }
    } else {
      _onUserLeaveCallbackMap[callbackID] = callback;
    }
  },
  onOnlySelfInRoom(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onOnlySelfInRoomCallbackMap) {
        zloginfo(
          '[onOnlySelfInRoom] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onOnlySelfInRoomCallbackMap[callbackID];
      }
    } else {
      _onOnlySelfInRoomCallbackMap[callbackID] = callback;
    }
  },
  onUserCountOrPropertyChanged(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserCountOrPropertyChangedCallbackMap) {
        zloginfo(
          '[onUserCountOrPropertyChanged] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onUserCountOrPropertyChangedCallbackMap[callbackID];
      }
    } else {
      _onUserCountOrPropertyChangedCallbackMap[callbackID] = callback;
    }
  },
  removeUserFromRoom(userIDs: string[] = []) {
    const command = JSON.stringify({ zego_remove_user: userIDs });
    const toUserList = (_isLargeRoom || _markAsLargeRoom) ? [] : userIDs.map((userID) => {
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? (userInfo.userName || '') : '';
      return {
        userID,
        userName,
      };
    });
    return _sendInRoomCommand(command, toUserList);
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Message <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  getInRoomMessages() {
    return _inRoomMessageList;
  },
  sendInRoomMessage(message: string) {
    return new Promise((resolve, reject) => {
      ZegoExpressEngine.instance()
        .sendBroadcastMessage(_currentRoomID, message)
        .then((result) => {
          zloginfo('SendInRoomMessage finished.', result);
          const { errorCode, messageID } = result;
          if (errorCode > 0) {
            reject(errorCode);
          } else {
            const inRoomMessage = {
              message: message,
              messageID: messageID,
              sendTime: Date.now(),
              sender: _createPublicUser(_localCoreUser),
            };
            _inRoomMessageList.push(inRoomMessage);

            Object.keys(_onInRoomMessageSentCallbackMap).forEach(
              (callbackID) => {
                // callback may remove from map during room state chaging
                if (callbackID in _onInRoomMessageSentCallbackMap) {
                  if (_onInRoomMessageSentCallbackMap[callbackID]) {
                    _onInRoomMessageSentCallbackMap[callbackID](
                      errorCode,
                      messageID
                    );
                  }
                }
              }
            );

            resolve(result);
          }
        })
        .catch((error) => {
          zlogerror('SendInRoomMessage falied: ', error);
          reject(error);
        });
    });
  },
  onInRoomMessageReceived(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onInRoomMessageReceivedCallbackMap) {
        zloginfo(
          '[onInRoomMessageReceived] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onInRoomMessageReceivedCallbackMap[callbackID];
      }
    } else {
      _onInRoomMessageReceivedCallbackMap[callbackID] = callback;
    }
  },
  onInRoomMessageSent(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onInRoomMessageSentCallbackMap) {
        zloginfo(
          '[onInRoomMessageSent] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onInRoomMessageSentCallbackMap[callbackID];
      }
    } else {
      _onInRoomMessageSentCallbackMap[callbackID] = callback;
    }
  },
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Live audio room <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  notifyUserCountOrPropertyChanged(type: number) {
    _notifyUserCountOrPropertyChanged(type);
  },
  notifyUserInfoUpdate(userID: string) {
    // Update avatar properties
    if ( _coreUserMap[userID] && _coreUserMap[userID].inRoomAttributes) {
      _coreUserMap[userID].avatar = _coreUserMap[userID].inRoomAttributes.avatar;
    }
    _notifyUserInfoUpdate(_coreUserMap[userID]);
  },
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Force update component <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  forceSortMemberList() {
    zloginfo('[forceSortMemberList callback]');
    const userList = Object.values(_coreUserMap)
      .sort((user1: any, user2: any) => {
        return user2.joinTime - user1.joinTime;
      })
      .map((user) => _createPublicUser(user));
    Object.keys(_onMemberListForceSortCallbackMap).forEach((callbackID) => {
      if (_onMemberListForceSortCallbackMap[callbackID]) {
        _onMemberListForceSortCallbackMap[callbackID](userList);
      }
    });
  },
  onMemberListForceSort(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onMemberListForceSortCallbackMap) {
        zloginfo(
          '[onMemberListForceSort] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onMemberListForceSortCallbackMap[callbackID];
      }
    } else {
      _onMemberListForceSortCallbackMap[callbackID] = callback;
    }
  },
  forceSortAudioVideoList() {
    zloginfo('[forceSortAudioVideoList callback]');
    Object.keys(_onAudioVideoListForceSortCallbackMap).forEach((callbackID) => {
      if (_onAudioVideoListForceSortCallbackMap[callbackID]) {
        _onAudioVideoListForceSortCallbackMap[callbackID]();
      }
    });
  },
  onAudioVideoListForceSort(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioVideoListForceSortCallbackMap) {
        zloginfo(
          '[onAudioVideoListForceSort] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onAudioVideoListForceSortCallbackMap[callbackID];
      }
    } else {
      _onAudioVideoListForceSortCallbackMap[callbackID] = callback;
    }
  },
  forceRenderVideoView() {
    zloginfo('[forceRenderVideoView callback]');
    Object.keys(_onVideoViewForceRenderCallbackMap).forEach((callbackID) => {
      if (_onVideoViewForceRenderCallbackMap[callbackID]) {
        _onVideoViewForceRenderCallbackMap[callbackID]();
      }
    });
  },
  onVideoViewForceRender(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onVideoViewForceRenderCallbackMap) {
        zloginfo(
          '[onVideoViewForceRender] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onVideoViewForceRenderCallbackMap[callbackID];
      }
    } else {
      _onVideoViewForceRenderCallbackMap[callbackID] = callback;
    }
  },
  
};
