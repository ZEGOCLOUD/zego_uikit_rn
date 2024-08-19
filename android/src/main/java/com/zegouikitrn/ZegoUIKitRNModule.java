package com.zegouikitrn;

import android.content.Context;
import android.os.Environment;

import androidx.annotation.NonNull;

import com.elvishew.xlog.LogConfiguration;
import com.elvishew.xlog.XLog;
import com.elvishew.xlog.flattener.PatternFlattener;
import com.elvishew.xlog.printer.Printer;
import com.elvishew.xlog.printer.file.FilePrinter;
import com.elvishew.xlog.printer.file.backup.NeverBackupStrategy;
import com.elvishew.xlog.printer.file.clean.FileLastModifiedCleanStrategy;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import com.zegouikitrn.logconfig.CustomFileNameGenerator;

import java.io.File;

@ReactModule(name = ZegoUIKitRNModule.NAME)
public class ZegoUIKitRNModule extends ReactContextBaseJavaModule {
    public static final String NAME = "ZegoUIKitRNModule";

    private boolean xlogHasInitialized = false;
    private static final String UIKIT_LOGS_SUBPATH = "zego_prebuilt";

    public ZegoUIKitRNModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }


    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    public void multiply(double a, double b, Promise promise) {
        promise.resolve(a * b);
    }

    @ReactMethod
    public void logInfo(String log) {
        ReactApplicationContext reactContext = getReactApplicationContextIfActiveOrWarn();
        if (reactContext == null) {
            return;
        }

        ensureXLogInitialized(reactContext);
        XLog.i(log);
    }

    @ReactMethod
    public void logWarning(String log) {
        ReactApplicationContext reactContext = getReactApplicationContextIfActiveOrWarn();
        if (reactContext == null) {
            return;
        }

        ensureXLogInitialized(reactContext);
        XLog.w(log);
    }

    @ReactMethod
    public void logError(String log) {
        ReactApplicationContext reactContext = getReactApplicationContextIfActiveOrWarn();
        if (reactContext == null) {
            return;
        }

        ensureXLogInitialized(reactContext);
        XLog.e(log);
    }

    private void ensureXLogInitialized(ReactApplicationContext reactContext) {
        if (xlogHasInitialized == false) {
            LogConfiguration config = new LogConfiguration.Builder().build();
            Printer filePrinter = new FilePrinter                      // 打印日志到文件的打印器
                .Builder(getStorageFilesPath(reactContext) + File.separator + UIKIT_LOGS_SUBPATH)    // 指定保存日志文件的路径
                .fileNameGenerator(new CustomFileNameGenerator())        // 指定日志文件名生成器
                .backupStrategy(new NeverBackupStrategy())             // 指定日志文件备份策略，默认为 FileSizeBackupStrategy(1024 * 1024)
                .cleanStrategy(new FileLastModifiedCleanStrategy(3L*24*60*60*1000))     // 指定日志文件清除策略，默认为 NeverCleanStrategy()
                .flattener(new PatternFlattener("{d MMdd HH:mm:ss.SSS} {m}"))
                .build();
            XLog.init(config, filePrinter);

            xlogHasInitialized = true;
            XLog.i("\n\n\n");
            XLog.i("XLog init...");
        }
    }

    private static String getStorageFilesPath(Context context) {
        String folderPath = null;
        if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED) && context.getExternalFilesDir(null) != null) {
            folderPath = context.getExternalFilesDir(null).getAbsolutePath();
        } else {
            folderPath = context.getFilesDir().getAbsolutePath();
        }

        return folderPath;
    }
}
