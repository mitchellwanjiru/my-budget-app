package com.mybudget.app;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_CODE = 1001;

    private final BroadcastReceiver mpesaReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String smsBody = intent.getStringExtra("sms_body");
            if (smsBody != null && getBridge() != null && getBridge().getWebView() != null) {
                // Escape string for JS injection
                String escaped = smsBody.replace("\\", "\\\\")
                                        .replace("'", "\\'")
                                        .replace("\n", "\\n")
                                        .replace("\r", "");
                String js = "window.dispatchEvent(new CustomEvent('mpesa_sms_received', { detail: '" + escaped + "' }));";
                getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(js, null));
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkAndRequestSmsPermissions();
    }

    @Override
    protected void onResume() {
        super.onResume();
        IntentFilter filter = new IntentFilter("com.mybudget.app.MPESA_SMS_RECEIVED");
        ContextCompat.registerReceiver(this, mpesaReceiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED);
    }

    @Override
    protected void onPause() {
        super.onPause();
        try {
            unregisterReceiver(mpesaReceiver);
        } catch (Exception ignored) {}
    }

    private void checkAndRequestSmsPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                new String[]{Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS},
                SMS_PERMISSION_CODE
            );
        }
    }
}
