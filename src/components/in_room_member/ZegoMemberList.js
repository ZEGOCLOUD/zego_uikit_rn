import React, { useEffect, useState } from "react";
import { View, ScrollView, FlatList, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import ZegoUIKitInternal from '../internal/ZegoUIKitInternal'
import ZegoMicrophoneStateIcon from '../audio_video/ZegoMicrophoneStateIcon'
import ZegoCameraStateIcon from '../audio_video/ZegoCameraStateIcon';
import Delegate from "react-delegate-component";

export default function ZegoMemberList(props) {
    const {
        showMicroPhoneState,
        showCameraState,
        itemBuilder,
    } = props;
    // let mockList = [
    //     {
    //       userID: 'bd7acbea',
    //       userName: 'First Item',
    //     },
    //     {
    //       userID: '3ac68afc',
    //       userName: 'Second Item',
    //     },
    //     {
    //       userID: '58694a0f',
    //       userName: 'Third Item',
    //     },
    //     {
    //         userID: '3ac68afa',
    //         userName: 'Four Item',
    //     },
    //     {
    //         userID: '58694a0b',
    //         userName: 'Five Item',
    //     },
    //     {
    //         userID: '3ac68af1',
    //         userName: 'Six Item',
    //     },
    //     {
    //         userID: '58694a0d',
    //         userName: 'Seven Item',
    //     },
    // ];
    const [memberList, setMemberList] = useState([]);

    const refreshMemberList = () => {
        // Update list like this will cause rerender
        setMemberList((arr) => [...ZegoUIKitInternal.getAllUsers()]);
    };

    useEffect(() => {
        refreshMemberList();
    }, []);

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

    const iconMicView = item => !itemBuilder && showMicroPhoneState ? <View style={styles.icon}>
        <ZegoMicrophoneStateIcon 
            iconMicrophoneOn={require("../internal/resources/gray_icon_video_mic_on.png")}
            iconMicrophoneOff={require("../internal/resources/gray_icon_video_mic_off.png")}
            iconMicrophoneSpeaking={require("../internal/resources/gray_icon_video_mic_speaking.png")} 
            userID={item.userID}
        /></View> : <View />;
    const iconCameraView = item => !itemBuilder && showCameraState ? <View style={styles.icon}>
        <ZegoCameraStateIcon
            iconCameraOn={require("../internal/resources/gray_icon_video_camera_on.png")}
            iconCameraOff={require("../internal/resources/gray_icon_video_camera_off.png")}
            userID={item.userID}
        /></View> : <View />;
    const itemBuilderView = item => itemBuilder ? <Delegate
        style={styles.icon}
        to={itemBuilder}
        props={{ userInfo: item }} /> : <View />

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.nameLabel}>{getShotName(item.userName)}</Text>
                </View>
                <Text style={styles.name}>{item.userName + (item.userID == localUserID ? ' (You)' : '')}</Text>
            </View>
            <View style={styles.itemRight}>
                {itemBuilderView(item)}
                {iconMicView(item)}
                {iconCameraView(item)}
            </View>
        </View>
    );
    const [localUserID, setLocalUserID] = useState('');

    useEffect(() => {
        const callbackID = 'ZegoMemberList' + String(Math.floor(Math.random() * 10000));
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
            refreshMemberList();
        });
    }, []);

    return (<FlatList
        data={memberList}
        renderItem={renderItem}
        keyExtractor={item => item.userID}
    />);
}

const styles = StyleSheet.create({
    item: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        backgroundColor: '#DBDDE3',
        borderRadius: 1000,
        marginRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameLabel: {
        flex: 1,
        textAlign: 'center',
        color: '#222222',
        fontSize: 20,
    },
    name: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
});