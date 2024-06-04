import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import VideoFrame from "./VideoFrame";

function MaskViewDefault(props: any) {
  const { userName } = props;
  return (
    <View style={styles.defaultMaskContainer}>
      <View style={styles.defaultMaskNameLabelContainer}>
        <Text style={styles.defaultMaskNameLabel}>{userName}</Text>
      </View>
    </View>
  );
}

function FullScreenButton(props: any) {
  const {
    onPressed,
    isFullScreen,
  } = props;
  const getImageSource = () => {
    const fullScreen = require('../../internal/resources/video_view_full_screen_close.png');
    const notFullScreen = require('../../internal/resources/video_view_full_screen_open.png');
    return isFullScreen ? fullScreen : notFullScreen;
  }
  const onPress = () => {
    if (typeof onPressed === 'function') {
      onPressed();
    }
  }

  return (
    <TouchableOpacity
      style={{ width: 30, height: 30, justifyContent: 'center' }}
      onPress={onPress}
    >
      <Image resizeMode='contain' source={getImageSource()} style={{ width: "100%", height: "100%" }}></Image>
    </TouchableOpacity>
  );
}

export default function ScreenSharingView(props: any) {

  const {
    userID,
    userName,
    useVideoViewAspectFill = false,
    onFullScreenButtonPressed,
    isFullScreen,
  } = props;

  return (
    <View style={styles.container}>
      <VideoFrame
        style={styles.videoContainer}
        userID={userID}
        fillMode={useVideoViewAspectFill ? 1 : 0} // 1:AspectFill, 0:AspectFit
        isPictureInPicture={false}
        isScreenShare={true}
      >
      </VideoFrame>
      <MaskViewDefault userName={userName} />
      <View style={styles.fullScreenButton}>
        <FullScreenButton 
          onPressed={onFullScreenButtonPressed}
          isFullScreen={isFullScreen}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  defaultMaskContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  defaultMaskNameLabelContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    opacity: 0.5,
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 3,
    borderRadius: 6,
    bottom: 5,
    right: 5,
  },
  defaultMaskNameLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  fullScreenButton: {
    flex: 1,
    zIndex: 2,
    alignSelf: 'center',
    position: 'absolute',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 3,
    borderRadius: 6,
    top: 80,
    right: 10,
  },
});