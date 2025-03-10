import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoToggleMicrophoneButton(props: any) {
    const { 
      userID, 
      iconMicOn, 
      iconMicOff, 
      isOn, 
      onPress, 
      width = 48, 
      height = 48,
      iconBuilder,
    } = props;
    const [isCurrentOn, setIsCurrentOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconMicOn ? iconMicOn : require("../internal/resources/white_button_mic_on.png");
        const pathOff = iconMicOff ? iconMicOff : require("../internal/resources/white_button_mic_off.png");
        return isCurrentOn ? pathOn : pathOff;
    }
    const onButtonPress = () => {
        ZegoUIKitInternal.turnMicDeviceOn(userID, !isCurrentOn);
        if (typeof onPress == 'function') {
            onPress();
        }
    }


    useEffect(() => {
        setIsCurrentOn(ZegoUIKitInternal.isMicDeviceOn(userID));
    });
    useEffect(() => {
        const callbackID = 'ZegoToggleMicrophoneButton' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            ZegoUIKitInternal.turnMicDeviceOn(userID, isOn);
            setIsCurrentOn(ZegoUIKitInternal.isMicDeviceOn(userID))
        });
        ZegoUIKitInternal.onMicDeviceOn(callbackID, (id: string, on: boolean) => {
            if (userID === undefined || userID === '') { // local user
                if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                    setIsCurrentOn(on);
                }
            }
            else if (id == userID) {
                setIsCurrentOn(on);
            }
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onMicDeviceOn(callbackID);
        }
    }, [])
    return (<TouchableOpacity
        style={{ width: width, height: height, justifyContent: 'center' }}
        onPress={onButtonPress}>
        {iconBuilder
          ? iconBuilder(isCurrentOn)
          : <Image resizeMode='contain' source={getImageSourceByPath()} style={{ width: "100%", height: "100%" }} />
        }
    </TouchableOpacity>)
}