import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from 'react-native'
import ZegoUIKitInternal from "../../internal/ZegoUIKitInternal";
import ZegoAudioVideoView from "../../audio_video/ZegoAudioVideoView";
import ZegoAudioVideoViewMore from "./MoreFrame";
import { ZegoRoomStateChangedReason } from "zego-express-engine-reactnative";
import ScreenSharingView from "../../audio_video/ZegoAudioVideoView/ScreenSharingView";
import { zloginfo, zlogwarning } from "../../../utils/logger";

export default function GalleryLayout(props: any) {
    const { 
      config = {}, 
      foregroundBuilder, 
      audioVideoConfig = {},
      avatarBuilder
    } = props;
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
    const [screenShareUserList, setScreenShareUserList] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(false);

    var videoUserList: any[] = [];

    const refreshUserList = () => {
      var newUserList = [...videoUserList];
      const index = newUserList.findIndex((user => user.userID == ZegoUIKitInternal.getLocalUserInfo().userID));
      index !== -1 && (newUserList = newUserList.splice(index, 1).concat(newUserList));
      
      const userList = newUserList.slice(0, 7);
      const moreUserList = newUserList.slice(7);
      setUserList(userList);
      setMoreUserList(moreUserList);
    }

    useEffect(() => {
        const callbackID = 'GalleryLayout' + String(Math.floor(Math.random() * 10000));
        ZegoUIKitInternal.onSDKConnected(callbackID, () => {
            setLocalUserID(ZegoUIKitInternal.getLocalUserInfo().userID);
        });
        ZegoUIKitInternal.onRoomStateChanged(callbackID, (reason: ZegoRoomStateChangedReason) => {
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
        ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID, (userList: any[]) => {
            // zlogwarning('>>>>>>>>>>> onUserCountOrPropertyChanged', userList)
            // Put yourself first
            videoUserList = userList;
            refreshUserList();
        });
        ZegoUIKitInternal.onScreenSharingAvailable(callbackID, (userList: any[]) => {
          const screenShareUserList = ZegoUIKitInternal.getAllScreenshareUsers();
          screenShareUserList.forEach(user => {
            user.isScreenShare = true;
          });
          setScreenShareUserList(screenShareUserList);
          if (screenShareUserList.length == 0) {
            setIsFullScreen(false);
          }
          refreshUserList();
        });
        ZegoUIKitInternal.onScreenSharingUnavailable(callbackID, (userList: any[]) => {
          const screenShareUserList = ZegoUIKitInternal.getAllScreenshareUsers();
          screenShareUserList.forEach(user => {
            user.isScreenShare = true;
          });
          setScreenShareUserList(screenShareUserList);
          if (screenShareUserList.length == 0) {
            setIsFullScreen(false);
          }
          refreshUserList();
        });
        return () => {
            ZegoUIKitInternal.onSDKConnected(callbackID);
            ZegoUIKitInternal.onRoomStateChanged(callbackID);
            ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID);
            ZegoUIKitInternal.onScreenSharingAvailable(callbackID);
            ZegoUIKitInternal.onScreenSharingUnavailable(callbackID);
        }
    }, []);

    const getScreenShareViewStyle = () => {
      var height = '50%';
      const len = userList.length;
      if (len <= 2) {
        height = '50%';
      } else if (len <= 4) {
        height = '33.33%';
      } else if (len <= 6) {
        height = '25%';
      } else {
        height = '20%';
      }
      return StyleSheet.create({
        audioVideoViewSize: {
          width: '100%',
          height: height,
        },
      }).audioVideoViewSize;
    }

    const getAudioVideoViewStyle = () => {
      const hasScreenShare = screenShareUserList.length > 0;
      var len = userList.length;
      var width = '100%';
      var height = '100%';
      if (hasScreenShare) {
        if (len == 1) {
          width = '100%';
          height = '50%';
        } else if (len == 2) {
          width = '50%';
          height = '50%';
        } else if (len <= 4) {
          width = '50%';
          height = '33.33%';
        } else if (len <= 6) {
          width = '50%';
          height = '25%';
        } else {
          width = '50%';
          height = '20%';
        }
      } else {
        if (len == 1) {
          width = '100%';
          height = '100%';
        } else if (len == 2) {
          width = '100%';
          height = '50%';
        } else if (len <= 4) {
          width = '50%';
          height = '50%';
        } else if (len <= 6) {
          width = '50%';
          height = '33.33%';
        } else {
          width = '50%';
          height = '25%';
        }
      }

      return StyleSheet.create({
        audioVideoViewSize: {
          width: width,
          height: height,
        },
      }).audioVideoViewSize;
    }

    const getMoreViewStyle = () => {
      if (screenShareUserList.length > 0) {
        return styles.audioVideoViewSizeMore2;
      } else {
        return styles.audioVideoViewSizeMore1;
      }
    }

    const onFullScreenButtonPressed = () => {
      zloginfo('onFullScreenButtonPressed', !isFullScreen);
      setIsFullScreen(!isFullScreen);
    }

    const isAudioVideoViewPadding = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.audioVideoViewPadding : null;
    const isAudioVideoViewBorder = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.audioVideoViewBorder : null;

    return (<View style={{flex: 1, width: '100%', height: '100%'}}>
      {isFullScreen && screenShareUserList.length > 0 ? 
      <View style={[styles.container, isAudioVideoViewPadding]}>
      {
        <View key={screenShareUserList[0].userID+'_screenShare'} style={[
          styles.audioVideoViewContainer,
          styles.screenShareViewFullScreen,
        ]}>
          <ScreenSharingView
            userID={screenShareUserList[0].userID}
            userName={screenShareUserList[0].userName}
            onFullScreenButtonPressed={onFullScreenButtonPressed}
            isFullScreen={isFullScreen}
          />
        </View>
      }
      </View>
      :
      <View style={[styles.container, isAudioVideoViewPadding]}>
        {
          screenShareUserList.map((user, index) => <View key={user.userID+'_screenShare'} style={[
            styles.audioVideoViewContainer,
            getScreenShareViewStyle(),
            isAudioVideoViewPadding
        ]}>
          <ScreenSharingView
            userID={user.userID}
            userName={user.userName}
            onFullScreenButtonPressed={onFullScreenButtonPressed}
            isFullScreen={isFullScreen}
          />
          </View>)
        }
        {
            userList.map((user, index) => <View key={user.userID} style={[
                styles.audioVideoViewContainer,
                getAudioVideoViewStyle(),
                isAudioVideoViewPadding
            ]}>
                <View style={[styles.audioVideoViewSubContainer, isAudioVideoViewBorder]}>
                    <ZegoAudioVideoView
                        userID={user.userID}
                        audioViewBackgroudColor={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundColor : othersViewBackgroundColor}
                        audioViewBackgroudImage={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundImage : othersViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                        avatarBuilder={avatarBuilder}
                    />
                </View>
            </View>)
        }
        {
            moreUserList.length <=1 ? moreUserList.map((user, index) => <View key={user.userID} style={[
                styles.audioVideoViewContainer,
                getAudioVideoViewStyle(),
                isAudioVideoViewPadding
            ]}>
                <View style={[styles.audioVideoViewSubContainer, isAudioVideoViewBorder]}>
                    <ZegoAudioVideoView
                        userID={user.userID}
                        audioViewBackgroudColor={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundColor : othersViewBackgroundColor}
                        audioViewBackgroudImage={user.userID == ZegoUIKitInternal.getLocalUserInfo().userID ? ownViewBackgroundImage : othersViewBackgroundImage}
                        showSoundWave={showSoundWavesInAudioMode}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        foregroundBuilder={foregroundBuilder}
                        avatarBuilder={avatarBuilder}
                    />
                </View>
            </View>) : <View style={[styles.audioVideoViewContainer, getMoreViewStyle(), isAudioVideoViewPadding]}>
                <View style={[styles.audioVideoViewSubContainer, isAudioVideoViewBorder]}>
                    <ZegoAudioVideoViewMore 
                        userList={moreUserList}
                        useVideoViewAspectFill={useVideoViewAspectFill}
                        audioViewBackgroudColor={othersViewBackgroundColor}
                        audioViewBackgroudImage={othersViewBackgroundImage}
                    />
                </View>
            </View>
        }
    </View>}
    </View>
  )
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
    audioVideoViewContainer: {
        zIndex: 1,
    },
    audioVideoViewSubContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#D8D8D8',
    },
    audioVideoViewBorder: {
        borderRadius: 10,
    },
    audioVideoViewPadding: {
        paddingLeft: 2.5,
        paddingRight: 2.5,
        paddingTop: 2.5,
        paddingBottom: 2.5,
    },
    audioVideoViewSizeMore1: {
        width: '50%',
        height: '25%',
    },
    audioVideoViewSizeMore2: {
      width: '50%',
      height: '20%',
    },
    screenShareViewFullScreen: {
      width: '100%',
      height: '100%',
    },
});