package com.zegouikitrn;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;

import java.util.HashMap;

import im.zego.uikit.libuikitreport.ReportUtil;

@ReactModule(name = ReportRNModule.NAME)
public class ReportRNModule extends ReactContextBaseJavaModule  {
    public static final String NAME = "ReportRNModule";

    public ReportRNModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void getVersion(Promise promise) {
        promise.resolve(ReportUtil.getVersion());
    }

    @ReactMethod
    public void create(String appID, String signOrToken, @NonNull ReadableMap rnParamsMap) {
        ReportUtil.create(Long.parseLong(appID), signOrToken, rnParamsMap.toHashMap());
    }

    @ReactMethod
    public void updateCommonParams(@NonNull ReadableMap rnParamsMap) {
        ReportUtil.updateCommonParams(rnParamsMap.toHashMap());
    }

    @ReactMethod
    public void reportEvent(String event, @Nullable ReadableMap rnParamsMap) {
        HashMap<String, Object> paramsMap = (rnParamsMap != null) ? rnParamsMap.toHashMap() : new HashMap<>();
        ReportUtil.reportEvent(event, paramsMap);
    }
}
