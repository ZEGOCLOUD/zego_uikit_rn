import React, { useState, useEffect } from "react";
import { Image, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoCameraStatusIcon(props) {
    const { userID, iconCameraOn, iconCameraOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : require("../internal/resources/white_icon_video_camera_on.png");
        const pathOff = iconCameraOff ? iconCameraOff : require("../internal/resources/white_icon_video_camera_off.png");
        return isOn ? pathOn : pathOff
    }
    useEffect(() => {
        const callbackID = 'ZegoCameraStatusIcon' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            setIsOn(ZegoUIKitInternal.isCameraDeviceOn(userID))
        });
        ZegoUIKitInternal.onCameraDeviceOn(callbackID, (id, on) => {
            if (userID === undefined || userID === '') { // local user
                if (id == ZegoUIKitInternal.getLocalUserInfo().userID) {
                    setIsOn(on);
                }
            }
            else if (id == userID) {
                setIsOn(on);
            }
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onCameraDeviceOn(callbackID);
        }
    }, []);

    return (<View>
        <Image source={getImageSourceByPath()} />
    </View>)
}