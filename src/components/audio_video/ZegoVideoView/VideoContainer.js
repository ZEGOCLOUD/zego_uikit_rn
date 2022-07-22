import { useEffect } from "react";
import { findNodeHandle, View } from "react-native";
import { ZegoTextureView } from 'zego-express-engine-reactnative';
import ZegoUIKitInternal from "../../../core/internal/ZegoUIKitInternal";

export default function VideoContainer(props) {
    const { userID, fillMode } = props;
    const viewRef = React.createRef();
    useEffect(() => {
        const viewID = findNodeHandle(viewRef);
        ZegoUIKitInternal.updateRenderingProperty(userID, viewID, fillMode);
    })
    return (<View>
        <ZegoTextureView
            ref={viewRef}
        />
    </View>);
}