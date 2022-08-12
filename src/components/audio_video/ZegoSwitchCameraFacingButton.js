import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoSwitchCameraFacingButton(props) {
    const { iconFrontFacingCamera, iconBackFacingCamera, useFrontFacingCamera = true, onPress } = props;
    const [isFront, setIsFront] = useState(useFrontFacingCamera);
    const getImageSourceByPath = () => {
        const pathFront = iconFrontFacingCamera ? iconFrontFacingCamera : require("../internal/resources/white_button_flip_camera.png");
        const pathBack = iconBackFacingCamera ? iconFrontFacingCamera : require("../internal/resources/white_button_flip_camera.png");
        return isFront ? pathFront : pathBack
    }
    const onButtonPress = () => {
        ZegoUIKitInternal.useFrontFacingCamera(!isFront);
        setIsFront(!isFront);
        if (typeof onPress == 'function') {
            onPress();
        }
    }

    useEffect(() => {
        const callbackID = 'ZegoSwitchCameraFacingButton' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            ZegoUIKitInternal.useFrontFacingCamera(useFrontFacingCamera);
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
        }
    }, []);

    return (<View>
        <TouchableOpacity
            onPress={onButtonPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}