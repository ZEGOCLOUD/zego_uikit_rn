import ZegoUIKitCorePlugin from '../../components/internal/ZegoUIKitCorePlugin';
import ZegoUIKitPluginType from '../../components/internal/ZegoUIKitPluginType';

const ZegoUIKitSignalingPlugin = ZegoUIKitCorePlugin.getPlugin(
  ZegoUIKitPluginType.signaling
);
const ZegoUIKitInvitationService = {
  init: (appID, appSign) => {
    ZegoUIKitSignalingPlugin.getInstance().invoke('init', { appID, appSign });
  },
  uninit: () => {
    ZegoUIKitSignalingPlugin.getInstance().invoke('uninit');
  },
  login: (userID, userName) => {
    return ZegoUIKitSignalingPlugin.getInstance().invoke('login', {
      userID,
      userName,
    });
  },
  logout: () => {
    return ZegoUIKitSignalingPlugin.getInstance().invoke('logout');
  },
  sendInvitation: (invitees, timeout, type, data) => {
    return ZegoUIKitSignalingPlugin.getInstance().invoke('sendInvitation', {
      invitees,
      timeout,
      type,
      data,
    });
  },
  cancelInvitation: (invitees, data) => {
    return ZegoUIKitSignalingPlugin.getInstance().invoke('cancelInvitation', {
      invitees,
      data,
    });
  },
  refuseInvitation: (inviterID, data) => {
    return ZegoUIKitSignalingPlugin.getInstance().invoke('refuseInvitation', {
      inviterID,
      data,
    });
  },
  acceptInvitation: (inviterID, data) => {
    return ZegoUIKitSignalingPlugin.getInstance().invoke('acceptInvitation', {
      inviterID,
      data,
    });
  },
  onInvitationReceived: (callbackID, callback) => {
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationReceived',
      callbackID,
      callback
    );
  },
  onInvitationTimeout: (callbackID, callback) => {
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationTimeout',
      callbackID,
      callback
    );
  },
  onInvitationResponseTimeout: (callbackID, callback) => {
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationResponseTimeout',
      callbackID,
      callback
    );
  },
  onInvitationAccepted: (callbackID, callback) => {
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationAccepted',
      callbackID,
      callback
    );
  },
  onInvitationRefused: (callbackID, callback) => {
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationRefused',
      callbackID,
      callback
    );
  },
  onInvitationCanceled: (callbackID, callback) => {
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationCanceled',
      callbackID,
      callback
    );
  },
};

export default ZegoUIKitInvitationService;
