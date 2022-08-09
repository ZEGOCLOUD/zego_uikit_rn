import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoSwitchCameraFacingButton(props) {
    const { iconFrontFacingCamera, iconBackFacingCamera } = props;
    const [isFront, setIsFront] = useState(true);// Default front
    const getImageSourceByPath = () => {
        const pathFront = iconFrontFacingCamera ? iconFrontFacingCamera : require("../internal/resources/white_button_flip_camera.png");
        const pathBack = iconBackFacingCamera ? iconFrontFacingCamera : require("../internal/resources/white_button_flip_camera.png");
        return isFront ? pathFront : pathBack
    }
    const onPress = () => {
        ZegoUIKitInternal.useFrontFacingCamera(!isFront);
        setIsFront(!isFront);
    }

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            // style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}