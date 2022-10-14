import { View, StyleSheet, Text, ImageBackground } from "react-native";
import React from 'react'
import VideoFrame from './VideoFrame'

export default function MoreFrame(props) {
    const {
        roomID,
        userList,
        audioViewBackgroudColor,
        audioViewBackgroudImage,
        useVideoViewAspectFill = false,
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
                <View style={styles.avatarCon}>
                    <View style={[styles.avatar, styles.avatar1]}>
                        <Text style={styles.nameLabel}>{getShotName(userList[0].userName)}</Text>
                    </View>
                    <View style={[styles.avatar, styles.avatar2]}>
                        <Text style={styles.nameLabel}>{getShotName(userList[1].userName)}</Text>
                    </View>
                </View>
                <Text style={styles.totalText}>{`${userList.length} others`}</Text>
            </ImageBackground>
            {/* Only pull the audio stream */}
            {
                userList.map(user => <VideoFrame
                    style={styles.videoContainer}
                    userID={user.userID}
                    roomID={roomID}
                    fillMode={useVideoViewAspectFill ? 1 : 0} // 1:AspectFill, 0:AspectFit
                    viewID={-1}
                ></VideoFrame>)
            }
        </View>
    );
}


const cstyle = (bgColor) => StyleSheet.create({
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
    avatarCon: {
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
        left: (20 / 120 * 100).toString() + '%',
    },
    avatar2: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#4A4B4D',
        right: (20 / 120 * 100).toString() + '%',
    },
    nameLabel: {
        color: '#222222',
        fontSize: 22,
    },
    totalText: {
        marginTop: 16,
        fontSize: 24,
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