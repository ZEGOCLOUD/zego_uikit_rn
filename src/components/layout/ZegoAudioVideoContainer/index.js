import React from "react";
import { Text, View, StyleSheet } from "react-native"
import PictureInPictureWindow from './PictureInPictureLayout'

/*
LayoutMode {
    PictureInPicture: 0
    PicturenOverFlow: 1
}
*/
export default function ZegoAudioVideoContainer(props) {
    const { maskViewBuilder, layoutMode, layoutConfig = {} } = props;
    return (<View style={styles.container}>
        {layoutMode == 0 ? <PictureInPictureWindow cinfog={layoutConfig} maskViewBuilder={maskViewBuilder}/> : <PictureInPictureWindow />}
    </View>)
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'absolute',

    },
    avView: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'absolute',
      backgroundColor:'red',
      zIndex: 1,
    },
  });
  