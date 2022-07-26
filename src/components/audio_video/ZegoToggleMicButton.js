import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoToggleMicButton(props) {
    const { userID, iconMicOn, iconMicOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconMicOn ? iconMicOn : require("../../core/resources/white_button_mic_on.png");
        const pathOff = iconMicOff ? iconMicOff : require("../../core/resources/white_button_mic_off.png");
        return isOn ? pathOn : pathOff;
    }
    const onPress = () => {
        ZegoUIKitInternal.turnMicDeviceOn(userID, !isOn);
    }
    useEffect(() => {
        ZegoUIKitInternal.onMicDeviceOn((id, on) => {
            if (id == userID) {
                setIsOn(on);
            }
        });
    }, []);

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            // style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}