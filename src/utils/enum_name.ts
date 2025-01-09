import { ZegoUpdateType } from "zego-express-engine-reactnative";
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
