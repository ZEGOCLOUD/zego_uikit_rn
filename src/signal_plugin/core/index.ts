import type {
  ZIMAppConfig,
  ZIMUserInfo,
  ZIMCallInviteConfig,
  ZIMCallCancelConfig,
  ZIMCallAcceptConfig,
  ZIMCallRejectConfig,
  ZIMError,
  ZIMEventOfConnectionStateChangedResult,
  ZIMEventOfCallInvitationReceivedResult,
  ZIMEventOfCallInvitationCancelledResult,
  ZIMEventOfCallInvitationAcceptedResult,
  ZIMEventOfCallInvitationRejectedResult,
  ZIMEventOfCallInvitationTimeoutResult,
  ZIMEventOfCallInviteesAnsweredTimeoutResult,
  ZIMCallInvitationSentResult,
  ZIMCallCancelSentResult,
  ZIMCallAcceptanceSentResult,
  ZIMCallRejectionSentResult,
  ZIMCallInvitationQueryConfig,
  ZIMCallInvitationListQueriedResult,
  ZIMCallInfo,
} from 'zego-zim-react-native';
import { ZIMConnectionState, ZIMCallUserState } from "../defines";
import ZegoPluginResult from './defines';
import { zlogerror, zloginfo, zlogwarning } from '../utils/logger';
import ZegoPluginUserInRoomAttributesCore from './user_in_room_attributes_core';
import ZegoPluginRoomPropertiesCore from './room_properties_core';
import ZegoUIKitCorePlugin from "../../components/internal/ZegoUIKitCorePlugin";
import ZegoPluginRoomMessageCore from './in_room_message_core';

export default class ZegoSignalingPluginCore {
  static shared: ZegoSignalingPluginCore;
  _loginUser = {} as ZIMUserInfo;
  _isLogin = false;
  _callIDUsers = new Map<string, string>(); // <zim call id, user id>
  _connectionState = ZIMConnectionState.Disconnected;
  _onConnectionStateChangedCallbackMap: { [index: string]: (notifyData: { state: ZIMConnectionState }) => void } = {};
  _onCallInvitationReceivedCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    inviter: { name: string; id: string; }; type: number; data: string;
  }) => void } = {};
  _onCallInvitationCancelledCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) => void } = {};
  _onCallInvitationAcceptedCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) => void } = {};
  _onCallInvitationRejectedCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) => void } = {};
  _onCallInvitationTimeoutCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) => void } = {};
  _onCallInviteesAnsweredTimeoutCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    invitees: { id: string; name: string; }[];
    data: string;
  }) => void } = {};
  _currentInvitationID = ''
  constructor() {
    if (!ZegoSignalingPluginCore.shared) {
      zloginfo('[Core]ZegoSignalingPluginCore successful instantiation.');
      ZegoSignalingPluginCore.shared = this;
    }
    return ZegoSignalingPluginCore.shared;
  }
  static getInstance() {
    if (!ZegoSignalingPluginCore.shared) {
      ZegoSignalingPluginCore.shared = new ZegoSignalingPluginCore();
    }
    return ZegoSignalingPluginCore.shared;
  }
  // ------- internal events register ------
  _registerEngineCallback() {
    zloginfo('[Core]Register callback for ZIM...');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on('error', (zim: any, errorInfo: ZIMError) => {
      zlogerror(
        `[Core]Zim error, code:${errorInfo.code}, message:${errorInfo.message}.`
      );
    });
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'connectionStateChanged',
      (zim: any, { state, event, extendedData }: ZIMEventOfConnectionStateChangedResult) => {
        zloginfo(
          `[Core]Connection state changed, state:${state}, event:${event}, extended data:${extendedData}`
        );
        this._connectionState = state;
        this._notifyConnectionStateChanged({ state });
        if (this._connectionState === ZIMConnectionState.Disconnected) {
          zlogwarning('[Core]Disconnected, auto logout.');
          // this.logout();
        }
      }
    );
    // Callback of the call invitation received by the invitee.
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'callInvitationReceived',
      (zim: any, { callID, inviter, timeout, extendedData }: ZIMEventOfCallInvitationReceivedResult) => {
        zloginfo(
          '[Core][callInvitationReceived callback]',
          callID,
          inviter,
          timeout,
          extendedData
        );
        if (this._currentInvitationID == callID) {
          return
        } else {
          this._currentInvitationID = callID
        }
        this._callIDUsers.set(callID, inviter);
        console.log('ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().onCallInvitationReceived', callID, extendedData)
        
        const notifyData: any = { callID, inviter: { id: inviter } };
        if (extendedData) {
          const extendedMap = JSON.parse(extendedData);
          notifyData.inviter.name = extendedMap.inviter_name;
          notifyData.type = extendedMap.type;
          notifyData.data = extendedMap.data;
        }
        this._notifyCallInvitationReceived(notifyData);
      }
    );
    // Callback of the disinvitation notification received by the invitee.
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'callInvitationCancelled',
      (zim: any, { callID, inviter, extendedData }: ZIMEventOfCallInvitationCancelledResult) => {
        zloginfo(
          '[Core][callInvitationCancelled callback]',
          callID,
          inviter,
          extendedData
        );
        this._callIDUsers.delete(callID);
        const notifyData = {
          callID,
          inviter: { id: inviter, name: '' },
          data: extendedData,
        };
        this._notifyCallInvitationCancelled(notifyData);
      }
    );
    // Callback of the invitation acceptance notification received by the inviter.
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'callInvitationAccepted',
      (zim: any, { callID, invitee, extendedData }: ZIMEventOfCallInvitationAcceptedResult) => {
        zloginfo(
          '[Core][callInvitationAccepted callback]',
          callID,
          invitee,
          extendedData
        );
        const notifyData = {
          callID,
          invitee: { id: invitee, name: '' },
          data: extendedData,
        };
        this._notifyCallInvitationAccepted(notifyData);
      }
    );
    // Callback of notification received by the inviter that the inviter has declined the invitation.
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'callInvitationRejected',
      (zim: any, { callID, invitee, extendedData }: ZIMEventOfCallInvitationRejectedResult) => {
        zloginfo(
          '[Core][callInvitationRejected callback]',
          callID,
          invitee,
          extendedData
        );
        const notifyData = {
          callID,
          invitee: { id: invitee, name: '' },
          data: extendedData,
        };
        this._notifyCallInvitationRejected(notifyData);
      }
    );
    // Call invitation timeout notification callback for the invitee.
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on('callInvitationTimeout', (zim: any, { callID }: ZIMEventOfCallInvitationTimeoutResult) => {
      zloginfo('[Core][callInvitationTimeout callback]', callID);
      const notifyData = {
        callID,
        inviter: { id: this._getInviterIDByCallID(callID), name: '' },
        data: '',
      };
      this._notifyCallInvitationTimeout(notifyData);
    });
    // Call invitation timeout notification callback by the inviter.
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on(
      'callInviteesAnsweredTimeout',
      (zim: any, { callID, invitees }: ZIMEventOfCallInviteesAnsweredTimeoutResult) => {
        zloginfo(
          '[Core][callInviteesAnsweredTimeout callback]',
          callID,
          invitees
        );
        const notifyData = {
          callID,
          invitees: invitees.map((invitee) => {
            return { id: invitee, name: '' };
          }),
          data: '',
        };
        this._notifyCallInviteesAnsweredTimeout(notifyData);
      }
    );
  }
  _unregisterEngineCallback() {
    zloginfo('[Core]Unregister callback from ZIM...');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('error');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('connectionStateChanged');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInvitationReceived');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInvitationCancelled');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInvitationAccepted');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInvitationRejected');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInvitationTimeout');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInviteesAnsweredTimeout');
  }
  // ------- internal events exec ------
  _notifyConnectionStateChanged(notifyData: { state: ZIMConnectionState }) {
    Object.keys(this._onConnectionStateChangedCallbackMap).forEach(
      (callbackID) => {
        if (this._onConnectionStateChangedCallbackMap[callbackID]) {
          this._onConnectionStateChangedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationReceived(notifyData: {
    callID: string;
    inviter: { name: string; id: string; };
    type: number;
    data: string;
  }) {
    Object.keys(this._onCallInvitationReceivedCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationReceivedCallbackMap[callbackID]) {
          this._onCallInvitationReceivedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationCancelled(notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) {
    Object.keys(this._onCallInvitationCancelledCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationCancelledCallbackMap[callbackID]) {
          this._onCallInvitationCancelledCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationAccepted(notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) {
    Object.keys(this._onCallInvitationAcceptedCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationAcceptedCallbackMap[callbackID]) {
          this._onCallInvitationAcceptedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationRejected(notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) {
    Object.keys(this._onCallInvitationRejectedCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationRejectedCallbackMap[callbackID]) {
          this._onCallInvitationRejectedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationTimeout(notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) {
    Object.keys(this._onCallInvitationTimeoutCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationTimeoutCallbackMap[callbackID]) {
          this._onCallInvitationTimeoutCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInviteesAnsweredTimeout(notifyData: {
    callID: string;
    invitees: { id: string; name: string; }[];
    data: string;
  }) {
    Object.keys(this._onCallInviteesAnsweredTimeoutCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID]) {
          this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID](
            notifyData
          );
        }
      }
    );
  }
  // ------- internal utils ------
  _resetData() {
    this._resetDataForLogout();
  }
  _resetDataForLogout() {
    this._isLogin = false;
    this._loginUser = {} as ZIMUserInfo;
    this._callIDUsers.clear();
    this._connectionState = ZIMConnectionState.Disconnected;
  }
  _getInviterIDByCallID(callID: string) {
    return this._callIDUsers.get(callID);
  }
  _createHandle() {
    this._unregisterEngineCallback();
    this._registerEngineCallback();
    // live audio room
    ZegoPluginUserInRoomAttributesCore.getInstance()._unregisterEngineCallback();
    ZegoPluginUserInRoomAttributesCore.getInstance()._registerEngineCallback();
    ZegoPluginRoomPropertiesCore.getInstance()._unregisterEngineCallback();
    ZegoPluginRoomPropertiesCore.getInstance()._registerEngineCallback();
    ZegoPluginRoomMessageCore.getInstance()._unregisterEngineCallback();
    ZegoPluginRoomMessageCore.getInstance()._registerEngineCallback();
  }
  // ------- external utils ------
  getLocalUser() {
    return this._loginUser;
  }
  getCallIDByUserID(userID: string) {
    let callID = '';
    Array.from(this._callIDUsers.keys()).forEach((key) => {
      const value = this._callIDUsers.get(key);
      if (userID === value) {
        callID = key;
        zloginfo('[Core]getCallIDByUserID', userID, this._callIDUsers, callID);
      }
    });
    return callID;
  }
  // ------- external method ------
  getZIMInstance() {
    return ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance();
  }
  getVersion(): Promise<string> {
    return ZegoUIKitCorePlugin.getZIMPlugin().default.getVersion();
  }
  create(appConfig: ZIMAppConfig) {
    if (!ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()) {
      const zim = ZegoUIKitCorePlugin.getZIMPlugin().default.create(appConfig);
      if (!zim) {
        zlogerror('[Core]Create zim error.');
      } else {
        zloginfo('[Core]Create zim success.');
        this._createHandle();
      }
    } else {
      zlogwarning('[Core]Zim has created.');
      this._createHandle();
    }
  }
  login(userInfo: ZIMUserInfo, token = ''): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._isLogin) {
        ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
          .login(userInfo, token)
          .then(() => {
            zloginfo('[Core]Login success.');
            this._loginUser = userInfo;
            this._isLogin = true;
            resolve();
          }).catch((error: ZIMError) => {
            if (error.code == 6000111) {
              zloginfo('[Core]Login already success.', error);
              resolve();
            } else {
              reject(error);
            }
          });
      } else {
        zloginfo('[Core]Login already success.');
        resolve();
      }
    });
  }
  logout(): Promise<void> {
    return ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
      .logout()
      .then(() => {
        zloginfo('[Core]Logout success.');
        this._resetDataForLogout();
        // live audio room
        ZegoPluginUserInRoomAttributesCore.getInstance()._resetData();
      });
  }
  destroy() {
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().destroy();
    zloginfo('[Core]Destroy success.');
    this._resetData();
  }
  invite(invitees: string[], config: ZIMCallInviteConfig): Promise<{ callID: string; errorInvitees: string[]; code: string, message: string; }> {
    return new Promise((resolve, reject) => {
      console.warn(invitees);
      console.warn(config);
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callInvite(invitees, config)
        .then(({ callID, timeout, errorInvitees }: ZIMCallInvitationSentResult) => {
          this._callIDUsers.set(callID, this._loginUser.userID);
          if (!errorInvitees || !errorInvitees.length) {
            zloginfo(`[Core]Invite done, call id: ${callID}`);
            resolve({
              ...new ZegoPluginResult('', ''),
              callID,
              errorInvitees: [],
            });
          } else {
            const errorInviteeIDs: string[] = [];
            errorInvitees.forEach((errorInvitee) => {
              const desc =
                errorInvitee.state === ZIMCallUserState.Offline
                  ? 'offine'
                  : errorInvitee.state === ZIMCallUserState.Inviting
                  ? 'inviting'
                  : '';
              zlogwarning(
                `[Core]Invite error, invitee id: ${errorInvitee.userID}, invitee state: ${errorInvitee.state}, state desc: ${desc}`
              );
              errorInviteeIDs.push(errorInvitee.userID);
            });
            resolve({
              ...new ZegoPluginResult('', ''),
              callID,
              errorInvitees: errorInviteeIDs,
            });
          }
        })
        .catch((error: ZIMError) => {
          reject(error);
        });
    });
  }
  cancel(invitees: string[], callID: string, config: ZIMCallCancelConfig): Promise<{ code: string, message: string; errorInvitees: string[]; }> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callCancel(invitees, callID, config)
        .then(({ callID: resCallID, errorInvitees }: ZIMCallCancelSentResult) => {
          this._callIDUsers.delete(callID);
          if (!errorInvitees || !errorInvitees.length) {
            zloginfo(`[Core]Cancel invitation done, call id: ${callID}`);
            resolve({ ...new ZegoPluginResult('', ''), errorInvitees: [] });
          } else {
            errorInvitees.forEach((inviteeID) => {
              zlogwarning(
                `[Core]Cancel invitation error, invitee id: ${inviteeID}`
              );
            });
            resolve({ ...new ZegoPluginResult('', ''), errorInvitees });
          }
        })
        .catch((error: ZIMError) => {
          reject(error);
        });
    });
  }
  accept(callID: string, config: ZIMCallAcceptConfig): Promise<{ code: string, message: string; }> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callAccept(callID, config)
        .then(({ callID: resCallID }: ZIMCallAcceptanceSentResult) => {
          zloginfo(`[Core]Accept invitation done, call id: ${callID}`);
          resolve(new ZegoPluginResult());
        })
        .catch((error: ZIMError) => {
          reject(error);
        });
    });
  }
  reject(callID: string, config: ZIMCallRejectConfig): Promise<{ code: string, message: string; }> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callReject(callID, config)
        .then(({ callID: resCallID }: ZIMCallRejectionSentResult) => {
          zloginfo(`[Core]Reject invitation done, call id: ${callID}`);
          this._callIDUsers.delete(callID);
          resolve(new ZegoPluginResult());
        })
        .catch((error: ZIMError) => {
          reject(error);
        });
    });
  }
  queryCallList(config: ZIMCallInvitationQueryConfig): Promise<{ callList: ZIMCallInfo[], nextFlag: number; }> {
    return new Promise((resolve, reject) => {
        ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .queryCallInvitationList(config)
        .then(({callList, nextFlag: newFlag} : ZIMCallInvitationListQueriedResult) => {
            zloginfo(`[Core]Query invitation list done, nextFlag: ${newFlag}, calllist: ${callList.length}`);
            const data = {callList: callList, nextFlag: newFlag};
            resolve(data);
        })
        .catch((error: ZIMError) => {
            reject(error);
        })
    });
  }
  // ------- external events register ------
  onConnectionStateChanged(callbackID: string, callback: (notifyData: { state: ZIMConnectionState }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onConnectionStateChangedCallbackMap) {
        zloginfo(
          '[Core][onConnectionStateChanged] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onConnectionStateChangedCallbackMap[callbackID];
      }
    } else {
      this._onConnectionStateChangedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationReceived(callbackID: string, callback: (notifyData: {
    callID: string;
    inviter: { name: string; id: string; }; type: number; data: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationReceivedCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationReceived] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationReceivedCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationReceivedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationCancelled(callbackID: string, callback: (notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationCancelledCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationCancelled] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationCancelledCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationCancelledCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationAccepted(callbackID: string, callback: (notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationAcceptedCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationAccepted] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationAcceptedCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationAcceptedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationRejected(callbackID: string, callback: (notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationRejectedCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationRejected] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationRejectedCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationRejectedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationTimeout(callbackID: string, callback: (notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationTimeoutCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationTimeout] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationTimeoutCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationTimeoutCallbackMap[callbackID] = callback;
    }
  }
  onCallInviteesAnsweredTimeout(callbackID: string, callback: (notifyData: {
    callID: string;
    invitees: { id: string; name: string; }[];
    data: string;
  }) => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInviteesAnsweredTimeoutCallbackMap) {
        zloginfo(
          '[Core][onCallInviteesAnsweredTimeout] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID];
      }
    } else {
      this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID] = callback;
    }
  }
}
