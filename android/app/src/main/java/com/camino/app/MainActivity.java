package com.camino.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Avoid restoring a stale WebView navigation stack after process death.
    super.onCreate(null);
    CookieManager cookieManager = CookieManager.getInstance();
    cookieManager.setAcceptCookie(true);
    if (this.bridge != null && this.bridge.getWebView() != null) {
      cookieManager.setAcceptThirdPartyCookies(this.bridge.getWebView(), true);
    }
  }

  @Override
  public void onPause() {
    // Persist cookie deletes (logout) to disk before the process may be killed.
    CookieManager.getInstance().flush();
    super.onPause();
  }
}
