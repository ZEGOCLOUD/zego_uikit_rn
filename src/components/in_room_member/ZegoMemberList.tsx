import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import ZegoUIKitInternal from '../internal/ZegoUIKitInternal';
import ZegoMicrophoneStateIcon from '../audio_video/ZegoMicrophoneStateIcon';
import ZegoCameraStateIcon from '../audio_video/ZegoCameraStateIcon';
import Delegate from 'react-delegate-component';
import { ZegoRoomStateChangedReason } from 'zego-express-engine-reactnative';
import { zloginfo, zlogwarning } from '../../utils/logger';

export default function ZegoMemberList(props: any) {
  const { 
    showMicrophoneState, 
    showCameraState, 
    itemBuilder, 
    sortUserList,
    avatarBuilder,
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
  const [localUserID, setLocalUserID] = useState('');
  const [memberList, setMemberList] = useState([]);

  const refreshMemberList = () => {
    zloginfo('############refreshMemberList')
    let memberList = ZegoUIKitInternal.getAllUsers();
    if (typeof sortUserList === 'function') {
      const temp = sortUserList(memberList) || memberList;
      setMemberList((arr) => [...temp]);
    } else {
      // Update list like this will cause rerender
      memberList.reverse();
      // Put yourself first
      const index = memberList.findIndex(
        (user) => user.userID == ZegoUIKitInternal.getLocalUserInfo().userID
      );
      index !== -1 &&
        (memberList = memberList.splice(index, 1).concat(memberList));
      setMemberList((arr) => [...memberList]);
    }
  };

  useEffect(() => {
    refreshMemberList();
  }, []);

  const getShortName = (name: string) => {
    if (!name) {
      return '';
    }
    const nl = name.split(' ');
    var shotName = '';
    nl.forEach((part) => {
      if (part !== '') {
        shotName += part.substring(0, 1);
      }
    });
    return shotName;
  };

  const iconMicView = (item: any) =>
    showMicrophoneState ? (
      <ZegoMicrophoneStateIcon
        iconMicrophoneOn={require('../internal/resources/gray_icon_video_mic_on.png')}
        iconMicrophoneOff={require('../internal/resources/gray_icon_video_mic_off.png')}
        iconMicrophoneSpeaking={require('../internal/resources/gray_icon_video_mic_speaking.png')}
        userID={item.userID}
      />
    ) : (
      <View />
    );
  const iconCameraView = (item: any) =>
    showCameraState ? (
      <ZegoCameraStateIcon
        iconCameraOn={require('../internal/resources/gray_icon_video_camera_on.png')}
        iconCameraOff={require('../internal/resources/gray_icon_video_camera_off.png')}
        userID={item.userID}
      />
    ) : (
      <View />
    );

  const roleDescription = (item: any) => {
    zloginfo('===============roleDescription==============', item);
    const localUserID = ZegoUIKitInternal.getLocalUserInfo().userID;
    const showMe = item.userID == localUserID ? 'You' : '';
    if (!showMe) {
      return '';
    } else {
      return `(${showMe})`;
    }
  };

  const renderItem = ({ item }: any) =>
    !itemBuilder ? (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <View style={styles.avatar}>
            { avatarBuilder ?       
            <Delegate
              to={avatarBuilder}
              props={{ userInfo: item }}
            /> :
            <Text style={styles.nameLabel}>{getShortName(item.userName)}</Text>}
          </View>
          <Text style={styles.name}>
            {item.userName + roleDescription(item)}
          </Text>
        </View>
        <View style={styles.itemRight}>
          {iconMicView(item)}
          {iconCameraView(item)}
        </View>
      </View>
    ) : (
      <Delegate to={itemBuilder} props={{ userInfo: item }} />
    );

  useEffect(() => {
    const callbackID =
      'ZegoMemberList' + String(Math.floor(Math.random() * 10000));
    ZegoUIKitInternal.onSDKConnected(callbackID, () => {
      setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
    });
    ZegoUIKitInternal.onRoomStateChanged(
      callbackID,
      (reason: ZegoRoomStateChangedReason) => {
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
      }
    );
    ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID, (userList: any[]) => {
      zloginfo(
        '===============onUserCountOrPropertyChanged==============',
        userList
      );
      if (typeof sortUserList === 'function') {
        const temp = sortUserList(userList) || userList;
        setMemberList((arr) => [...temp]);
      } else {
        // Put yourself first
        const index = userList.findIndex(
          (user) => user.userID == ZegoUIKitInternal.getLocalUserInfo().userID
        );
        index !== -1 && (userList = userList.splice(index, 1).concat(userList));
        setMemberList((arr) => [...userList]);
      }
    });
    ZegoUIKitInternal.onMemberListForceSort(callbackID, (userList: any[]) => {
      zloginfo('===============onMemberListForceSort==============', userList)
      if (typeof sortUserList === 'function') {
        const temp = sortUserList(userList) || userList;
        setMemberList((arr) => [...temp]);
      } else {
        // Don't deal with
      }
    });
    return () => {
      ZegoUIKitInternal.onSDKConnected(callbackID);
      ZegoUIKitInternal.onRoomStateChanged(callbackID);
      ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID);
      ZegoUIKitInternal.onMemberListForceSort(callbackID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlatList
      data={memberList}
      renderItem={renderItem}
      keyExtractor={(item) => item.userID}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 17,
    height: 62,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
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
    fontSize: 16,
  },
  name: {
    fontSize: 16,
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
    marginLeft: 12,
  },
});
