package com.zegouikitrn;

import androidx.annotation.Keep;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@Keep
@ReactModule(name = ZegoUIKitRNModule.NAME)
public class ZegoUIKitRNModule extends ReactContextBaseJavaModule {
    public static final String NAME = "ZegoUIKitRNModule";

    public ZegoUIKitRNModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void getBackgroundModes(Promise promise) {
        promise.resolve("Not necessary");
    }
}
