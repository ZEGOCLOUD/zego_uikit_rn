import { View } from "react-native";
import Delegate from "react-delegate-component";
import AudioContainer from "./AudioContainer";
import VideoContainer from "./VideoContainer";


function MaskViewDefault(props) {
    return (<View></View>);
}

export default function ZegoVideoView(props) {
    const { userID, roomID, audioViewBackgroudColor, audioViewBackgroudImage, showSoundWave, videoFillMode, maskViewBuilder }
        = props;

    // TODO make style layout
    return (<View>
        <AudioContainer showSoundWave={showSoundWave} audioViewBackgroudColor={audioViewBackgroudColor} audioViewBackgroudImage={audioViewBackgroudImage} />
        <VideoContainer videoFillMode={videoFillMode} />
        <Delegate
            to={maskViewBuilder}
            default={MaskViewDefault}
            props={{ userInfo }}
        />
    </View>)
}