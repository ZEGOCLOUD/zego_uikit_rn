import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from 'react-native'
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import ZegoAudioVideoViewMore from "../../audio_video/ZegoAudioVideoView/MoreFrame";

export default function GridLayout(props) {
    const { config = {}, foregroundBuilder, audioVideoConfig = {} } = props;
    const {
        addBorderRadiusAndSpacingBetweenView = true, // Whether to display rounded corners and spacing between Views
        ownViewBackgroundColor = '',
        othersViewBackgroundColor = '',
        ownViewBackgroundImage = '',
        othersViewBackgroundImage = '',
    } = config;
    const {
        useVideoViewAspectFill = false,
        showSoundWavesInAudioMode = true,
    } = audioVideoConfig;

    const [localUserID, setLocalUserID] = useState('');
    const [userList, setUserList] = useState([]);
    const [moreUserList, setMoreUserList] = useState([]);

    useEffect(() => {
        const callbackID = 'GridLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
        });
        ZegoUIKitInternal.onRoomStateChanged(callbackID, (reason, errorCode, extendedData) => {
            if (reason == 1 || reason == 4) {
                setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
            } else if (reason == 2 || reason == 5 || reason == 6 || reason == 7) {
                // ZegoRoomStateChangedReasonLoginFailed
                // ZegoRoomStateChangedReasonReconnectFailed
                // ZegoRoomStateChangedReasonKickOut
                // ZegoRoomStateChangedReasonLogout
                // ZegoRoomStateChangedReasonLogoutFailed
                setLocalUserID('');
            }
        })
        ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID, (userList) => {
            // console.warn('>>>>>>>>>>> onUserCountOrPropertyChanged', userList)
            // Put yourself first
            const index = userList.findIndex((user => user.userID == localUserID));
            index !== -1 && (userList = userList.splice(index).concat(userList));
            setUserList(userList.slice(0, 7));
            setMoreUserList(userList.slice(7));
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onRoomStateChanged(callbackID);
            ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID);
        }
    }, []);

    const getAvViewStyle = () => {
        const len = userList.length;
        let avViewSizeStyle;
        switch (len) {
            case 1:
                avViewSizeStyle = styles.avViewSize1;
                break;
            case 2:
                avViewSizeStyle = styles.avViewSize2;
                break;
            case 3:
            case 4:
                avViewSizeStyle = styles.avViewSize4;
                break;
            case 5:
            case 6:
                avViewSizeStyle = styles.avViewSize6;
                break;
            case 7:
            case 8:
                avViewSizeStyle = styles.avViewSize8;
                break;
            default:
                avViewSizeStyle = styles.avViewSizeMore;
                break;
        }
        return avViewSizeStyle;
    }

    const isAvViewPadding = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.avViewPadding : null;
    const isAvViewBorder = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.avViewBorder : null;

    return (<View style={[styles.container, isAvViewPadding]}>
        {
            userList.map((user, index) => <View key={user.userID} style={[
                styles.avViewCon,
                getAvViewStyle(),
                isAvViewPadding
            ]}>
                <View style={[styles.avViewSubCon, isAvViewBorder]}>
                    <ZegoAudioVideoView
                        userID={user.userID}
                        audioViewBackgroudColor={user.userID == localUserID ? ownViewBackgroundColor : othersViewBackgroundColor}
                        audioViewBackgroudImage={user.userID == localUserID ? ownViewBackgroundImage : othersViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                    />
                </View>
            </View>)
        }
        {
            moreUserList.length <=1 ? moreUserList.map((user, index) => <View key={user.userID} style={[
                styles.avViewCon,
                getAvViewStyle(),
                isAvViewPadding
            ]}>
                <View style={[styles.avViewSubCon, isAvViewBorder]}>
                    <ZegoAudioVideoView
                        userID={user.userID}
                        audioViewBackgroudColor={user.userID == localUserID ? ownViewBackgroundColor : othersViewBackgroundColor}
                        audioViewBackgroudImage={user.userID == localUserID ? ownViewBackgroundImage : othersViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                    />
                </View>
            </View>) : <View style={[styles.avViewCon, getAvViewStyle(), isAvViewPadding]}>
                <View style={[styles.avViewSubCon, isAvViewBorder]}>
                    <ZegoAudioVideoViewMore 
                        userList={moreUserList}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        audioViewBackgroudColor={othersViewBackgroundColor}
                        audioViewBackgroudImage={othersViewBackgroundImage}
                    />
                </View>
            </View>
        }
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#171821',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    avViewCon: {
        zIndex: 1,
    },
    avViewSubCon: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#D8D8D8',
    },
    avViewBorder: {
        borderRadius: 12,
    },
    avViewPadding: {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    avViewSize1: {
        width: '100%',
        height: '100%',
    },
    avViewSize2: {
        width: '100%',
        height: '50%',
    },
    avViewSize4: {
        width: '50%',
        height: '50%',
    },
    avViewSize6: {
        width: '50%',
        height: '33.33%',
    },
    avViewSize8: {
        width: '50%',
        height: '25%',
    },
    avViewSizeMore: {
        width: '50%',
        height: '25%',
    },
});