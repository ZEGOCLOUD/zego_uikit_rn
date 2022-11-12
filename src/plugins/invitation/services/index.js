import ZegoUIKitCorePlugin from '../../../components/internal/ZegoUIKitCorePlugin';
import ZegoUIKitPluginType from '../../../components/internal/ZegoUIKitPluginType';
import { zlogerror } from '../../../utils/logger';

var ZegoUIKitSignalingPlugin;
const _localUser = {};
const ZegoUIKitInvitationService = {
  getVersion: () => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getVersion();
  },
  init: (appID, appSign) => {
    ZegoUIKitSignalingPlugin = ZegoUIKitCorePlugin.getPlugin(
      ZegoUIKitPluginType.signaling
    );
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().invoke('init', { appID, appSign });
  },
  uninit: () => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().invoke('uninit');
  },
  login: (userID, userName) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    _localUser.userID = userID;
    _localUser.userName = userName;
    return ZegoUIKitSignalingPlugin.getInstance().invoke('login', {
      userID,
      userName,
    });
  },
  logout: () => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('logout');
  },
  sendInvitation: (invitees, timeout, type, data) => {
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
    });
  },
  cancelInvitation: (invitees, data) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('cancelInvitation', {
      invitees,
      data,
    });
  },
  refuseInvitation: (inviterID, data) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('refuseInvitation', {
      inviterID,
      data,
    });
  },
  acceptInvitation: (inviterID, data) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }
    return ZegoUIKitSignalingPlugin.getInstance().invoke('acceptInvitation', {
      inviterID,
      data,
    });
  },
  onInvitationReceived: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }
    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler(
      'invitationReceived',
      callbackID,
      callback
    );
  },
  onInvitationTimeout: (callbackID, callback) => {
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
  onInvitationResponseTimeout: (callbackID, callback) => {
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
  onInvitationAccepted: (callbackID, callback) => {
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
  onInvitationRefused: (callbackID, callback) => {
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
  onInvitationCanceled: (callbackID, callback) => {
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
};

export default ZegoUIKitInvitationService;
