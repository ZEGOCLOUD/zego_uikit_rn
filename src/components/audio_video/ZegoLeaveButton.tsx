import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

import { zloginfo } from "../../utils/logger";
import ZegoUIKitInternal from "../internal/ZegoUIKitInternal";

export default function ZegoLeaveButton(props: any) {
    const { 
      iconLeave, 
      onLeaveConfirmation, 
      onPressed, 
      width = 48, 
      height = 48,
      iconBuilder,
    } = props;
    const onPress = () => {
        zloginfo('[ZegoLeaveButton][onPress]');
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

    return (
        <TouchableOpacity
            style={{ width: width, height: height, justifyContent: 'center' }}
            onPress={onPress}
        >
          {iconBuilder 
          ? iconBuilder()
          : <Image
                resizeMode='contain'
                source={iconLeave ? iconLeave : require("../internal/resources/white_button_hang_up.png")}
                style={{ width: "100%", height: "100%" }}
            />}
        </TouchableOpacity>)
}