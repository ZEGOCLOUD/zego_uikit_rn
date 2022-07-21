import { useEffect } from "react";
import { findNodeHandle, View } from "react-native";
import ZegoExpressEngine, {
    ZegoTextureView,
} from 'zego-express-engine-reactnative';

export default function VideoContainer(props) {
    const { userID, fillMode } = props;
    const viewRef = React.createRef();
    useEffect(() => {
        const viewID = findNodeHandle(viewRef);
        // TODO store the viewId into core
    })
    return (<View>
        <ZegoTextureView
            ref={viewRef}
        />
    </View>);
}