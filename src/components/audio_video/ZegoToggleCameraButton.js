import { useState } from "react";
import { Image, View } from "react-native";
import { getImageSource } from "../../../utils/image_path_processor";
import ZegoUIKitInternal from "../../core/internal/ZegoUIKitInternal";

export default function ZegoToggleCameraButton(props) {
    const { userID, iconCameraOn, iconCameraOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : "TODO default path";
        const pathOff = iconCameraOff ? iconCameraOff : "TODO default path";
        return getImageSource(isOn ? pathOn : pathOff);
    }
    const onPress = () => {
        ZegoUIKitInternal.turnCameraDeviceOn(userID, !isOn);
    }
    useEffect(() => {
        ZegoUIKitInternal.onCameraDeviceOn((id, on) => {
            if (id == userID) {
                setIsOn(on);
            }
        })
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