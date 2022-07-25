import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { getImageSource } from "../../utils/image_path_processor";

export default function ZegoCameraStatusIcon(props) {
    const { userID, iconCameraOn, iconCameraOff } = props;
    const [isOn, setIsOn] = useState(true);// Default on
    const getImageSourceByPath = () => {
        const pathOn = iconCameraOn ? iconCameraOn : "TODO default path";
        const pathOff = iconCameraOff ? iconCameraOff : "TODO default path";
        return getImageSource(isOn ? pathOn : pathOff);
    }

    useEffect(() => {
        ZegoUIKitInternal.onCameraDeviceOn((id, on) => {
            if (id == userID) {
                setIsOn(on);
            }
        });
    }, []);

    // TODO make style layout
    return (<View>
        <Image source={getImageSourceByPath()} />
    </View>)
}