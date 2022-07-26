import React, { useState, useEffect } from "react";
import { Image, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoMicStatusIcon(props) {
    const { userID, iconMicOn, iconMicOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconMicOn ? iconMicOn : require("../../core/resources/white_icon_video_mic_on.png");
        const pathOff = iconMicOff ? iconMicOff : require("../../core/resources/white_icon_video_mic_off.png");
        return isOn ? pathOn : pathOff;
    }
    useEffect(() => {
        ZegoUIKitInternal.onMicDeviceOn('zego_components_toggle_mic_icon', (id, on) => {
            if (id == userID) {
                setIsOn(on);
            }
        });
    }, []);

    // TODO make style layout
    return (<View>
        <Image source={getImageSourceByPath()} />
    </View>)
}