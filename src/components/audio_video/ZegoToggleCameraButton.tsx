import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoToggleCameraButton(props: any) {
    const { 
      userID, 
      iconCameraOn, 
      iconCameraOff, 
      isOn, 
      onPress, 
      width = 48, 
      height = 48,
      iconBuilder,
    } = props;
    
    const [isCurrentOn, setIsCurrentOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : require("../internal/resources/white_button_camera_on.png");
        const pathOff = iconCameraOff ? iconCameraOff : require("../internal/resources/white_button_camera_off.png");
        return isCurrentOn ? pathOn : pathOff;
    }
    const onButtonPress = () => {
        ZegoUIKitInternal.turnCameraDeviceOn(userID, !isCurrentOn);
        if (typeof onPress == 'function') {
            onPress();
        }
    }

    useEffect(() => {
        setIsCurrentOn(ZegoUIKitInternal.isCameraDeviceOn(userID));
    });
    useEffect(() => {
        const callbackID = 'ZegoToggleCameraButton' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onCameraDeviceOn(callbackID, (id: string, on: boolean) => {
            if (userID === undefined || userID === '') { // local user
                if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                    setIsCurrentOn(on);
                }
            }
            else if (id == userID) {
                setIsCurrentOn(on);
            }
        });
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            ZegoUIKitInternal.turnCameraDeviceOn(userID, isOn);
            setIsCurrentOn(ZegoUIKitInternal.isCameraDeviceOn(userID))
        });
        return () => {
            ZegoUIKitInternal.onCameraDeviceOn(callbackID);
            ZegoUIKitInternal.onSDKConnected(callbackID);
        }
    }, []);

    return (
      <TouchableOpacity
        style={{ width: width, height: height, justifyContent: 'center' }}
        onPress={onButtonPress}>
        {iconBuilder
        ? iconBuilder(isCurrentOn)
        : <Image resizeMode='contain' source={getImageSourceByPath()} style={{ width: "100%", height: "100%" }} />}
      </TouchableOpacity>
    )
}