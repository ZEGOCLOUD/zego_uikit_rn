import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";
import { zloginfo } from "../../utils/logger";

export default function ZegoToggleCameraButton(props) {
    const { userID, iconCameraOn, iconCameraOff, isOn, onPress } = props;
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
        ZegoUIKitInternal.onCameraDeviceOn(callbackID, (id, on) => {
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

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            // style={styles.cameraCon}
            onPress={onButtonPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}