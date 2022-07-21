import { useState } from "react";
import { Image, View } from "react-native";
import { userZegoStateContext } from '../../../../hooks/useZegoStateContext'
import { zegoUIKitSelectors } from '../../../../selectors'
import { getImageSource } from "../../../utils/image_path_processor";

export default function ZegoToggleMicButton(props) {
    const { userID, iconMicOn, iconMicOff } = props;
    const { isOn, setIsOn } = useState(true);// Default on
    const context = userZegoStateContext();
    const avService = zegoUIKitSelectors.getAudioVideoService(context);
    const getImageSourceByPath = () => {
        const pathOn = iconMicOn == undefined ? "TODO default path" : iconMicOn;
        const pathOff = iconMicOff == undefined ? "TODO default path" : iconMicOff;
        return getImageSource(isOn ? pathOn : pathOff);
    }
    const onPress = () => {
        avService.turnMicDeviceOn(userID, !isOn);
    }
    useEffect(() => {
        avService.onMicDeviceOn((id, on) => {
            if (id == userID) {
                setIsOn(on);
            }
        });
    }, []);

    // TODO make style layout
    return (<View>
        <TouchableOpacity
            style={styles.micCon}
            onPress={onPress}>
            <Image source={getImageSourceByPath()} />
        </TouchableOpacity>
    </View>)
}