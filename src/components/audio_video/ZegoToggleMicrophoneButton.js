import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoToggleMicrophoneButton(props) {
    const { userID, iconMicOn, iconMicOff, isOn } = props;
    const [isCurrentOn, setIsCurrentOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconMicOn ? iconMicOn : require("../../core/resources/white_button_mic_on.png");
        const pathOff = iconMicOff ? iconMicOff : require("../../core/resources/white_button_mic_off.png");
        return isCurrentOn ? pathOn : pathOff;
    }
    const onPress = () => {
        ZegoUIKitInternal.turnMicDeviceOn(userID, !isCurrentOn);
    }
    ZegoUIKitInternal.onSDKConnected('ZegoToggleMicButton', () => {
        ZegoUIKitInternal.turnMicDeviceOn(userID, isOn);
        setIsCurrentOn(ZegoUIKitInternal.isMicDeviceOn(userID))
    });
    ZegoUIKitInternal.onMicDeviceOn('ZegoToggleMicButton', (id, on) => {
        if (userID === undefined || userID === '') { // local user
            if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                setIsCurrentOn(on);
            }
        }
        else if (id == userID) {
            setIsCurrentOn(on);
        }
    });

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            // style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}