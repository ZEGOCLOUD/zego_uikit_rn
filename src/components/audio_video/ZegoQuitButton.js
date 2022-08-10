import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoQuitButton(props) {
    const { iconQuit, onLeaveConfirming, onPressed } = props;
    const onPress = () => {
        if (onLeaveConfirming instanceof Promise) {
            onLeaveConfirming().then((accept) => {
                if (accept) {
                    ZegoUIKitInternal.leaveRoom();
                    if (typeof onPressed == 'function') {
                        onPressed();
                    }
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
            <Image source={iconQuit ? iconQuit : require("../internal/resources/white_button_hang_up.png")} />
        </TouchableOpacity>
    </View>)
}