package com.kintheusa.location;

import android.app.Application;

public class KinApplication extends Application {
  @Override
  public void onCreate() {
    super.onCreate();
    // A pending HTTP creation request cannot survive a process restart.
    getSharedPreferences("session", MODE_PRIVATE)
        .edit()
        .putBoolean("creating", false)
        .putBoolean("cancelCreate", false)
        .apply();
  }
}
