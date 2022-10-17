import React from "react";
import { Text, View, StyleSheet } from "react-native"
import PictureInPictureWindow from './PictureInPictureLayout'
import GridLayout from './GridLayout'
import ZegoLayoutMode from "./ZegoLayotMode";

export default function ZegoAudioVideoContainer(props) {
  const { foregroundBuilder, layout, audioVideoConfig = {} } = props;
  const { mode = ZegoLayoutMode.pictureInPicture } = layout;

  return (<View style={styles.container}>
    {mode == 0 ?
      <PictureInPictureWindow
        audioVideoConfig={audioVideoConfig}
        config={layout}
        foregroundBuilder={foregroundBuilder} /> :
      <GridLayout 
        audioVideoConfig={audioVideoConfig}
        config={layout}
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
