import { View, StyleSheet, Text, ImageBackground } from "react-native";
import React, { useEffect } from 'react'

export default function AudioFrame(props) {
    const {
        userInfo,
        showSoundWave,
        audioViewBackgroudColor,
        audioViewBackgroudImage
    } = props;

    const getShotName = (name) => {
        if (!name) {
            return '';
        }
        const nl = name.split(' ');
        var shotName = '';
        nl.forEach(part => {
            if (part !== '') {
                shotName += part.substring(0, 1);
            }
        });
        return shotName;
    }

    return (
        <View style={cstyle(audioViewBackgroudColor ? audioViewBackgroudColor : '#4A4B4D').container}>
            <ImageBackground
                source={audioViewBackgroudImage
                    ? { uri: audioViewBackgroudImage }
                    : null} resizeMode="cover"
                style={styles.imgBackground}
            >
                <View style={styles.avatar}>
                    <Text style={styles.nameLabel}>{getShotName(userInfo.userName)}</Text>
                </View>
            </ImageBackground>
        </View>
    );
}

const cstyle = (bgColor) => StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        justifyContent: 'center',
        backgroundColor: bgColor,
    },
})
const styles = StyleSheet.create({
    imgBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        justifyContent: 'center',
    },
    avatar: {
        flex: 1,
        width: (129 / 375 * 100).toString() + '%',
        aspectRatio: 1,
        borderRadius: 1000,
        backgroundColor: '#DBDDE3',
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    nameLabel: {
        flex: 1,
        position: 'absolute',
        color: '#222222',
        fontSize: 22,
    }
});