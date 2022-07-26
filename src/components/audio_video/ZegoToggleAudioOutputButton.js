import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoToggleAudioOutputButton(props) {
    // ZegoAudioRouteSpeaker=(0) ZegoAudioRouteHeadphone=(1) ZegoAudioRouteBluetooth=(2) ZegoAudioRouteReceiver=(3) ZegoAudioRouteExternalUSB=(4) ZegoAudioRouteAirPlay=(5)
    const { iconSpeaker, iconEarpiece, iconBluetooth } = props;
    const [currentDevice, setCurrentDevice] = useState(0);// Default on
    const [isOn, setIsOn] = useState(true);
    const getImageSourceByPath = () => {
        const path = "";
        if (currentDevice == 0) {
            path = iconSpeaker ? iconSpeaker : require("../../core/resources/white_button_speaker_on.png");
        } else if (currentDevice == 2) {
            path = iconBluetooth ? iconBluetooth : require("../../core/resources/white_button_bluetooth_off.png");
        } else {
            path = iconEarpiece ? iconEarpiece : require("../../core/resources/white_button_speaker_off.png");
        }
        return path;
    }
    const onPress = () => {
        ZegoUIKitInternal.enableSpeaker(!isOn);
        setIsOn(!isOn);
    }
    useEffect(() => {
        ZegoUIKitInternal.onAudioOutputDeviceTypeChange('ZegoToggleAudioOutputButton', (type) => {
            setCurrentDevice(type);
        });
    }, []);

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            disabled={currentDevice == 0} // Only speaker can toggle enable
            // style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}