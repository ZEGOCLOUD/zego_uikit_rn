import ZegoSignalingPluginCore from '../core';
import ZegoPluginResult from '../core/defines';
import { zlogerror, zloginfo } from '../utils/logger';
import type { CXAction, ZPNsRegisterMessage, ZPNsMessage } from 'zego-zpns-react-native';
import type { ZIMCallInviteConfig, ZIMCallCancelConfig, ZIMConnectionState } from 'zego-zim-react-native';
import { CXCallEndedReason } from '../defines';
import ZegoUIKitCorePlugin from '../../components/internal/ZegoUIKitCorePlugin';
import { Platform } from 'react-native';

export default class ZegoPluginInvitationService {
  static shared: ZegoPluginInvitationService;
  _androidOfflineDataHandler: (data: any) => void;
  _iOSOfflineDataHandler: (data: any, uuid: string) => void;
  _callKitAnswerCallHandler: (action: CXAction) => void;
  _callKitEndCallHandler: (action: CXAction) => void;

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
    ZegoUIKitCorePlugin.getZPNsPlugin().default.setBackgroundMessageHandler((message: ZPNsMessage) => {
      zloginfo('ZPNs setBackgroundMessageHandler: ', message)
      const dataObj = JSON.parse(message.extras.payload);
      dataObj.zim_call_id = message.extras.call_id;
      ZegoPluginInvitationService.getInstance().getAndroidOfflineDataHandler()(dataObj)
    })
  }
  setAndroidOfflineDataHandler(handler: (data: any) => void) {
    this._androidOfflineDataHandler = handler;
  }
  getAndroidOfflineDataHandler() {
    return this._androidOfflineDataHandler;
  }
  setIOSOfflineDataHandler(handler: (data: any, uuid: string) => void) {
    this._iOSOfflineDataHandler = handler;
  }
  onCallKitAnswerCall(handler: (action: CXAction) => void) {
    this._callKitAnswerCallHandler = handler;
  }
  onCallKitEndCall(handler: (action: CXAction) => void) {
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
  reportCallKitCallEnded(uuid: string, reason: number) {
    return ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().reportCallEnded(reason, uuid);
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
  }
  uninit() {
    ZegoSignalingPluginCore.getInstance().destroy();
  }
  login(userID: string, userName: string, token?: string) {
    return ZegoSignalingPluginCore.getInstance().login(
      {
        userID,
        userName,
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
      if (Platform.OS === 'ios') {
        const CXProviderConfiguration = {
          localizedName: appName ?? 'My app',
          iconTemplateImageName: "AppIcon",
        };
        ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.setInitConfiguration(CXProviderConfiguration);
        ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().applyNotificationPermission();
        
        const iOSEnvironment = isIOSDevelopmentEnvironment == null ? 2 : (isIOSDevelopmentEnvironment ? 1 : 0);
        console.log('#########registerPush, iOSEnvironment', iOSEnvironment);
        ZegoUIKitCorePlugin.getZPNsPlugin().default.setPushConfig({ 'appType': certificateIndex });
        ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().registerPush({ 
          enableIOSVoIP: true,
          iOSEnvironment: iOSEnvironment,
        });
      } else {
        ZegoUIKitCorePlugin.getZPNsPlugin().default.setPushConfig({ "enableFCMPush": true, "enableHWPush": false, "enableMiPush": false, "enableOppoPush": false, "enableVivoPush": false, "appType": certificateIndex });

        ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().registerPush({ enableIOSVoIP: true });
      }


      ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("registered", (message: ZPNsRegisterMessage) => {
        console.log("@@@@@@@@@@@@@@@@>>>>>>>>>>>>>>>############", message)
      });

      // ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("notificationArrived", (message) => {
      //   console.log("@@@@@@@@@@@@@@@@notificationArrived>>>>>>>>>>>>>>>############", getCallID(message))
      //   setZpnState("notificationArrived: " + getCallID(message))
      // })
      // ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("notificationClicked", (message) => {
      //   console.log("@@@@@@@@@@@@@@@@notificationClicked>>>>>>>>>>>>>>>############", getCallID(message))
      //   setZpnState("notificationClicked: " + getCallID(message))
      // })
      // ZegoUIKitCorePlugin.getZPNsPlugin().default.getInstance().on("throughMessageReceived", (message) => {
      //   console.log("@@@@@@@@@@@@@@@@throughMessageReceived>>>>>>>>>>>>>>>############", getCallID(message))
      //   setZpnState("throughMessageReceived: " + getCallID(message))
      // })

      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("didReceiveIncomingPush", (extras: Record<string, any>, uuid: string) => {
        console.log('#########didReceiveIncomingPush', extras, uuid);
        let { payload } = extras;
        let { call_id } = extras;
        const dataObj = payload ? JSON.parse(payload) : {};
        dataObj.zim_call_id = call_id;
        ZegoPluginInvitationService.getInstance().getIOSOfflineDataHandler()(dataObj, uuid);
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("providerDidReset", () => {
        console.log('#########providerDidReset');
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("providerDidBegin", () => {
        console.log('#########providerDidBegin');
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("didActivateAudioSession", () => {
        console.log('#########didActivateAudioSession');
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("didDeactivateAudioSession", () => {
        console.log('#########didDeactivateAudioSession');
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("timedOutPerformingAction", (action: CXAction) => {
        console.log('#########timedOutPerformingAction', action);
        action.fulfill();
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performStartCallAction", (action: CXAction) => {
        console.log('#########performStartCallAction', action);
        action.fulfill();
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performAnswerCallAction", (action: CXAction) => {
        console.log('#########performAnswerCallAction', action);
        ZegoPluginInvitationService.getInstance().getAnswerCallHandle()(action);
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performEndCallAction", (action: CXAction) => {
        console.log('#########performEndCallAction', action);
        ZegoPluginInvitationService.getInstance().getEndCallHandle()(action);
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performSetHeldCallAction", (action: CXAction) => {
        console.log('#########performSetHeldCallAction', action);
        action.fulfill();
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performSetMutedCallAction", (action: CXAction) => {
        console.log('#########performSetMutedCallAction', action);
        action.fulfill();
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performSetGroupCallAction", (action: CXAction) => {
        console.log('#########performSetGroupCallAction', action);
        action.fulfill();
      });
      ZegoUIKitCorePlugin.getZPNsPlugin().CallKit.getInstance().on("performPlayDTMFCallAction", (action: CXAction) => {
        console.log('#########performPlayDTMFCallAction', action);
        action.fulfill();
      });
    }
  }
  setAdvancedConfig(key: string, value: string) {
    ZegoSignalingPluginCore.getInstance().setAdvancedConfig(key, value);
  }

  sendInvitation(inviterName: string, invitees: string[], timeout: number, type: number, data?: string, notificationConfig?: any) {

    // invitees = invitees.map((invitee) => invitee);
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
    zloginfo(
      `[Service]Send invitation: invitees: ${invitees}, timeout: ${timeout}, type: ${type}, data: ${data}.`
    );
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
    const callID =
      ZegoSignalingPluginCore.getInstance().getCallIDByUserID(inviterID);
    if (!callID) {
      zloginfo('[Service]Call id corresponding to the inviterID is empty.', inviterID, data);
      return Promise.reject(new ZegoPluginResult());
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
    inviter: { name: string; id: string; };
    type: number;
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
}
