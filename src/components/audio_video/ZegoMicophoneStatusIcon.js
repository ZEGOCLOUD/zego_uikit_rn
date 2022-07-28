import React, { useState, useEffect } from "react";
import { Image, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoMicStatusIcon(props) {
    const { userID, iconMicrophoneOn, iconMicrophoneOff } = props;
    const [isOn, setIsOn] = useState(true);
    const getImageSourceByPath = () => {
        const pathOn = iconMicrophoneOn ? iconMicrophoneOn : require("../../core/resources/white_icon_video_mic_on.png");
        const pathOff = iconMicrophoneOff ? iconMicrophoneOff : require("../../core/resources/white_icon_video_mic_off.png");
        return isOn ? pathOn : pathOff;
    }
    ZegoUIKitInternal.onSDKConnected('ZegoMicStatusIcon', () => {
        setIsOn(ZegoUIKitInternal.isMicDeviceOn(userID))
    });
    ZegoUIKitInternal.onMicDeviceOn('ZegoMicStatusIcon', (id, on) => {
        if (userID === undefined || userID === '') { // local user
            if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                setIsOn(on);
            }
        }
        else if (id == userID) {
            setIsOn(on);
        }
    });

    // TODO make style layout
    return (<View>
        <Image source={getImageSourceByPath()} />
    </View>)
}