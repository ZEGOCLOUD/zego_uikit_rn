import React from "react";
import { Text, View, StyleSheet } from "react-native"
import PictureInPictureWindow from './PictureInPictureLayout'
import GalleryLayout from './GalleryLayout'
import { ZegoLayoutMode } from "./defines";

export default function ZegoAudioVideoContainer(props: any) {
  const { 
    foregroundBuilder, 
    layout, 
    audioVideoConfig = {}, 
    sortAudioVideo, 
    avatarBuilder 
  } = props;
  const { mode = ZegoLayoutMode.pictureInPicture } = layout;

  return (<View style={styles.container}>
    {mode == 0 ?
      <PictureInPictureWindow
        audioVideoConfig={audioVideoConfig}
        config={layout.config}
        sortAudioVideo={sortAudioVideo}
        avatarBuilder={avatarBuilder}
        foregroundBuilder={foregroundBuilder} /> :
      <GalleryLayout 
        audioVideoConfig={audioVideoConfig}
        config={layout.config}
        sortAudioVideo={sortAudioVideo}
        avatarBuilder={avatarBuilder}
        foregroundBuilder={foregroundBuilder} />
    }
  </View>)
}

export {
  ZegoLayoutMode
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',

  },
  audioVideoView: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'red',
    zIndex: 1,
  },
});
