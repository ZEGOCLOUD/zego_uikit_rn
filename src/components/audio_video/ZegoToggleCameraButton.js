import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";
import { zloginfo } from "../../utils/logger";

export default function ZegoToggleCameraButton(props) {
    const { userID, iconCameraOn, iconCameraOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : require("../../core/resources/white_button_camera_on.png");
        const pathOff = iconCameraOff ? iconCameraOff : require("../../core/resources/white_button_camera_off.png");
        return isOn ? pathOn : pathOff;
    }
    const onPress = () => {
        ZegoUIKitInternal.turnCameraDeviceOn(userID, !isOn);
    }
    useEffect(() => {
        ZegoUIKitInternal.onCameraDeviceOn('zego_components_toggle_camera_button',(id, on) => {
            if (id == userID) {
                setIsOn(on);
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