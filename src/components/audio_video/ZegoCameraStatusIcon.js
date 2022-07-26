import React, { useState, useEffect } from "react";
import { Image, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoCameraStatusIcon(props) {
    const { userID, iconCameraOn, iconCameraOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : require("../../core/resources/white_icon_video_camera_on.png");
        const pathOff = iconCameraOff ? iconCameraOff : require("../../core/resources/white_icon_video_camera_off.png");
        return isOn ? pathOn : pathOff
    }

    useEffect(() => {
        ZegoUIKitInternal.onCameraDeviceOn('zego_components_toggle_camera_icon', (id, on) => {
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