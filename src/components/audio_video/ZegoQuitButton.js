import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoQuitButton(props) {
    const { iconQuit, onPreQuit, onPostQuit } = props;
    const onPress = () => {
        if (onPreQuit instanceof Promise) {
            onPreQuit().then((accept) => {
                if (accept) {
                    ZegoUIKitInternal.leaveRoom();
                    if (typeof onPostQuit == 'function') {
                        onPostQuit();
                    }
                }
            });
        } else {
            ZegoUIKitInternal.leaveRoom();
            if (typeof onPostQuit == 'function') {
                onPostQuit();
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