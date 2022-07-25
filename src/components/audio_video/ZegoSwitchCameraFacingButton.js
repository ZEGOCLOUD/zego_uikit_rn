import { useState } from "react";
import { Image, View } from "react-native";
import { getImageSource } from "../../utils/image_path_processor";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoSwitchCameraFacingButton(props) {
    const { iconFrontFacingCamera, iconBackFacingCamera } = props;
    const [isFront, setIsFront] = useState(true);// Default front
    const getImageSourceByPath = () => {
        const pathFront = iconFrontFacingCamera ? iconFrontFacingCamera : "TODO default path";
        const pathBack = iconBackFacingCamera ? iconFrontFacingCamera : "TODO default path";
        return getImageSource(isFront ? pathFront : pathBack);
    }
    const onPress = () => {
        ZegoUIKitInternal.useFrontFacingCamera(!isFront);
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