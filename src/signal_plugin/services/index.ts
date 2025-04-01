import { Platform } from 'react-native';
import type { ZIMCallInviteConfig, ZIMCallCancelConfig, ZIMConnectionState } from 'zego-zim-react-native';
import type { ZPNsRegisterMessage, ZPNsMessage } from 'zego-zpns-react-native';

import ZegoSignalingPluginCore from '../core';
import ZegoPluginResult from '../core/defines';
import { zlogerror, zloginfo, zlogwarning } from '../utils/logger';
import { CXCallEndedReason, CXCallUpdate } from '../defines';
import ZegoUIKitCorePlugin from '../../components/internal/ZegoUIKitCorePlugin';
import ZegoUIKitReport from '../../utils/report';

export default class ZegoPluginInvitationService {
  static shared: ZegoPluginInvitationService;
  _androidOfflineDataHandler: (data: any) => void;
  _iOSOfflineDataHandler: (data: any, uuid: string) => void;
  _callKitAnswerCallHandler: (action: any) => void;
  _callKitEndCallHandler: (action: any) => void;
  _advancedConfig: { [index: string]: string } = {};

  constructor() {
    if (!ZegoPluginInvitationService.shared) {
      ZegoPluginInvitationService.shared = this;
    }
    return ZegoPluginInvitationService.shared;
  }
  static getInstance() {
    if (!ZegoPluginInvitationService.shared) {
      ZegoPluginInvitationService.shared = new ZegoPluginInvitationService();
    }
    return ZegoPluginInvitationService.shared;
  }

  setBackgroundMessageHandler() {
    zloginfo('[ZegoPluginInvitationService] ZPNs setBackgroundMessageHandler')
    ZegoUIKitCorePlugin.getZPNsPlugin().default.setBackgroundMessageHandler((message: ZPNsMessage) => {
      zloginfo('ZPNs backgroundMessageHandler message: ', message)
      const dataObj = JSON.parse(message.extras.payload);
      dataObj.zim_call_id = message.extras.call_id;

      // Pre-emptively determine whether to cancel for accurate reporting
      const cancelInvitation = dataObj && dataObj.operation_type === "cancel_invitation"
      if (!cancelInvitation) {
        ZegoUIKitReport.reportEvent('invitationReceived', {
          'call_id': dataObj.zim_call_id,
          'inviter': dataObj.inviter.id,
          'app_state': 'restarted',
          'extended_data': message.extras.payload
        })
      }

      let offlineDataHandler = ZegoPluginInvitationService.getInstance().getAndroidOfflineDataHandler()
      offlineDataHandler(dataObj)
    })
  }

  setThroughMessageReceivedHandler() {
    zloginfo('[ZegoPluginInvitationService] ZPNs setThroughMessageReceivedHandler')
    ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("throughMessageReceived", (message: ZPNsMessage) => {
      zloginfo('ZPNs throughMessageReceived message: ', message)
      const dataObj = JSON.parse(message.extras.payload);
      dataObj.zim_call_id = message.extras.call_id;

      let offlineDataHandler = ZegoPluginInvitationService.getInstance().getAndroidOfflineDataHandler()
      offlineDataHandler(dataObj)
    })
  }

  setAndroidOfflineDataHandler(handler: (data: any) => void) {
    zloginfo('[ZegoPluginInvitationService] ZPNs setAndroidOfflineDataHandler')
    this._androidOfflineDataHandler = handler;
  }
  getAndroidOfflineDataHandler() {
    return this._androidOfflineDataHandler;
  }
  setIOSOfflineDataHandler(handler: (data: any, uuid: string) => void) {
    zloginfo(`[ZegoPluginInvitationService][setIOSOfflineDataHandler]`)
    this._iOSOfflineDataHandler = handler;
  }
  onCallKitAnswerCall(handler: (action: any) => void) {
    this._callKitAnswerCallHandler = handler;
  }
  onCallKitEndCall(handler: (action: any) => void) {
    this._callKitEndCallHandler = handler;
  }
  getIOSOfflineDataHandler() {
    return this._iOSOfflineDataHandler;
  }
  getAnswerCallHandle() {
    return this._callKitAnswerCallHandler;
  }
  getEndCallHandle() {
    return this._callKitEndCallHandler;
  }
  reportCallKitCallEnded(uuid: string, reason: CXCallEndedReason) {
    if (ZegoUIKitCorePlugin.getCallKitPlugin()) {
      return ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().reportCallEnded(reason, uuid);
    } else {
      zlogwarning('[ZegoPluginInvitationService][reportCallKitCallEnded] Cannot getCallKitPlugin');
    }
  }
  reportIncomingCall(cxCallUpdate: CXCallUpdate, uuid: string): Promise<any> {
    if (ZegoUIKitCorePlugin.getCallKitPlugin()) {
      return ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().reportIncomingCall(cxCallUpdate, uuid);
    } else {
      zlogwarning('[ZegoPluginInvitationService][reportIncomingCall] Cannot getCallKitPlugin');
      return Promise.reject('Cannot get CallKit plugin');
    }
  }
  getZIMInstance() {
    return ZegoSignalingPluginCore.getInstance().getZIMInstance();
  }
  getVersion() {
    return ZegoSignalingPluginCore.getInstance().getVersion();
  }
  init(appID: number, appSign: string) {
    ZegoSignalingPluginCore.getInstance().create({
      appID,
      appSign,
    });

    // Some advanced key need to be called after create
    Object.keys(this._advancedConfig).forEach(key => {
      let value = this._advancedConfig[key]
      ZegoSignalingPluginCore.getInstance().setAdvancedConfig(key, value);
    });
  }
  uninit() {
    ZegoSignalingPluginCore.getInstance().destroy();
  }
  login(userID: string, userName: string, token?: string) {
    return ZegoSignalingPluginCore.getInstance().login(
      {
        userID: userID,
        userName: userName,
        userAvatarUrl: "",
      },
      token
    );
  }
  logout() {
    return ZegoSignalingPluginCore.getInstance().logout();
  }

  enableNotifyWhenAppRunningInBackgroundOrQuit(certificateIndex?: number, isIOSDevelopmentEnvironment?: boolean, appName?: string) {
    if (!certificateIndex) {
      certificateIndex = 1;
    }
    zloginfo(`[Service] enableNotifyWhenAppRunningInBackgroundOrQuit, certificateIndex: ${certificateIndex}, isIOSDevelopmentEnvironment: ${isIOSDevelopmentEnvironment}, appName: ${appName}`);
    if (ZegoUIKitCorePlugin.getZPNsPlugin()) {
      if (Platform.OS === 'android') {
        zloginfo('[ZegoPluginInvitationService] registerPush, Android');
        ZegoUIKitCorePlugin.getZPNsPlugin().default.setPushConfig({ "enableFCMPush": true, "enableHWPush": false, "enableMiPush": false, "enableOppoPush": false, "enableVivoPush": false, "appType": certificateIndex });
        ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().registerPush({ });
      } else if (Platform.OS === 'ios' && ZegoUIKitCorePlugin.getCallKitPlugin()) {
        zloginfo('[ZegoPluginInvitationService] registerPush, iOS');
        const CXProviderConfiguration = {
          localizedName: appName ?? 'My app',
          iconTemplateImageName: "AppIcon",
        };
        ZegoUIKitCorePlugin.getCallKitPlugin().default.setInitConfiguration(CXProviderConfiguration);
        ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().applyNotificationPermission();
        
        // 0 - Production; 1 - Development; 2 - Automatic
        const iOSEnvironment = isIOSDevelopmentEnvironment == null ? 2 : (isIOSDevelopmentEnvironment ? 1 : 0);
        zloginfo('[ZegoPluginInvitationService] registerPush, iOSEnvironment', iOSEnvironment);
        ZegoUIKitCorePlugin.getZPNsPlugin().default.setPushConfig({ 'appType': certificateIndex });
        ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().registerPush({ 
          enableIOSVoIP: true,
          iOSEnvironment: iOSEnvironment,
        });
      }

      ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("registered", (message: ZPNsRegisterMessage) => {
        zloginfo("[ZegoPluginInvitationService] ZPNs registered,", message)
        if (message.msg.includes("SERVICE_NOT_AVAILABLE")) {
          zlogwarning('[ZegoPluginInvitationService] ZPNs registered, Please check the network connectivity with FCM.')
        }
      });

      // ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("notificationArrived", (message) => {
      //   zloginfo("@@@@@@@@@@@@@@@@notificationArrived>>>>>>>>>>>>>>>############", getCallID(message))
      //   setZpnState("notificationArrived: " + getCallID(message))
      // })
      // ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("notificationClicked", (message) => {
      //   zloginfo("@@@@@@@@@@@@@@@@notificationClicked>>>>>>>>>>>>>>>############", getCallID(message))
      //   setZpnState("notificationClicked: " + getCallID(message))
      // })
      // ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("throughMessageReceived", (message) => {
      //   zloginfo("@@@@@@@@@@@@@@@@throughMessageReceived>>>>>>>>>>>>>>>############", getCallID(message))
      //   setZpnState("throughMessageReceived: " + getCallID(message))
      // })

      if (ZegoUIKitCorePlugin.getCallKitPlugin()) {
        zloginfo('[ZegoPluginInvitationService] register iOS didReceiveIncomingPush');
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("didReceiveIncomingPush", (extras: Record<string, any>, uuid: string) => {
          zloginfo('#########didReceiveIncomingPush', extras, uuid);
          let { payload } = extras;
          let { call_id } = extras;
          const dataObj = payload ? JSON.parse(payload) : {};
          dataObj.zim_call_id = call_id;
          ZegoPluginInvitationService.getInstance().getIOSOfflineDataHandler()(dataObj, uuid);
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("providerDidReset", () => {
          zloginfo('#########providerDidReset');
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("providerDidBegin", () => {
          zloginfo('#########providerDidBegin');
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("didActivateAudioSession", () => {
          zloginfo('#########didActivateAudioSession');
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("didDeactivateAudioSession", () => {
          zloginfo('#########didDeactivateAudioSession');
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("timedOutPerformingAction", (action: any) => {
          zloginfo('#########timedOutPerformingAction', action);
          action.fulfill();
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performStartCallAction", (action: any) => {
          zloginfo('#########performStartCallAction', action);
          action.fulfill();
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performAnswerCallAction", (action: any) => {
          zloginfo('#########performAnswerCallAction', action);
          ZegoPluginInvitationService.getInstance().getAnswerCallHandle()(action);
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performEndCallAction", (action: any) => {
          zloginfo('#########performEndCallAction', action);
          ZegoPluginInvitationService.getInstance().getEndCallHandle()(action);
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performSetHeldCallAction", (action: any) => {
          zloginfo('#########performSetHeldCallAction', action);
          action.fulfill();
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performSetMutedCallAction", (action: any) => {
          zloginfo('#########performSetMutedCallAction', action);
          action.fulfill();
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performSetGroupCallAction", (action: any) => {
          zloginfo('#########performSetGroupCallAction', action);
          action.fulfill();
        });
        ZegoUIKitCorePlugin.getCallKitPlugin().default.getInstance().on("performPlayDTMFCallAction", (action: any) => {
          zloginfo('#########performPlayDTMFCallAction', action);
          action.fulfill();
        });
      }
    }
  }
  setAdvancedConfig(key: string, value: string) {
    if (key === 'zim_voip_call_id') {
      this._advancedConfig[key] = value
    } else {
      ZegoSignalingPluginCore.getInstance().setAdvancedConfig(key, value);
    }
  }

  sendInvitation(inviterName: string, invitees: string[], timeout: number, type: number, data?: string, notificationConfig?: any) {
    if (!invitees.length) {
      zlogerror('[Service]Send invitees is empty.');
      return Promise.reject(new ZegoPluginResult());
    }
    
    const config = { timeout } as ZIMCallInviteConfig;
    config.extendedData = JSON.stringify({
      inviter_name: inviterName,
      type,
      data,
    });
    if (ZegoUIKitCorePlugin.getZPNsPlugin()) {
      config.pushConfig = {
        title: notificationConfig.title ?? "",
        content: notificationConfig.message ?? "",
        resourcesID: notificationConfig.resourceID ?? "",
        payload: data,
        voIPConfig: {
          iOSVoIPHandleType: 1,
          iOSVoIPHandleValue: '',
          iOSVoIPHasVideo: type === 1,
        }
      };
    }
    zloginfo(`[Service]Send invitation invitees: ${invitees}`);
    zloginfo(`[Service]Send invitation config, timeout: ${timeout}, extendedData: ${config.extendedData}`);
    zloginfo(`[Service]Send invitation config, pushConfig: ${config.pushConfig ? JSON.stringify(config.pushConfig) : ''}`);
    
    return ZegoSignalingPluginCore.getInstance().invite(invitees, config);
  }

  cancelInvitation(invitees: string[], data?: string, notificationConfig?: any) {
    invitees = invitees.map((invitee) => invitee);
    if (!invitees.length) {
      zlogerror('[Service]Cancel invitees is empty.');
      return Promise.reject(new ZegoPluginResult());
    }
    const config = { extendedData: data } as ZIMCallCancelConfig;
    if (ZegoUIKitCorePlugin.getZPNsPlugin()) {
      config.pushConfig = {
        title: notificationConfig && notificationConfig.title,
        content: notificationConfig && notificationConfig.message,
        resourcesID: notificationConfig && notificationConfig.resourceID,
        payload: data
      };
    }
    const callID = ZegoSignalingPluginCore.getInstance().getCallIDByUserID(
      ZegoSignalingPluginCore.getInstance().getLocalUser().userID
    );
    zloginfo(
      `[Service]Cancel invitation: callID: ${callID}, invitees: ${invitees}, data: ${data}.`
    );
    return ZegoSignalingPluginCore.getInstance().cancel(
      invitees,
      callID,
      config
    );
  }

  refuseInvitation(inviterID: string, data?: string) {
    let callID;
    // Parse data and adapt automatic rejection
    if (data) {
      const dataObj = JSON.parse(data);
      callID = dataObj.callID;
    } else {
      callID =
        ZegoSignalingPluginCore.getInstance().getCallIDByUserID(inviterID);
    }
    if (!callID) {
      zlogerror('[Service]Call id corresponding to the inviterID is empty.');
      return Promise.reject(new ZegoPluginResult());
    }
    const config = { extendedData: data };
    zloginfo(
      `[Service]Refuse invitation: callID: ${callID}, inviter id: ${inviterID}, data: ${data}.`
    );
    return ZegoSignalingPluginCore.getInstance().reject(callID, config);
  }

  acceptInvitation(inviterID: string, data?: string) {
    let callID = ZegoSignalingPluginCore.getInstance().getCallIDByUserID(inviterID);
    if (!callID) {
      if (data) {
        const dataObj = JSON.parse(data);
        callID = dataObj.callID;
      }
      
      if (!callID) {
        zlogerror('[Service]Call id corresponding to the inviterID is empty.', inviterID, data);
        return Promise.reject(new ZegoPluginResult('', 'Call id corresponding to the inviterID is empty.'));
      }
    }

    const config = { extendedData: data };
    zloginfo(
      `[Service]Accept invitation: callID: ${callID}, inviter id: ${inviterID}, data: ${data}.`
    );
    return ZegoSignalingPluginCore.getInstance().accept(callID, config);
  }

  queryCallList(count: number, nextFlag?: number) {
    const config = { count: count, nextFlag: nextFlag}
    return ZegoSignalingPluginCore.getInstance().queryCallList(config);
  }

  renewToken(token: string) {
    return ZegoSignalingPluginCore.getInstance().renewToken(token);
  }

  onConnectionStateChanged(callbackID: string, callback: (notifyData: { state: ZIMConnectionState }) => void) {
    ZegoSignalingPluginCore.getInstance().onConnectionStateChanged(
      callbackID,
      callback
    );
  }
  onCallInvitationReceived(callbackID: string, callback: (notifyData: {
    callID: string;
    type: number;
    inviter: { name: string; id: string; };
    data: string;
  }) => void) {
    ZegoSignalingPluginCore.getInstance().onCallInvitationReceived(
      callbackID,
      callback
    );
  }
  onCallInvitationTimeout(callbackID: string, callback: (notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) => void) {
    ZegoSignalingPluginCore.getInstance().onCallInvitationTimeout(
      callbackID,
      callback
    );
  }
  onCallInviteesAnsweredTimeout(callbackID: string, callback: (notifyData: {
    callID: string;
    invitees: { id: string; name: string; }[];
    data: string;
  }) => void) {
    ZegoSignalingPluginCore.getInstance().onCallInviteesAnsweredTimeout(
      callbackID,
      callback
    );
  }
  onCallInvitationAccepted(callbackID: string, callback: (notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) => void) {
    ZegoSignalingPluginCore.getInstance().onCallInvitationAccepted(
      callbackID,
      callback
    );
  }
  onCallInvitationRejected(callbackID: string, callback: (notifyData: {
    callID: string;
    invitee: { id: string; name: string; };
    data: string;
  }) => void) {
    ZegoSignalingPluginCore.getInstance().onCallInvitationRejected(
      callbackID,
      callback
    );
  }
  onCallInvitationCancelled(callbackID: string, callback: (notifyData: {
    callID: string;
    inviter: { id: string; name: string; };
    data: string;
  }) => void) {
    ZegoSignalingPluginCore.getInstance().onCallInvitationCancelled(
      callbackID,
      callback
    );
  }
  onRequireNewToken(callbackID: string, callback: () => string) {
    ZegoSignalingPluginCore.getInstance().onRequireNewToken(callbackID, callback);
  }
  onLoginSuccess(callbackID: string, callback: () => void) {
    ZegoSignalingPluginCore.getInstance().onLoginSuccess(callbackID, callback);
  }
}
