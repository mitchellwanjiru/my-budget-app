package com.mybudget.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class MpesaSmsReceiver extends BroadcastReceiver {
    private static final String TAG = "MpesaSmsReceiver";
    public static final String PREFS_NAME = "mpesa_prefs";
    public static final String KEY_PENDING_SMS = "pending_sms";

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        String format = bundle.getString("format");
                        SmsMessage message;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            message = SmsMessage.createFromPdu((byte[]) pdu, format);
                        } else {
                            message = SmsMessage.createFromPdu((byte[]) pdu);
                        }
                        if (message != null) {
                            String sender = message.getDisplayOriginatingAddress();
                            String body = message.getMessageBody();

                            if (body != null && (
                                (sender != null && (sender.toUpperCase().contains("MPESA") || sender.toUpperCase().contains("M-PESA"))) ||
                                body.contains("Confirmed. Ksh") || 
                                body.contains("confirmed. You bought") ||
                                body.contains("You have received Ksh")
                            )) {
                                Log.d(TAG, "M-Pesa SMS detected: " + body);

                                // 1. Save to SharedPreferences so it is never lost if app is closed or backgrounded
                                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                                prefs.edit().putString(KEY_PENDING_SMS, body).apply();

                                // 2. Broadcast to active MainActivity if in foreground
                                Intent notifyIntent = new Intent("com.mybudget.app.MPESA_SMS_RECEIVED");
                                notifyIntent.putExtra("sms_body", body);
                                notifyIntent.setPackage(context.getPackageName());
                                context.sendBroadcast(notifyIntent);
                            }
                        }
                    }
                }
            }
        }
    }
}
