import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoQuitButton(props) {
    const { iconQuit, onQuitConfirming } = props;
    const onPress = () => {
        if (onQuitConfirming instanceof Promise) {
            onQuitConfirming().then((accept) => {
                if (accept) {
                    ZegoUIKitInternal.leaveRoom();
                }
            });
        } else {
            ZegoUIKitInternal.leaveRoom();
        }
    }

    return (<View>
        <TouchableOpacity
            onPress={onPress}>
            <Image source={iconQuit ? iconQuit : require("../../core/resources/white_button_hang_up.png")} />
        </TouchableOpacity>
    </View>)
}