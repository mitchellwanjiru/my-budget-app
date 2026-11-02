package com.mybudget.app;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_CODE = 1001;

    public class MpesaBridgeInterface {
        @JavascriptInterface
        public String getPendingSms() {
            SharedPreferences prefs = getSharedPreferences(MpesaSmsReceiver.PREFS_NAME, Context.MODE_PRIVATE);
            String pending = prefs.getString(MpesaSmsReceiver.KEY_PENDING_SMS, null);
            if (pending != null && !pending.isEmpty()) {
                prefs.edit().remove(MpesaSmsReceiver.KEY_PENDING_SMS).apply();
                return pending;
            }
            return null;
        }

        @JavascriptInterface
        public void acknowledgeSms() {
            SharedPreferences prefs = getSharedPreferences(MpesaSmsReceiver.PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(MpesaSmsReceiver.KEY_PENDING_SMS).apply();
        }
    }

    private final BroadcastReceiver mpesaReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String smsBody = intent.getStringExtra("sms_body");
            if (smsBody != null) {
                dispatchSmsWithRetry(smsBody, 0);
            }
        }
    };

    private void dispatchSmsWithRetry(final String smsBody, final int retryCount) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            String escaped = smsBody.replace("\\", "\\\\")
                                    .replace("'", "\\'")
                                    .replace("\n", "\\n")
                                    .replace("\r", "");

            // JavaScript returns 'ACK' if App is loaded and has handled the SMS
            String js = "(function() { " +
                        "  if (window.__receiveMpesaSms) { " +
                        "    window.__receiveMpesaSms('" + escaped + "'); " +
                        "    return 'ACK'; " +
                        "  } else if (window.__appReady) { " +
                        "    window.dispatchEvent(new CustomEvent('mpesa_sms_received', { detail: '" + escaped + "' })); " +
                        "    return 'ACK'; " +
                        "  } " +
                        "  return 'WAIT'; " +
                        "})()";

            getBridge().getWebView().post(() -> {
                getBridge().getWebView().evaluateJavascript(js, result -> {
                    if ("\"ACK\"".equals(result)) {
                        // Confirmed received by Web! Remove from SharedPreferences
                        SharedPreferences prefs = getSharedPreferences(MpesaSmsReceiver.PREFS_NAME, Context.MODE_PRIVATE);
                        prefs.edit().remove(MpesaSmsReceiver.KEY_PENDING_SMS).apply();
                    } else if (retryCount < 8) {
                        // Web not ready yet (loading from Vercel). Retry in 1.2s
                        getBridge().getWebView().postDelayed(() -> dispatchSmsWithRetry(smsBody, retryCount + 1), 1200);
                    }
                });
            });
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkAndRequestSmsPermissions();

        // Inject Native Bridge for web to pull pending SMS on startup
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new MpesaBridgeInterface(), "MpesaNativeBridge");
        }

        // Register receiver for duration of the activity life
        IntentFilter filter = new IntentFilter("com.mybudget.app.MPESA_SMS_RECEIVED");
        ContextCompat.registerReceiver(this, mpesaReceiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Check if an SMS arrived while the app was closed or in the background
        checkPendingSms();
    }

    private void checkPendingSms() {
        SharedPreferences prefs = getSharedPreferences(MpesaSmsReceiver.PREFS_NAME, Context.MODE_PRIVATE);
        String pending = prefs.getString(MpesaSmsReceiver.KEY_PENDING_SMS, null);
        if (pending != null && !pending.trim().isEmpty()) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().postDelayed(() -> dispatchSmsWithRetry(pending, 0), 600);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
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
