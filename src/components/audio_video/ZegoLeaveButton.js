import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoLeaveButton(props) {
    const { iconLeave, onLeaveConfirmation, onPressed } = props;
    const onPress = () => {
        if (typeof onLeaveConfirmation == 'function') {
            onLeaveConfirmation().then(() => {
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