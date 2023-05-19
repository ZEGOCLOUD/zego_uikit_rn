import type {
  ZIMRoomInfo,
  ZIMRoomMemberAttributesInfo,
  ZIMRoomMemberAttributesQueryConfig,
  ZIMEventOfRoomMembersAttributesUpdatedResult,
  ZIMRoomEnteredResult,
  ZIMError,
  ZIMRoomMembersAttributesOperatedResult,
  ZIMRoomMemberAttributesListQueriedResult,
} from 'zego-zim-react-native';
import { zlogerror, zloginfo } from '../utils/logger';
import ZegoPluginResult from './defines';
import ZegoUIKitCorePlugin from "../../components/internal/ZegoUIKitCorePlugin";

export default class ZegoPluginUserInRoomAttributesCore {
  static shared: ZegoPluginUserInRoomAttributesCore;
  _isJoinRoom = false;
  _roomBaseInfo = {} as ZIMRoomInfo; // { roomID: '', roomName: '' }
  _onUsersInRoomAttributesUpdatedCallbackMap: { [index: string]: (notifyData: {
    infos: ZIMRoomMemberAttributesInfo[];
    editor: string;
  }) => void } = {};
  constructor() {
    if (!ZegoPluginUserInRoomAttributesCore.shared) {
      ZegoPluginUserInRoomAttributesCore.shared = this;
    }
    return ZegoPluginUserInRoomAttributesCore.shared;
  }
  static getInstance() {
    if (!ZegoPluginUserInRoomAttributesCore.shared) {
      ZegoPluginUserInRoomAttributesCore.shared =
        new ZegoPluginUserInRoomAttributesCore();
    }
    return ZegoPluginUserInRoomAttributesCore.shared;
  }
  // ------- internal events register ------
  _registerEngineCallback() {
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'roomMemberAttributesUpdated',
      (zim: any, { roomID, infos, operatedInfo }: ZIMEventOfRoomMembersAttributesUpdatedResult) => {
        zloginfo(
          `[ZegoPluginUserInRoomAttributesCore]NotifyUsersInRoomAttributesUpdated`,
          infos,
          operatedInfo
        );
        this._notifyUsersInRoomAttributesUpdated({
          infos: infos.map((info) => info.attributesInfo),
          editor: operatedInfo.userID,
        });
      }
    );
    zloginfo(
      '[ZegoPluginUserInRoomAttributesCore]Register callback for ZIM...'
    );
  }
  _unregisterEngineCallback() {
    zloginfo(
      '[ZegoPluginUserInRoomAttributesCore]Unregister callback from ZIM...'
    );
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('roomMemberAttributesUpdated');
  }
  // ------- internal utils ------
  _resetData() {
    this._resetDataForLeaveRoom();
  }
  _resetDataForLeaveRoom() {
    this._roomBaseInfo = {} as ZIMRoomInfo;
    this._isJoinRoom = false;
  }
  // ------- internal events exec ------
  _notifyUsersInRoomAttributesUpdated(notifyData: {
    infos: ZIMRoomMemberAttributesInfo[];
    editor: string;
  }) {
    Object.keys(this._onUsersInRoomAttributesUpdatedCallbackMap).forEach(
      (callbackID) => {
        if (this._onUsersInRoomAttributesUpdatedCallbackMap[callbackID]) {
          this._onUsersInRoomAttributesUpdatedCallbackMap[callbackID](
            notifyData
          );
        }
      }
    );
  }
  // ------- external method ------
  joinRoom(roomID: string) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror(
        '[ZegoPluginUserInRoomAttributesCore]Please initialize it first.'
      );
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      if (!this._isJoinRoom) {
        ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
          .enterRoom({ roomID, roomName: roomID })
          .then(({ roomInfo }: ZIMRoomEnteredResult) => {
            zloginfo(
              `[ZegoPluginUserInRoomAttributesCore]Join the room successfully.`
            );
            this._roomBaseInfo = roomInfo.baseInfo;
            this._isJoinRoom = true;
            resolve(new ZegoPluginResult('', ''));
          })
          .catch((error: ZIMError) => {
            zlogerror(
              `[ZegoPluginUserInRoomAttributesCore]Failed to join the room, code: ${error.code}, message: ${error.message}`
            );
            reject(error);
          });
      } else {
        zloginfo('[ZegoPluginUserInRoomAttributesCore]Join room already success.');
        resolve(new ZegoPluginResult('', ''));
      }
    });
  }
  leaveRoom() {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror(
        '[ZegoPluginUserInRoomAttributesCore]Please initialize it first.'
      );
      return Promise.reject();
    }
    if (!this._roomBaseInfo.roomID) {
      zlogerror(
        '[ZegoPluginUserInRoomAttributesCore]Please join the room first.'
      );
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .leaveRoom(this._roomBaseInfo.roomID)
        .then(() => {
          zloginfo(
            `[ZegoPluginUserInRoomAttributesCore]Leave the room successfully.`
          );
          this._resetDataForLeaveRoom();
          resolve(new ZegoPluginResult('', ''));
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginUserInRoomAttributesCore]Failed to leave the room, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  getRoomBaseInfo() {
    return this._roomBaseInfo;
  }
  setUsersInRoomAttributes(attributes: Record<string, string>, userIDs: string[]) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror(
        '[ZegoPluginUserInRoomAttributesCore]Please initialize it first.'
      );
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .setRoomMembersAttributes(
          attributes,
          userIDs,
          this._roomBaseInfo.roomID,
          { isDeleteAfterOwnerLeft: true }
        )
        .then(({ roomID, infos, errorUserList }: ZIMRoomMembersAttributesOperatedResult) => {
          zloginfo(
            `[ZegoPluginUserInRoomAttributesCore]Set attributes of users in room successfully.`
          );
          resolve({
            ...new ZegoPluginResult('', ''),
            errorUserList,
            infos,
          });
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginUserInRoomAttributesCore]Failed to set the user's attributes, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  queryUsersInRoomAttributes(config: ZIMRoomMemberAttributesQueryConfig) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror(
        '[ZegoPluginUserInRoomAttributesCore]Please initialize it first.'
      );
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .queryRoomMemberAttributesList(this._roomBaseInfo.roomID, config)
        .then(({ roomID, infos, nextFlag: resNextFlag }: ZIMRoomMemberAttributesListQueriedResult) => {
          zloginfo(
            `[ZegoPluginUserInRoomAttributesCore]Query attributes of users in room successfully.`
          );
          const params = {
            ...new ZegoPluginResult('', ''),
            nextFlag: resNextFlag,
            infos,
          };
          resolve(params);
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginUserInRoomAttributesCore]Failed to query the user's attributes, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  // ------- external events register ------
  onUsersInRoomAttributesUpdated(callbackID: string, callback: (notifyData: {
    infos: ZIMRoomMemberAttributesInfo[];
    editor: string;
  }) => void) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror(
        '[ZegoPluginUserInRoomAttributesCore]Please initialize it first.'
      );
    }
    if (typeof callback !== 'function') {
      if (callbackID in this._onUsersInRoomAttributesUpdatedCallbackMap) {
        zloginfo(
          '[Core][onUsersInRoomAttributesUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onUsersInRoomAttributesUpdatedCallbackMap[callbackID];
      }
    } else {
      this._onUsersInRoomAttributesUpdatedCallbackMap[callbackID] = callback;
    }
  }
}
