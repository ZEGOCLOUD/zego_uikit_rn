import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";
import { zloginfo } from "../../utils/logger";

export default function ZegoToggleCameraButton(props) {
    const { userID, iconCameraOn, iconCameraOff, isOn } = props;
    const [isCurrentOn, setIsCurrentOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : require("../internal/resources/white_button_camera_on.png");
        const pathOff = iconCameraOff ? iconCameraOff : require("../internal/resources/white_button_camera_off.png");
        return isCurrentOn ? pathOn : pathOff;
    }
    const onPress = () => {
        ZegoUIKitInternal.turnCameraDeviceOn(userID, !isCurrentOn);
    }
    ZegoUIKitInternal.onSDKConnected('ZegoToggleCameraButton', () => {
        ZegoUIKitInternal.turnCameraDeviceOn(userID, isOn);
        setIsCurrentOn(ZegoUIKitInternal.isCameraDeviceOn(userID))
    });
    useEffect(() => {
        ZegoUIKitInternal.onCameraDeviceOn('ZegoToggleCameraButton', (id, on) => {
            if (userID === undefined || userID === '') { // local user
                if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                    setIsCurrentOn(on);
                }
            }
            else if (id == userID) {
                setIsCurrentOn(on);
            }
        })
    }, []);

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            // style={styles.cameraCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}