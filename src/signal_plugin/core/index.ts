import { AppState } from 'react-native';
import {
  type ZIMAppConfig,
  type ZIMUserInfo,
  type ZIMCallInviteConfig,
  type ZIMCallCancelConfig,
  type ZIMCallAcceptConfig,
  type ZIMCallRejectConfig,
  type ZIMError,
  type ZIMEventOfConnectionStateChangedResult,
  type ZIMEventOfCallInvitationReceivedResult,
  type ZIMEventOfCallUserStateChangedResult,
  type ZIMCallInvitationSentResult,
  type ZIMCallCancelSentResult,
  type ZIMCallAcceptanceSentResult,
  type ZIMCallRejectionSentResult,
  type ZIMCallInvitationQueryConfig,
  type ZIMCallInvitationListQueriedResult,
  type ZIMCallInfo,
  type ZIMEventOfTokenWillExpireResult,
  ZIMCallUserState,
  ZIMConnectionState,
  ZIMErrorCode,
} from 'zego-zim-react-native';
import ZegoPluginResult from './defines';
import { zlogerror, zloginfo, zlogwarning } from '../utils/logger';
import ZegoPluginUserInRoomAttributesCore from './user_in_room_attributes_core';
import ZegoPluginRoomPropertiesCore from './room_properties_core';
import ZegoUIKitCorePlugin from "../../components/internal/ZegoUIKitCorePlugin";
import ZegoPluginRoomMessageCore from './in_room_message_core';
import { getZimConnectionEventName, getZimConnectionStateName } from '../../utils/enum_name';
import ZegoUIKitReport from '../../utils/report';

export default class ZegoSignalingPluginCore {
  static shared: ZegoSignalingPluginCore;
  _loginUser = {} as ZIMUserInfo;
  _isLogin = false;
  _callIDUsers = new Map<string, string>(); // <zim call id, user id>
  _connectionState = ZIMConnectionState.Disconnected;
  _onConnectionStateChangedCallbackMap: { [index: string]: (notifyData: { state: ZIMConnectionState }) => void } = {};
  _onCallInvitationReceivedCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    type: number;
    inviter: { name: string; id: string; };
    data: string;
  }) => void } = {};
  _onCallInvitationCancelledCallbackMap: { [index: string]: (notifyData: {
    callID: string;
    inviter: { id: string };
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
  _onRequireNewTokenCallbackMap: { [index: string]: () => string } = {};
  _onLoginSuccessCallbackMap: { [index: string]: () => void } = {};

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
          `[Core]Connection state changed, state:${getZimConnectionStateName(state)}, event:${getZimConnectionEventName(event)}, extended data:${extendedData}`
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
          'callID:', callID,
          'inviter:', inviter,
          'timeout:', timeout,
          'extendedData:', extendedData
        );
        if (this._currentInvitationID == callID) {
          return
        } else {
          this._currentInvitationID = callID
        }
        this._callIDUsers.set(callID, inviter);
        
        const notifyData: any = { callID, inviter: { id: inviter } };
        if (extendedData) {
          const extendedMap = JSON.parse(extendedData);
          notifyData.inviter.name = extendedMap.inviter_name;
          notifyData.type = extendedMap.type;
          notifyData.data = extendedMap.data;
          notifyData.timeout = timeout
        }
        this._notifyCallInvitationReceived(notifyData);
        ZegoUIKitReport.reportEvent('invitationReceived', {
          'call_id': notifyData.callID,
          'inviter': notifyData.inviter.id,
          'app_state': AppState.currentState,
          'extended_data': extendedData
        })
      }
    );

    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on('callUserStateChanged', (zim: any, result: ZIMEventOfCallUserStateChangedResult) => {
      let callID = result.callID
      let callUserList = result.callUserList
      let callerID = this._getInviterIDByCallID(callID)
      zloginfo(`[SignalingPluginCore][callUserStateChanged callback], callID: ${callID}, callerID: ${callerID}, callUserList: ${JSON.stringify(callUserList)}`)

      callUserList.map(callUserInfo => {
        let callUserID = callUserInfo.userID
        let callUserState = callUserInfo.state
        let callExtendedData = callUserInfo.extendedData

        if (callUserState === ZIMCallUserState.Accepted && callUserID !== this._loginUser.userID) {   // 1
          // as caller, state changed to Accepted as soon as after call, and wait for the other callees to change to the Accepted state
          // as callee, should ignore anyone state changed callback
          zloginfo(`[SignalingPluginCore][callUserStateChanged callback], detect ${callUserID} Accepted`)
          if (this._loginUser.userID !== callerID) {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], ignore`)
          } else if (callUserID !== this._loginUser.userID) {
            // detect other state changed
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], notifyCallInvitationAccepted`)

            let dataParsed = callExtendedData ? JSON.parse(callExtendedData) : {}
            dataParsed.callID = callID
            dataParsed.call_id = dataParsed.call_id ?? ''
            dataParsed.invitee = dataParsed.invitee ?? {userID: callUserID, userName: ''}

            const notifyData = {
              callID,
              invitee: { id: callUserID, name: '' },
              data: JSON.stringify(dataParsed),
            };
            this._notifyCallInvitationAccepted(notifyData);
          }
        } else if (callUserState === ZIMCallUserState.Rejected) {  // 2
          // as caller, wait for the other callees's state changed to Rejected
          // as callee, should ignore anyone state changed callback
          zloginfo(`[SignalingPluginCore][callUserStateChanged callback], detect ${callUserID} Rejected`)
          if (this._loginUser.userID !== callerID) {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], ignore`)
          } else {
            // detect other state changed
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], notifyCallInvitationRejected`)

            let dataParsed = callExtendedData ? JSON.parse(callExtendedData) : {}
            dataParsed.callID = callID
            dataParsed.call_id = dataParsed.call_id ?? ''
            dataParsed.invitee = dataParsed.invitee ?? {userID: callUserID, userName: ''}

            const notifyData = {
              callID,
              invitee: { id: callUserID, name: '' },
              data: JSON.stringify(dataParsed),
            };
            this._notifyCallInvitationRejected(notifyData);  
          }
        } else if (callUserState === ZIMCallUserState.Timeout) {  // 6
          // as caller, wait for the other callees's state changed to the Timeout
          // as callee, should only care own state changed to Timeout
          zloginfo(`[SignalingPluginCore][callUserStateChanged callback], detect ${callUserID} Timeout`)
          if (this._loginUser.userID === callerID) {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], notifyCallInviteesAnsweredTimeout`)

            let dataParsed = callExtendedData ? JSON.parse(callExtendedData) : {}
            dataParsed.call_id = dataParsed.call_id ?? ''
            dataParsed.invitees = [{userID: callUserID, userName: ''}]

            const notifyData = {
              callID,
              invitees: [{ id: callUserID, name: '' }],
              data: JSON.stringify(dataParsed),
            };
            this._notifyCallInviteesAnsweredTimeout(notifyData);  // for onOutgoingCallTimeout
          } else if (callUserID === this._loginUser.userID) {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], notifyCallInvitationTimeout`)

            let dataParsed = callExtendedData ? JSON.parse(callExtendedData) : {}
            dataParsed.call_id = dataParsed.call_id ?? ''
            dataParsed.inviter = [{userID: this._getInviterIDByCallID(callID), userName: ''}]

            const notifyData = {
              callID,
              inviter: { id: this._getInviterIDByCallID(callID), name: '' },
              data: JSON.stringify(dataParsed),
            };
            this._notifyCallInvitationTimeout(notifyData);        // for onIncomingCallTimeout
          } else {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], ignore`)
          }
        } else if (callUserState === ZIMCallUserState.Cancelled || callUserState === ZIMCallUserState.BeCancelled) {  // 3 or 10
          // as caller, will detect own state Cancelled after cancel active or cancelled by the svr during the network disconnection
          // as callee, will detect own state BeCancelled after the invitation cancelled
          zloginfo(`[SignalingPluginCore][callUserStateChanged callback], detect ${callUserID} ${callUserState === ZIMCallUserState.Cancelled ? 'Cancelled' : 'BeCancelled'}`)
          if (callUserID !== this._loginUser.userID) {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], ignore`)
          } else {
            zloginfo(`[SignalingPluginCore][callUserStateChanged callback], notifyCallInvitationCancelled`)
            
            let dataParsed = callExtendedData ? JSON.parse(callExtendedData) : {}
            dataParsed.callID = callID
            dataParsed.call_id = dataParsed.call_id ?? ''
            dataParsed.inviter = dataParsed.inviter ?? {userID: '', userName: ''}
            
            const notifyData = {
              callID,
              inviter: { id: this._getInviterIDByCallID(callID) },
              data: JSON.stringify(dataParsed),
            };
            this._callIDUsers.delete(callID);
            this._notifyCallInvitationCancelled(notifyData);
          }
        }
      })
    });

    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().on('tokenWillExpire', (zim: any, { second }: ZIMEventOfTokenWillExpireResult) => {
      zloginfo('zim token will expire.');
      Object.keys(this._onRequireNewTokenCallbackMap).forEach(
        async (callbackID) => {
          if (this._onRequireNewTokenCallbackMap[callbackID]) {
            const token = await this._onRequireNewTokenCallbackMap[callbackID]();
            if (token) {
                this.renewToken(token);
            } else {
              zlogerror('Renew token failed: the returned token is abnormal');
            }
          }
        }
      );
    });
  }
  _unregisterEngineCallback() {
    zloginfo('[Core]Unregister callback from ZIM...');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('error');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('connectionStateChanged');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callUserStateChanged');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('callInvitationReceived');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().off('tokenWillExpire');
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
    type: number;
    inviter: { name: string; id: string; };
    data: string;
  }) {
    let callbackCount = Object.keys(this._onCallInvitationReceivedCallbackMap).length;
    zloginfo(`[ZegoSignalingPluginCore][_notifyCallInvitationReceived] notify count: ${callbackCount}`);

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
    inviter: { id: string };
    data: string;
  }) {
    let callbackCount = Object.keys(this._onCallInvitationCancelledCallbackMap).length;
    zloginfo(`[ZegoSignalingPluginCore][_notifyCallInvitationCancelled] notify count: ${callbackCount}`);

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
        zloginfo(`[Core]getCallIDByUserID, ${userID} => ${callID}`);
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
      zlogwarning('[Core]Zim has already created.');
      this._createHandle();
    }
  }
  login(userInfo: ZIMUserInfo, token = ''): Promise<void> {
    zloginfo('ZIM login...');
    return new Promise((resolve, reject) => {
      if (!this._isLogin) {
        ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
          .login(userInfo, token)
          .then(() => {
            zloginfo('ZIM login success.');
            zloginfo('[Core]Login success.');
            this._loginUser = userInfo;
            this._isLogin = true;
            resolve();
            zloginfo('notify _onLoginSuccessCallbackMap');
            Object.keys(this._onLoginSuccessCallbackMap).forEach((callbackID) => {
              if (this._onLoginSuccessCallbackMap[callbackID]) {
                this._onLoginSuccessCallbackMap[callbackID]()
              }
            });
          }).catch((error: ZIMError) => {
            if (error.code == ZIMErrorCode.NetworkModuleUserHasAlreadyLogged) {
              zloginfo('ZIM login already.');
              zloginfo('[Core]Login already success.');
              resolve();
              zloginfo('notify _onLoginSuccessCallbackMap');
              Object.keys(this._onLoginSuccessCallbackMap).forEach((callbackID) => {
                if (this._onLoginSuccessCallbackMap[callbackID]) {
                  this._onLoginSuccessCallbackMap[callbackID]()
                }
              });
            } else {
              zloginfo(`ZIM login fail, error: ${error.code}`);
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
    zloginfo('ZIM logout...');
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
    zloginfo('ZIM destroy...');
    ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance().destroy();
    zloginfo('[Core]Destroy success.');
    this._resetData();
  }
  setAdvancedConfig(key: string, value: string) {
    zloginfo(`[Core]setAdvancedConfig, key: ${key}, value: ${value}`);
    ZegoUIKitCorePlugin.getZIMPlugin().default.setAdvancedConfig(key, value);
  }
  invite(invitees: string[], config: ZIMCallInviteConfig): Promise<{ callID: string; errorInvitees: string[]; code: string, message: string; }> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callInvite(invitees, config)
        .then(({ callID, timeout, errorInvitees, errorUserList }: ZIMCallInvitationSentResult) => {
          ZegoUIKitReport.reportEvent('callInvite', {
            'invitees': JSON.stringify(invitees),
            'count': invitees.length,
            'error_userlist': JSON.stringify(errorUserList),
            'error_count': errorUserList.length,
            'call_id': callID,
            'extended_data': config.extendedData,
            'error': 0,
            'msg': ''
          })

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
          ZegoUIKitReport.reportEvent('callInvite', {
            'invitees': JSON.stringify(invitees),
            'count': invitees.length,
            'call_id': '',
            'extended_data': config.extendedData,
            'error': error.code,
            'msg': error.message
          })

          reject(error);
        });
    });
  }
  cancel(invitees: string[], callID: string, config: ZIMCallCancelConfig): Promise<{ code: string, message: string; callID: string, errorInvitees: string[]; }> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callCancel(invitees, callID, config)
        .then(({ callID, errorInvitees }: ZIMCallCancelSentResult) => {
          this._callIDUsers.delete(callID);
          if (!errorInvitees || !errorInvitees.length) {
            zloginfo(`[Core]Cancel invitation done, call id: ${callID}`);
            resolve({ ...new ZegoPluginResult('', ''), callID, errorInvitees: [] });
          } else {
            errorInvitees.forEach((inviteeID) => {
              zlogwarning(
                `[Core]Cancel invitation error, invitee id: ${inviteeID}`
              );
            });
            resolve({ ...new ZegoPluginResult('', ''), callID, errorInvitees });
          }
        })
        .catch((error: ZIMError) => {
          zloginfo(`[Core]Cancel invitation failed, call id: ${callID}, error: ${error}`);
          reject(error);
        });
    });
  }
  accept(callID: string, config: ZIMCallAcceptConfig): Promise<{ code: string, message: string; }> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .callAccept(callID, config)
        .then(({ callID }: ZIMCallAcceptanceSentResult) => {
          zloginfo(`[Core]Accept invitation done, call id: ${callID}`);
          resolve(new ZegoPluginResult('', '', {callID}));
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
        .then(({ callID }: ZIMCallRejectionSentResult) => {
          zloginfo(`[Core]Reject invitation done, call id: ${callID}`);
          this._callIDUsers.delete(callID);
          resolve(new ZegoPluginResult('', '', {callID}));
        })
        .catch((error: ZIMError) => {
          zloginfo(`[Core]Reject invitation error, call id: ${callID}, error: ${error.code}`);
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

  renewToken(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ZegoUIKitCorePlugin.getZIMPlugin().default.getInstance()
        .renewToken(token)
        .then(() => {
          zloginfo(`Renew zim token success, token: ${token}`);
          resolve();
        })
        .catch ((error: ZIMError) => {
          zlogerror(`Renew zim token failed. code: ${error.code}, message: ${error.message}`);
          reject(error);
        });
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
    type: number;
    inviter: { name: string; id: string; };
    data: string;
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
        zloginfo('[Core][onCallInvitationCancelled] Remove callback for: [', callbackID, ']');
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
  onRequireNewToken(callbackID: string, callback: () => string) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onRequireNewTokenCallbackMap) {
        zloginfo(
          '[Core][onRequireNewToken] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onRequireNewTokenCallbackMap[callbackID];
      }
    } else {
      this._onRequireNewTokenCallbackMap[callbackID] = callback;
    }
  }
  onLoginSuccess(callbackID: string, callback?: () => void) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onLoginSuccessCallbackMap) {
        delete this._onLoginSuccessCallbackMap[callbackID];
        zloginfo(`[onLoginSuccess] Remove callback for: ${callbackID}`)
      }
    } else {
      this._onLoginSuccessCallbackMap[callbackID] = callback;
      if (this._isLogin) {
        zloginfo(`[onLoginSuccess] already login, execute callback directly.`)
        callback()
      }
    }
  }
}
