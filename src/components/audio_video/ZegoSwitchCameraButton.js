import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoSwitchCameraButton(props) {
    // TODO useFrontFacingCamera may cause problems when create a lot of times during connected
    const { iconFrontFacingCamera, iconBackFacingCamera, useFrontFacingCamera = true, onPress } = props;
    const [isFront, setIsFront] = useState(ZegoUIKitInternal.isUsingFrontFacingCamera());
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
        const callbackID = 'ZegoSwitchCameraButton' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            ZegoUIKitInternal.useFrontFacingCamera(useFrontFacingCamera);
            setIsFront(useFrontFacingCamera);
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