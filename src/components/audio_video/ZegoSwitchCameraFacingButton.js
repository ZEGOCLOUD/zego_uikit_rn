import { useState } from "react";
import { Image, View } from "react-native";
import { userZegoStateContext } from '../../../../hooks/useZegoStateContext'
import { zegoUIKitSelectors } from '../../../../selectors'
import { getImageSource } from "../../../utils/image_path_processor";

export default function ZegoSwitchCameraFacingButton(props) {
    const { iconFrontFacingCamera, iconBackFacingCamera } = props;
    const { isFront, setIsFront } = useState(true);// Default front
    const context = userZegoStateContext();
    const avService = zegoUIKitSelectors.getAudioVideoService(context);
    const getImageSourceByPath = () => {
        const pathFront = iconFrontFacingCamera == undefined ? "TODO default path" : iconFrontFacingCamera;
        const pathBack = iconBackFacingCamera == undefined ? "TODO default path" : iconFrontFacingCamera;
        return getImageSource(isFront ? pathFront : pathBack);
    }
    const onPress = () => {
        avService.useFrontFacingCamera(!isFront);
        setIsFront(!isFront);
    }

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}