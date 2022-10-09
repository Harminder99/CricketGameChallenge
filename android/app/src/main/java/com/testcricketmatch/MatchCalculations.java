
package com.testcricketmatch;

/**
 * Created by Harminder Singh on 07,October,2022
 */


import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MatchCalculations extends ReactContextBaseJavaModule {
    MatchCalculations(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "MatchCalculations";
    }

    @ReactMethod
    public void createMatchLogs(Callback callback){
        Log.d("createMatchLogs","logs created");
        callback.invoke("data return");
    }

    // with promise

    @ReactMethod
    public void createMatchLogsWithPromise(Promise promise){
        Log.d("createMatchLogs","logs created");
       try{
promise.resolve("data return from promise");
       }catch (Exception e){
           promise.reject("Error return from promise",e);
       }
    }


    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}

