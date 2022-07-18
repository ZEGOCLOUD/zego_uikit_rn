import { useEffect, useReducer } from "react";
import PropTypes from 'prop-types';
import { connectSDK, disconnectSdk } from "./dux/sdk/thunks";
import { zloginfo } from "./utils/logger";
import { ZegoUIKitContext } from "./ZegoUIKitContext";
import sdkReducers from "./sdk/reducers";
import initialState from "./dux/sdk/initialState";

export default function ZegoUIKitProvider(props) {
    // destruct from props
    const { appID, appSign, children } = props;


    const [sdkStore, sdkDispatcher] = useReducer(sdkReducers, initialState);

    useEffect(() => {
        zloginfo('App init...');

        connectSDK({ appID, appSign, sdkStore, sdk: sdkStore.sdk }, { sdkDispatcher });

        return () => {
            zloginfo('App uninit...');
            disconnectSdk(sdkDispatcher, sdkStore.sdk, () => {
                zloginfo('Disconnected from ZEGOUIKit.');
            });
        };
    }, [appID, appSign]);

    return (
        <ZegoUIKitContext.Provider
            value={{
                stores: {
                    // The sdkStore changed will cause the value update, 
                    // then element wrap by the provider and use withZegoUIKitContext function can get sdk instance
                    sdkStore,
                },
                dispatchers: {
                    sdkDispatcher,
                },
                config: {

                }
            }}
        >
            {children}
        </ZegoUIKitContext.Provider>
    );
}

ZegoUIKitProvider.protoTypes = {
    appID: PropTypes.number.isRequired,
    appSign: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.any,
    ]).isRequired,
}