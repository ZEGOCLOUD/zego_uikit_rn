import { View } from "react-native";
import Delegate from "react-delegate-component";
import AudioContainer from "./AudioContainer";
import VideoContainer from "./VideoContainer";
import { userZegoStateContext } from '../../hooks/useZegoStateContext'
import { zegoUIKitSelectors } from '../../../selectors'


function MaskViewDefault(props) {
    return (<View></View>);
}

export default function ZegoVideoView(props) {
    const { userID, roomID, audioViewBackgroudColor, audioViewBackgroudImage, showSoundWave, videoFillMode, maskViewBuilder }
        = props;
    const context = userZegoStateContext();
    const userService = zegoUIKitSelectors.getUserService(context);
    const userInfo = userService.getUserInfoByID(userID);

    // TODO make style layout
    return (<View>
        <AudioContainer showSoundWave={showSoundWave} />
        <VideoContainer videoFillMode={videoFillMode} />
        <Delegate
            to={maskViewBuilder}
            default={MaskViewDefault}
            props={{ userInfo }}
        />
    </View>)
}