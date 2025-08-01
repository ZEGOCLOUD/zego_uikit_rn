import { ZegoRemoteDeviceState, ZegoUpdateType } from "zego-express-engine-reactnative";
import { ZIMConnectionEvent, ZIMConnectionState } from "zego-zim-react-native";

export const getZegoUpdateTypeName = (type: ZegoUpdateType) => {
    let name = 'unknown'
    if (type == ZegoUpdateType.Add) {
        name = 'Add'
    } else if (type == ZegoUpdateType.Delete) {
        name = 'Delete'
    }

    return `${name}(${type})`
}

export const getZegoRemoteDeviceStateName = (type: ZegoRemoteDeviceState) => {
    let name = 'Untranslated'
    if (type == ZegoRemoteDeviceState.Open) {
        name = 'Open'
    } else if (type == ZegoRemoteDeviceState.GenericError) {
        name = 'GenericError'
    } else if (type == ZegoRemoteDeviceState.InvalidID) {
        name = 'InvalidID'
    } else if (type == ZegoRemoteDeviceState.NoAuthorization) {
        name = 'NoAuthorization'
    } else if (type == ZegoRemoteDeviceState.ZeroFPS) {
        name = 'ZeroFPS'
    } else if (type == ZegoRemoteDeviceState.InUseByOther) {
        name = 'InUseByOther'
    } else if (type == ZegoRemoteDeviceState.SystemMediaServicesLost) {
        name = 'SystemMediaServicesLost'
    } else if (type == ZegoRemoteDeviceState.Disable) {
        name = 'Disable'
    } else if (type == ZegoRemoteDeviceState.Mute) {
        name = 'Mute'
    } else if (type == ZegoRemoteDeviceState.Interruption) {
        name = 'Interruption'
    } else if (type == ZegoRemoteDeviceState.InBackground) {
        name = 'InBackground'
    } else if (type == ZegoRemoteDeviceState.NotSupport) {
        name = 'NotSupport'
    }

    return `${name}(${type})`
}

export const getZimConnectionEventName = (event: ZIMConnectionEvent) => {
    let name = 'unknown'
    if (event == ZIMConnectionEvent.Success) {
        name = 'Success'
    } else if (event == ZIMConnectionEvent.ActiveLogin) {
        name = 'ActiveLogin'
    } else if (event == ZIMConnectionEvent.LoginTimeout) {
        name = 'LoginTimeout'
    } else if (event == ZIMConnectionEvent.LoginInterrupted) {
        name = 'LoginInterrupted'
    } else if (event == ZIMConnectionEvent.KickedOut) {
        name = 'KickedOut'
    }

    return `${name}(${event})`
};

export const getZimConnectionStateName = (state: ZIMConnectionState) => {
    let name = 'unknown'
    if (state == ZIMConnectionState.Disconnected) {
        name = 'Disconnected'
    } else if (state == ZIMConnectionState.Connecting) {
        name = 'Connecting'
    } else if (state == ZIMConnectionState.Connected) {
        name = 'Connected'
    } else if (state == ZIMConnectionState.Reconnecting) {
        name = 'Reconnecting'
    }

    return `${name}(${state})`
};
