import { View, StyleSheet, Text, ImageBackground } from "react-native";
import React from 'react'

export default function MoreFrame(props: any) {
    const {
        roomID,
        userList,
        audioViewBackgroudColor,
        audioViewBackgroudImage,
        useVideoViewAspectFill = false,
    } = props;

    const getShortName = (name: string) => {
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
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, styles.avatar1]}>
                        <Text style={styles.nameLabel}>{getShortName(userList[0].userName)}</Text>
                    </View>
                    <View style={[styles.avatar, styles.avatar2]}>
                        <Text style={styles.nameLabel}>{getShortName(userList[1].userName)}</Text>
                    </View>
                </View>
                <Text style={styles.totalText}>{`${userList.length} others`}</Text>
            </ImageBackground>
            {/* Only pull the audio stream */}
        </View>
    );
}


const cstyle = (bgColor: string) => StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        position: 'absolute',
    },
})
const styles = StyleSheet.create({
    imgBackground: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 2,
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    avatar: {
        width: (129 / 375 * 100).toString() + '%',
        aspectRatio: 1,
        borderRadius: 1000,
        backgroundColor: '#DBDDE3',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        position: 'relative',
    },
    avatar1: {
        left: (10 / 60 * 100).toString() + '%',
    },
    avatar2: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#4A4B4D',
        right: (10 / 60 * 100).toString() + '%',
    },
    nameLabel: {
        color: '#222222',
        fontSize: 23,
    },
    totalText: {
        marginTop: 29.5,
        fontSize: 12,
        color: '#FFFFFF',
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 1,
    }
});