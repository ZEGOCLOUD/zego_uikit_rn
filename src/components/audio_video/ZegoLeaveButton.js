import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoQuitButton(props) {
    const { iconLeave, onLeaveConfirming, onPressed } = props;
    const onPress = () => {
        if (typeof onLeaveConfirming == 'function') {
            onLeaveConfirming().then(() => {
                ZegoUIKitInternal.leaveRoom();
                if (typeof onPressed == 'function') {
                    onPressed();
                }
            });
        } else {
            ZegoUIKitInternal.leaveRoom();
            if (typeof onPressed == 'function') {
                onPressed();
            }
        }
    }

    return (<View>
        <TouchableOpacity
            onPress={onPress}>
            <Image source={iconLeave ? iconLeave : require("../internal/resources/white_button_hang_up.png")} />
        </TouchableOpacity>
    </View>)
}