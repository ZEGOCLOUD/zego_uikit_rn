import React, { useState, useEffect } from "react";
import { Image, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoMicrophoneStatusIcon(props) {
    const { userID, iconMicrophoneOn, iconMicrophoneOff } = props;
    const [isOn, setIsOn] = useState(true);
    const getImageSourceByPath = () => {
        const pathOn = iconMicrophoneOn ? iconMicrophoneOn : require("../internal/resources/white_icon_video_mic_on.png");
        const pathOff = iconMicrophoneOff ? iconMicrophoneOff : require("../internal/resources/white_icon_video_mic_off.png");
        return isOn ? pathOn : pathOff;
    }

    useEffect(() => {
        const callbackID = 'ZegoMicrophoneStatusIcon' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            setIsOn(ZegoUIKitInternal.isMicDeviceOn(userID))
        });
        ZegoUIKitInternal.onMicDeviceOn(callbackID, (id, on) => {
            if (userID === undefined || userID === '') { // local user
                if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                    setIsOn(on);
                }
            }
            else if (id == userID) {
                setIsOn(on);
            }
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onMicDeviceOn(callbackID);
        }
    }, []);
    return (<View>
        <Image source={getImageSourceByPath()} />
    </View>)
}