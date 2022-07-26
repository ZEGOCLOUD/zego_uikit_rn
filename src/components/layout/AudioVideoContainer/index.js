import React from "react";
import { Text, View } from "react-native"
import PictureInPictureWindow from './PictureInPictureLayout'

/*
LayoutMode {
    PictureInPicture: 0
    PicturenOverFlow: 1
}
*/
export default function ZegoAudioVideoContainer(props) {
    const { maskViewBuilder, layoutMode, layoutConfig } = props;
    return (<View>
        {layoutMode == 0 ? <PictureInPictureWindow cinfog={layoutConfig} maskViewBuilder={maskViewBuilder}/> : <PictureInPictureWindow />}
    </View>)
}