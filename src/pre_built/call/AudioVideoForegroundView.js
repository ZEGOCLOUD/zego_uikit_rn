import React from "react";
import {View, Text} from "react-native"

export default function AudioVideoForegroundView(props) {
    const { userInfo } = props;
    const { userName = '' } = userInfo;
    return (
        <View style={styles.defaultMaskContainer}>
            <View style={styles.defaultMaskNameLabelContainer}>
                <Text style={styles.defaultMaskNameLabel}>{userName}</Text>
            </View>
        </View>
    );
}
