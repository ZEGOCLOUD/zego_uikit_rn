import { useState } from "react";
import { Image, View } from "react-native";
import { userZegoStateContext } from '../../../../hooks/useZegoStateContext'
import { zegoUIKitSelectors } from '../../../../selectors'
import { getImageSource } from "../../../utils/image_path_processor";

export default function ZegoToggleCameraButton(props) {
    const { userID, iconCameraOn, iconCameraOff } = props;
    const { isOn, setIsOn } = useState(true);// Default on
    const context = userZegoStateContext();
    const avService = zegoUIKitSelectors.getAudioVideoService(context);
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn == undefined ? "TODO default path" : iconCameraOn;
        const pathOff = iconCameraOff == undefined ? "TODO default path" : iconCameraOff;
        return getImageSource(isOn ? pathOn : pathOff);
    }
    const onPress = () => {
        avService.turnCameraDeviceOn(userID, !isOn);
    }
    useEffect(() => {
        avService.onCameraDeviceOn((id, on) => {
            if (id == userID) {
                setIsOn(on);
            }
        });
    }, []);

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            style={styles.cameraCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}