package com.zegouikitrn;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;

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
}
