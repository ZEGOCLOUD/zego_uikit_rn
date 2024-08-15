import ZegoUIKitInternal from '../../../components/internal/ZegoUIKitInternal';
import { ZegoChangedCountOrProperty, ZegoUIKitPluginType } from '../../../components/internal/defines';
import ZegoUIKitCorePlugin from '../../../components/internal/ZegoUIKitCorePlugin';
import { zlogerror, zloginfo } from '../../../utils/logger';
import { ZegoInvitationImplResult } from './defines';
import InnerZegoUIKitSignalingPlugin from "../../../signal_plugin";

var ZegoUIKitSignalingPlugin: any;
const _localUser: any = {};
const _queryCount = 20;
const _onRoomPropertiesFullUpdatedCallbackMap: any = {};
const _usersInRoomAttributes = new Map(); // <userID, attributes> attributes={ string, string }
let _roomAttributes: any = {};
var _appSign: string = '';

// ------- live audio room ------
const _queryUsersInRoomAttributesIteration = (
  nextFlag = '',
  count = _queryCount
) => {
  return ZegoUIKitSignalingPlugin.getInstance().invoke(
    'queryUsersInRoomAttributes',
    {
      nextFlag,
      count,
    }
  );
};
const _queryUsersInRoomAttributesFully = (nextFlag: string, count: number) => {
  const fullAttributes: any[] = [];
  return new Promise((resolve, reject) => {
    _queryUsersInRoomAttributesIteration(nextFlag, count)
      .then(({ nextFlag: resNextFlag, infos }: any) => {
        fullAttributes.push(...infos);
        if (resNextFlag) {
          _queryUsersInRoomAttributesIteration(resNextFlag);
        } else {
          resolve(fullAttributes);
        }
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};
const _updateCoreUserAndNofityChanges = (infos: any[]) => {
  let shouldNotifyChange = false;
  infos.forEach((info: any) => {
    const coreUser = ZegoUIKitInternal.getUser(info.userID);
    if (coreUser) {
      if (
        JSON.stringify(coreUser.inRoomAttributes) !==
        JSON.stringify(info.attributes)
      ) {
        shouldNotifyChange = true;
        // merge
        Object.assign(coreUser.inRoomAttributes, info.attributes);
        ZegoUIKitInternal.notifyUserInfoUpdate(info.userID);
      }
    }
  });
  if (shouldNotifyChange) {
    zloginfo(
      '[Plugins][invitation]Notify changed property of users successfully.'
    );
    ZegoUIKitInternal.notifyUserCountOrPropertyChanged(
      ZegoChangedCountOrProperty.attributesUpdate
    );
  }
};
const _notifyRoomPropertiesFullUpdated = (...notifyData: any[]) => {
  Object.keys(_onRoomPropertiesFullUpdatedCallbackMap).forEach((callbackID) => {
    if ((_onRoomPropertiesFullUpdatedCallbackMap as any)[callbackID]) {
      ((_onRoomPropertiesFullUpdatedCallbackMap as any)[callbackID])(...notifyData);
    }
  });
};

const ZegoUIKitSignalingPluginImpl = {
  getZegoUIKitSignalingPlugin: () => {
    return InnerZegoUIKitSignalingPlugin;
  },
  getVersion: () => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getVersion();
  },
  init: (appID: number, appSign: string) => {
    if (ZegoUIKitCorePlugin.getPlugin(ZegoUIKitPluginType.signaling)) {
      ZegoUIKitSignalingPlugin = InnerZegoUIKitSignalingPlugin;
    }
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    _appSign = appSign;
    ZegoUIKitSignalingPlugin.getInstance().invoke('init', { appID, appSign });
  },
  uninit: () => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().invoke('uninit');
  },
  login: async (userID: string, userName: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    _localUser.userID = userID;
    _localUser.userName = userName;
    var token = '';
    if (_appSign === '') {
      token = await ZegoUIKitInternal.getToken();
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
        'onRequireNewToken',
        'callbackID',
        () => {
          return ZegoUIKitInternal.getToken();
        }
      );
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('login', {
      userID,
      userName,
      token,
    });
  },
  logout: () => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('logout');
  },
  enableNotifyWhenAppRunningInBackgroundOrQuit: (certificateIndex?: number, isIOSDevelopmentEnvironment?: boolean, appName?: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      ZegoUIKitSignalingPlugin = InnerZegoUIKitSignalingPlugin;
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('enableNotifyWhenAppRunningInBackgroundOrQuit', {
      certificateIndex,
      isIOSDevelopmentEnvironment,
      appName,
    });
  },
  setAdvancedConfig: (key: string, value: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      ZegoUIKitSignalingPlugin = InnerZegoUIKitSignalingPlugin;
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('setAdvancedConfig', {
      key,
      value,
    });
  },
  sendInvitation: (invitees: any[], timeout: number, type: number, data?: string, notificationConfig?: any) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('sendInvitation', {
      inviterName: _localUser.userName,
      invitees,
      timeout,
      type,
      data,
      notificationConfig
    });
  },
  cancelInvitation: (invitees: any[], data?: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('cancelInvitation', {
      invitees,
      data,
    });
  },
  reportZPNsCallKitCallEnded: (uuid: string, reason: number) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('reportCallKitCallEnded', {
      uuid, reason
    });
  },
  refuseInvitation: (inviterID: string, data?: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('refuseInvitation', {
      inviterID,
      data,
    });
  },
  acceptInvitation: (inviterID: string, data?: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('acceptInvitation', {
      inviterID,
      data,
    });
  },
  queryCallList: (count: number, nextFlag?: number) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().queryCallList(count, nextFlag);
  },
  sendInRoomTextMessage(roomID: string, message: string) {
    return ZegoUIKitSignalingPlugin.getInstance().sendInRoomTextMessage(roomID, message);
  },
  sendInRoomCommandMessage(roomID: string, message: string) {
    return ZegoUIKitSignalingPlugin.getInstance().sendInRoomCommandMessage(roomID, message);
  },

  renewToken(token: string) {
    return ZegoUIKitSignalingPlugin.getInstance().renewToken(token);
  },

  onConnectionStateChanged: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'connectionStateChanged',
      callbackID,
      callback
    );
  },
  onInvitationReceived: (callbackID: string, callback?: Function, from?: string) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    zloginfo(`[ZegoUIKitSignalingPluginImpl] onInvitationReceived, callbackID: ${callbackID}, from: ${from}`);
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationReceived',
      callbackID,
      callback
    );
  },
  onInvitationTimeout: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationTimeout',
      callbackID,
      callback
    );
  },
  onInvitationResponseTimeout: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationResponseTimeout',
      callbackID,
      callback
    );
  },
  onInvitationAccepted: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationAccepted',
      callbackID,
      callback
    );
  },
  onInvitationRefused: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationRefused',
      callbackID,
      callback
    );
  },
  onInvitationCanceled: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationCanceled',
      callbackID,
      callback
    );
  },
  // ------- live audio room - user------
  joinRoom(roomID: string) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance()
        .invoke('joinRoom', {
          roomID,
        })
        .then(async () => {
          try {
            zloginfo('[Plugins][invitation]Join room successfully.', roomID);
            // query the attributes of the users in room
            // const fullAttributes = await _queryUsersInRoomAttributesFully();
            // _usersInRoomAttributes.clear();
            // fullAttributes.forEach((element) => {
            //   _usersInRoomAttributes.set(element.userID, element.attributes);
            // });
            // zloginfo(
            //   `[Plugins][invitation]Auto query the attributes of the users in room successfully.`,
            //   _usersInRoomAttributes
            // );
            // query the room attributes
            // await this.queryRoomProperties();
            // zloginfo(
            //   `[Plugins][invitation]Auto query the room attributes successfully.`,
            //   _roomAttributes
            // );
            resolve(new ZegoInvitationImplResult('', ''));
          } catch (error) {
            zlogerror(
              `[Plugins][invitation]Failed to auto query the attributes of the users in room of room attributes.`,
              error
            );
          }
        })
        .catch((error: any) => {
          zloginfo('[Plugins][invitation]Failed to join room.', roomID);
          reject(error);
        });
    });
  },
  // getUsersInRoomAttributes: () => {
  //   if (!ZegoUIKitSignalingPlugin) {
  //     zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
  //     return;
  //   }
  //   return _usersInRoomAttributes;
  // },
  setUsersInRoomAttributes: (key: string, value: any, userIDs: string[]) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    // The call to the local end also triggers the corresponding callback on the local end
    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance()
        .invoke('setUsersInRoomAttributes', {
          key,
          value,
          userIDs,
        })
        .then(({ errorUserList }: any) => {
          // for the time being, consider setting only one property for one user at a time
          if (errorUserList.length) {
            zlogerror(
              '[Plugins][invitation]Failed to set attributes of users in room.',
              errorUserList
            );
            reject(new ZegoInvitationImplResult('1', ''));
          } else {
            const attributes = _usersInRoomAttributes.get(userIDs[0]);
            if (attributes) {
              if (!value) {
                delete attributes[key];
              } else {
                attributes[key] = value;
              }
            } else if (value) {
              _usersInRoomAttributes.set(userIDs[0], { [key]: value });
            }
            zloginfo(
              '[Plugins][invitation]Set attributes of users in room successfully.'
            );
            resolve(new ZegoInvitationImplResult('', ''));
          }
        })
        .catch((error: any) => {
          zlogerror(
            '[Plugins][invitation]Failed to set attributes of users in room.',
            error
          );
          reject(error);
        });
    });
  },
  queryUsersInRoomAttributes: (nextFlag: string, count = _queryCount) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    return new Promise((resolve, reject) => {
      _queryUsersInRoomAttributesFully(nextFlag, count)
        .then((fullAttributes: any[]) => {
          _usersInRoomAttributes.clear();
          fullAttributes.forEach((element: any) => {
            _usersInRoomAttributes.set(element.userID, element.attributes);
          });
          zloginfo(
            '[Plugins][invitation]Query attributes of users in room successfully.',
            _usersInRoomAttributes
          );
          resolve({
            ...new ZegoInvitationImplResult('', ''),
            usersInRoomAttributes: _usersInRoomAttributes,
          });
          // update the user information of the core layer
          _updateCoreUserAndNofityChanges(fullAttributes);
        })
        .catch((error) => {
          zlogerror(
            '[Plugins][invitation]Failed to query attributes of users in room.',
            error
          );
          reject(error);
        });
    });
  },
  onUsersInRoomAttributesUpdated: (callbackID: string, callback?: Function) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    if (typeof callback !== 'function') {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
        'usersInRoomAttributesUpdated',
        callbackID,
        callback
      );
    } else {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
        'usersInRoomAttributesUpdated',
        callbackID,
        ({ infos, editor }: any) => {
          // incremental information
          const oldAttributes = new Map();
          Array.from(_usersInRoomAttributes.keys()).forEach((key) => {
            oldAttributes.set(
              key,
              JSON.parse(JSON.stringify(_usersInRoomAttributes.get(key)))
            );
          });
          const updateKeys: string[] = [];
          (infos as any[]).forEach((info) => {
            Object.keys(info.attributes).forEach((key) => {
              if (!updateKeys.includes(key)) {
                updateKeys.push(key);
              }
            });
            // merge
            let temp = _usersInRoomAttributes.get(info.userID);
            !temp && (temp = {});
            _usersInRoomAttributes.set(info.userID, temp);
            Object.assign(temp, info.attributes);
          });
          zloginfo(
            '[Plugins][invitation]Notify updated attributes of users in room successfully.',
            updateKeys,
            oldAttributes,
            _usersInRoomAttributes,
            editor
          );
          callback(updateKeys, oldAttributes, _usersInRoomAttributes, editor);

          // update the user information of the core layer
          _updateCoreUserAndNofityChanges(infos);
        }
      );
    }
  },
  // ------- live audio room - room------
  // getRoomProperties() {
  //   if (!ZegoUIKitSignalingPlugin) {
  //     zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
  //     return;
  //   }
  //   return _roomAttributes;
  // },
  updateRoomProperty(
    key: string,
    value: any,
    isDeleteAfterOwnerLeft: boolean,
    isForce: boolean,
    isUpdateOwner: boolean
  ) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance()
        .invoke('updateRoomProperty', {
          key,
          value,
          isDeleteAfterOwnerLeft,
          isForce,
          isUpdateOwner,
        })
        .then(({ errorKeys }: any) => {
          if (!errorKeys.includes(key)) {
            _roomAttributes[key] = value;
          }
          zloginfo(
            '[Plugins][invitation]Update room attributes successfully.',
            errorKeys
          );
          resolve({ ...new ZegoInvitationImplResult('', ''), errorKeys });
        })
        .catch((error: any) => {
          zlogerror(
            '[Plugins][invitation]Failed to update room attributes.',
            error
          );
          reject(error);
        });
    });
  },
  deleteRoomProperties(keys: string[], isForce: boolean) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance()
        .invoke('deleteRoomProperties', {
          keys,
          isForce,
        })
        .then(({ errorKeys }: any) => {
          keys.forEach((key) => {
            if (!errorKeys.includes(key)) {
              delete _roomAttributes[key];
            }
          });
          zloginfo(
            '[Plugins][invitation]Delete room attributes successfully.',
            errorKeys
          );
          resolve({ ...new ZegoInvitationImplResult('', ''), errorKeys });
        })
        .catch((error: any) => {
          zlogerror(
            '[Plugins][invitation]Failed to delete room attributes.',
            error
          );
          reject(error);
        });
    });
  },
  beginRoomPropertiesBatchOperation(
    isDeleteAfterOwnerLeft: boolean,
    isForce: boolean,
    isUpdateOwner: boolean
  ) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().invoke(
      'beginRoomPropertiesBatchOperation',
      {
        isDeleteAfterOwnerLeft,
        isForce,
        isUpdateOwner,
      }
    );
    zloginfo(
      '[Plugins][invitation]Begin room properties batch operation successfully.'
    );
  },
  endRoomPropertiesBatchOperation() {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance()
        .invoke('endRoomPropertiesBatchOperation')
        .then(async () => {
          try {
            zloginfo(
              '[Plugins][invitation]End room properties batch operation successfully.'
            );
            // query the room attributes
            // await this.queryRoomProperties();
            // zloginfo(
            //   `[Plugins][invitation]Auto query the room attributes successfully.`,
            //   _roomAttributes
            // );
            resolve(new ZegoInvitationImplResult('', ''));
          } catch (error) {
            zlogerror(
              `[Plugins][invitation]Failed to auto query room attributes.`,
              error
            );
          }
        })
        .catch((error: any) => {
          zlogerror(
            '[Plugins][invitation]Failed to end room attributes batch operation.',
            error
          );
          reject(error);
        });
    });
  },
  queryRoomProperties() {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance()
        .invoke('queryRoomProperties')
        .then(({ roomID, roomAttributes }: any) => {
          zloginfo(
            '[Plugins][invitation]Query room attributes successfully.',
            roomAttributes
          );
          _roomAttributes = roomAttributes;
          resolve({ ...new ZegoInvitationImplResult('', ''), _roomAttributes });
        })
        .catch((error: any) => {
          zlogerror(
            '[Plugins][invitation]Failed to query room attributes.',
            error
          );
          reject(error);
        });
    });
  },
  onRoomPropertyUpdated(callbackID: string, callback?: Function) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    if (typeof callback !== 'function') {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
        'roomPropertyUpdated',
        callbackID,
        callback
      );
    } else {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
        'roomPropertyUpdated',
        callbackID,
        (info: any) => {
          const oldRoomAttributes = JSON.parse(JSON.stringify(_roomAttributes));
          const { action, roomAttributes } = info;
          const updateKeys = Object.keys(roomAttributes);
          Object.keys(roomAttributes).forEach((key) => {
            const oldValue = _roomAttributes[key];
            // action: Set = 0, Delete = 1
            if (action === 0) {
              const value = roomAttributes[key];
              _roomAttributes[key] = value;
              callback(key, oldValue, value);
            } else {
              delete _roomAttributes[key];
              callback(key, oldValue, '');
            }
          });
          _notifyRoomPropertiesFullUpdated([
            updateKeys,
            oldRoomAttributes,
            _roomAttributes,
          ]);
        }
      );
    }
  },
  onRoomPropertiesFullUpdated(callbackID: string, callback?: Function) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomPropertiesFullUpdatedCallbackMap) {
        zloginfo(
          '[Plugins][invitation][onRoomPropertiesFullUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete _onRoomPropertiesFullUpdatedCallbackMap[callbackID];
      }
    } else {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID] = callback;
    }
  },
  onInRoomTextMessageReceived(callbackID: string, callback?: Function) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'inRoomTextMessageReceived',
      callbackID,
      callback
    );
  },
  onInRoomCommandMessageReceived(callbackID: string, callback?: Function) {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'onInRoomCommandMessageReceived',
      callbackID,
      callback
    );
  },
};

export default ZegoUIKitSignalingPluginImpl;
