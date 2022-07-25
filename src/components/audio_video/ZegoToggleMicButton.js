import { useState } from "react";
import { Image, View } from "react-native";
import { getImageSource } from "../../utils/image_path_processor";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoToggleMicButton(props) {
    const { userID, iconMicOn, iconMicOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconMicOn ? iconMicOn : "TODO default path";
        const pathOff = iconMicOff ? iconMicOff : "TODO default path";
        return getImageSource(isOn ? pathOn : pathOff);
    }
    const onPress = () => {
        ZegoUIKitInternal.turnMicDeviceOn(userID, !isOn);
    }
    useEffect(() => {
        ZegoUIKitInternal.onMicDeviceOn((id, on) => {
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