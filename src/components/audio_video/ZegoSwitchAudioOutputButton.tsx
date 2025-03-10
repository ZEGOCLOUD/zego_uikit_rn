import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoSwitchAudioOutputButton(props: any) {
    // ZegoAudioRouteSpeaker=(0) ZegoAudioRouteHeadphone=(1) ZegoAudioRouteBluetooth=(2) ZegoAudioRouteReceiver=(3) ZegoAudioRouteExternalUSB=(4) ZegoAudioRouteAirPlay=(5)
    const { 
      iconSpeaker, 
      iconEarpiece, 
      iconBluetooth, 
      useSpeaker = false, 
      width = 48, 
      height = 48,
      iconBuilder,
    } = props;
    const [currentDevice, setCurrentDevice] = useState(0);// Default to speaker
    const [enable, setEnable] = useState(true);
    const getImageSourceByPath = () => {
        var path = iconEarpiece ? iconEarpiece : require("../internal/resources/white_button_speaker_off.png");
        if (currentDevice == 0) {
            path = iconSpeaker ? iconSpeaker : require("../internal/resources/white_button_speaker_on.png");
        } else if (currentDevice == 2) {
            path = iconBluetooth ? iconBluetooth : require("../internal/resources/white_button_bluetooth_off.png");
        }
        return path;
    }
    const onPress = () => {
        if (enable) {
            var usingSpeaker = currentDevice == 0;
            ZegoUIKitInternal.setAudioOutputToSpeaker(!usingSpeaker);
        }
    }
    const updateDeviceType = (type: number) => {
        setCurrentDevice(type);
        setEnable(type == 0 || type == 3);
    }
    useEffect(() => {
        setCurrentDevice(ZegoUIKitInternal.audioOutputDeviceType());
    });
    useEffect(() => {
        const callbackID = 'ZegoSwitchAudioOutputButton' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onAudioOutputDeviceTypeChange(callbackID, (type: number) => {
            updateDeviceType(type);
        });
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            ZegoUIKitInternal.setAudioOutputToSpeaker(useSpeaker);
            updateDeviceType(ZegoUIKitInternal.audioOutputDeviceType());
        });
        return () => {
            ZegoUIKitInternal.onAudioOutputDeviceTypeChange(callbackID);
            ZegoUIKitInternal.onSDKConnected(callbackID);
        }
    }, []);

    return (<TouchableOpacity
        style={{ width: width, height: height, justifyContent: 'center' }}
        disabled={!enable} // Only speaker can toggle enable
        onPress={onPress}>
        {iconBuilder
        ? iconBuilder(currentDevice)
        : <Image resizeMode='contain' source={getImageSourceByPath()} style={{ width: "100%", height: "100%" }} />}
    </TouchableOpacity>)
}