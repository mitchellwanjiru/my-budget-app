package com.mybudget.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class MpesaSmsReceiver extends BroadcastReceiver {
    private static final String TAG = "MpesaSmsReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage message = SmsMessage.createFromPdu((byte[]) pdu);
                        String sender = message.getDisplayOriginatingAddress();
                        String body = message.getMessageBody();

                        if (body != null && (
                            (sender != null && (sender.toUpperCase().contains("MPESA") || sender.toUpperCase().contains("M-PESA"))) ||
                            body.contains("Confirmed. Ksh") || 
                            body.contains("confirmed. You bought") ||
                            body.contains("You have received Ksh")
                        )) {
                            Log.d(TAG, "M-Pesa SMS detected: " + body);
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
