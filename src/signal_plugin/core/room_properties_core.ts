import type {
  ZIMRoomAttributesBatchOperationConfig,
  ZIMRoomAttributesDeleteConfig,
  ZIMRoomAttributesSetConfig,
  ZIMRoomAttributesUpdateInfo,
  ZIMEventOfRoomAttributesUpdatedResult,
  ZIMRoomAttributesOperatedResult,
  ZIMRoomAttributesBatchOperatedResult,
  ZIMRoomAttributesQueriedResult,
  ZIMError,
} from 'zego-zim-react-native';
import { zlogerror, zloginfo } from '../utils/logger';
import ZegoPluginResult from './defines';
import ZegoPluginUserInRoomAttributesCore from './user_in_room_attributes_core';
import ZegoUIKitCorePlugin from "../../components/internal/ZegoUIKitCorePlugin";

export default class ZegoPluginRoomPropertiesCore {
  static shared: ZegoPluginRoomPropertiesCore;
  _onRoomPropertyUpdatedCallbackMap: { [index: string]: (notifyData: ZIMRoomAttributesUpdateInfo) => void } = {};

  constructor() {
    if (!ZegoPluginRoomPropertiesCore.shared) {
      ZegoPluginRoomPropertiesCore.shared = this;
    }
    return ZegoPluginRoomPropertiesCore.shared;
  }
  static getInstance() {
    if (!ZegoPluginRoomPropertiesCore.shared) {
      ZegoPluginRoomPropertiesCore.shared = new ZegoPluginRoomPropertiesCore();
    }
    return ZegoPluginRoomPropertiesCore.shared;
  }
  // ------- internal events register ------
  _registerEngineCallback() {
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on('roomAttributesUpdated', (zim: any, { roomID, infos }: ZIMEventOfRoomAttributesUpdatedResult) => {
      zloginfo(
        `[ZegoPluginRoomPropertiesCore]NotifyRoomPropertiesUpdated`,
        infos
      );
      infos.forEach((info) => {
        this._notifyRoomPropertiesUpdated(info);
      });
    });
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'roomAttributesBatchUpdated',
      (zim: any, { roomID, infos }: ZIMEventOfRoomAttributesUpdatedResult) => {
        zloginfo(
          `[ZegoPluginRoomPropertiesCore]NotifyRoomPropertiesUpdated`,
          infos
        );
        infos.forEach((info) => {
          this._notifyRoomPropertiesUpdated(info);
        });
      }
    );

    zloginfo('[ZegoPluginRoomPropertiesCore]Register callback for ZIM...');
  }
  _unregisterEngineCallback() {
    zloginfo('[ZegoPluginRoomPropertiesCore]Unregister callback from ZIM...');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('roomAttributesUpdated');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('roomAttributesBatchUpdated');
  }
  // ------- internal events exec ------
  _notifyRoomPropertiesUpdated(notifyData: ZIMRoomAttributesUpdateInfo) {
    Object.keys(this._onRoomPropertyUpdatedCallbackMap).forEach(
      (callbackID) => {
        if (this._onRoomPropertyUpdatedCallbackMap[callbackID]) {
          this._onRoomPropertyUpdatedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }

  // ------- external method ------
  updateRoomProperty(attributes: Record<string, string>, config: ZIMRoomAttributesSetConfig) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .setRoomAttributes(attributes, roomID, config)
        .then(({ roomID: resRoomID, errorKeys }: ZIMRoomAttributesOperatedResult) => {
          zloginfo(
            `[ZegoPluginRoomPropertiesCore]Update the room properties successfully.`
          );
          resolve({ ...new ZegoPluginResult('', ''), errorKeys });
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to update room properties, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  deleteRoomProperties(keys: string[], config: ZIMRoomAttributesDeleteConfig) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .deleteRoomAttributes(keys, roomID, config)
        .then(({ roomID: resRoomID, errorKeys }: ZIMRoomAttributesOperatedResult) => {
          zloginfo(
            `[ZegoPluginRoomPropertiesCore]Delete the room properties successfully.`
          );
          resolve({ ...new ZegoPluginResult('', ''), errorKeys });
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to delete room properties, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  beginRoomPropertiesBatchOperation(config: ZIMRoomAttributesBatchOperationConfig) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().beginRoomAttributesBatchOperation(roomID, config);
    zloginfo(
      `[ZegoPluginRoomPropertiesCore]Begin batch operate room properties successfully.`
    );
  }
  endRoomPropertiesBatchOperation() {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .endRoomAttributesBatchOperation(roomID)
        .then(({ roomID: resRoomID }: ZIMRoomAttributesBatchOperatedResult) => {
          zloginfo(
            `[ZegoPluginRoomPropertiesCore]End batch operate room properties successfully.`
          );
          resolve(new ZegoPluginResult('', ''));
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to end batch operate room properties, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  queryRoomProperties() {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .queryRoomAllAttributes(roomID)
        .then(({ roomID: resRoomID, roomAttributes }: ZIMRoomAttributesQueriedResult) => {
          zloginfo(
            `[ZegoPluginRoomPropertiesCore]Query room all attributes successfully.`
          );
          resolve({ roomAttributes, ...new ZegoPluginResult('', '') });
        })
        .catch((error: ZIMError) => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to query room all properties, code: ${error.code}, message: ${error.message}`
          );
          reject(error);
        });
    });
  }
  onRoomPropertyUpdated(callbackID: string, callback: (notifyData: ZIMRoomAttributesUpdateInfo) => void) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
    }
    if (typeof callback !== 'function') {
      if (callbackID in this._onRoomPropertyUpdatedCallbackMap) {
        zloginfo(
          '[Core][onRoomPropertyUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onRoomPropertyUpdatedCallbackMap[callbackID];
      }
    } else {
      this._onRoomPropertyUpdatedCallbackMap[callbackID] = callback;
    }
  }
}
