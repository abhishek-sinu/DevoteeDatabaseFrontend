package com.example.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivityUPI";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request != null ? request.getUrl() : null;
                    return handleUpiIntent(uri != null ? uri.toString() : null);
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return handleUpiIntent(url);
                }
            });
        }
    }

    private boolean handleUpiIntent(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }

        String lower = url.toLowerCase();
        boolean isUpiIntent =
                lower.startsWith("upi://pay") ||
                lower.startsWith("gpay://") ||
                lower.startsWith("phonepe://") ||
                lower.startsWith("paytmmp://") ||
                lower.startsWith("intent://");

        if (!isUpiIntent) {
            return false;
        }

        try {
            Intent intent;
            if (lower.startsWith("intent://")) {
                intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                intent.setComponent(null);

                String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                if (fallbackUrl != null && !fallbackUrl.trim().isEmpty()) {
                    Intent fallbackIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl));
                    startActivity(fallbackIntent);
                    return true;
                }
            } else {
                intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            }

            startActivity(intent);
            return true;
        } catch (ActivityNotFoundException ex) {
            Log.e(TAG, "No app found to handle UPI intent: " + url, ex);
            return true;
        } catch (Exception ex) {
            Log.e(TAG, "Failed to open UPI intent: " + url, ex);
            return true;
        }
    }
}
