package com.kintheusa.location;

import android.app.*;
import android.content.*;
import android.location.*;
import android.os.*;
import java.util.concurrent.*;
import org.json.*;

public class LocationService extends Service implements LocationListener {
  android.content.SharedPreferences prefs;
  LocationManager manager;
  volatile Location latest;
  volatile boolean stopping = false;
  ScheduledExecutorService network;

  @Override
  public void onCreate() {
    super.onCreate();
    prefs = getSharedPreferences("session", MODE_PRIVATE);
    manager = (LocationManager) getSystemService(LOCATION_SERVICE);
    NotificationManager nm = getSystemService(NotificationManager.class);
    nm.createNotificationChannel(
        new NotificationChannel("sharing", "위치 공유", NotificationManager.IMPORTANCE_LOW));
    network = Executors.newSingleThreadScheduledExecutor();
  }

  Notification notification(String text) {
    Intent stop = new Intent(this, LocationService.class).setAction("STOP");
    PendingIntent pi =
        PendingIntent.getService(
            this, 1, stop, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    PendingIntent open =
        PendingIntent.getActivity(
            this,
            0,
            new Intent(this, MainActivity.class),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    return new Notification.Builder(this, "sharing")
        .setContentTitle("KIN 위치 공유")
        .setContentText(text)
        .setSmallIcon(android.R.drawable.ic_menu_mylocation)
        .setOngoing(true)
        .setContentIntent(open)
        .addAction(android.R.drawable.ic_menu_close_clear_cancel, "공유 종료", pi)
        .build();
  }

  boolean scheduled = false;

  @Override
  public int onStartCommand(Intent i, int flags, int id) {
    stopping = prefs.getBoolean("stopping", false) || i != null && "STOP".equals(i.getAction());
    try {
      startForeground(10, notification(stopping ? "링크 폐기 요청 중" : "위치 공유 중 · 종료하려면 누르세요"));
    } catch (SecurityException e) {
      prefs.edit().putString("status", "위치 권한이 없어 전송할 수 없습니다. 링크는 만료 시 종료됩니다.").apply();
      stopSelf();
      return START_NOT_STICKY;
    }
    if (i != null && "PREPARE".equals(i.getAction())) {
      status("공유 링크 준비 중");
      return START_NOT_STICKY;
    }
    if (prefs.getString("id", "").isEmpty()) {
      if (stopping && prefs.getBoolean("creating", false))
        prefs.edit().putBoolean("cancelCreate", true).apply();
      stopSelf();
      return START_NOT_STICKY;
    }
    if (stopping) {
      prefs.edit().putBoolean("stopping", true).apply();
      manager.removeUpdates(this);
      latest = null;
    } else {
      int providers = 0;
      for (String provider :
          new String[] {LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
        try {
          if (manager.isProviderEnabled(provider)) {
            manager.requestLocationUpdates(provider, 5000, 5, this);
            providers++;
          }
        } catch (SecurityException ignored) {
        }
      }
      if (providers == 0) status("위치 권한 또는 위치 설정을 확인하세요.");
    }
    if (!scheduled) {
      scheduled = true;
      network.scheduleWithFixedDelay(this::tick, 0, 5, TimeUnit.SECONDS);
    }
    return START_NOT_STICKY;
  }

  void status(String text) {
    prefs.edit().putString("status", text).apply();
    getSystemService(NotificationManager.class).notify(10, notification(text));
  }

  void finish() {
    prefs
        .edit()
        .remove("id")
        .remove("owner")
        .remove("url")
        .remove("expires")
        .remove("stopping")
        .putString("status", "공유 종료 · 링크가 폐기되었습니다.")
        .apply();
    stopSelf();
  }

  void tick() {
    if (System.currentTimeMillis() >= prefs.getLong("expires", 0)) {
      finish();
      return;
    }
    String path = "/api/sessions/" + prefs.getString("id", "");
    try {
      if (stopping) {
        Api.call(prefs.getString("base", ""), path, "DELETE", prefs.getString("owner", ""), null);
        finish();
        return;
      }
      Location loc = latest;
      if (loc != null && System.currentTimeMillis() - loc.getTime() < 120000) {
        JSONObject fix =
            new JSONObject()
                .put("lat", loc.getLatitude())
                .put("lon", loc.getLongitude())
                .put("accuracy", loc.getAccuracy())
                .put("timestamp", loc.getTime());
        if (lastSent < loc.getTime()) {
          Api.call(
              prefs.getString("base", ""),
              path + "/position",
              "PUT",
              prefs.getString("owner", ""),
              fix);
          lastSent = loc.getTime();
          status(
              "위치 전송 중 · "
                  + new java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.KOREA)
                      .format(new java.util.Date()));
        }
      }
      // Check remote revocation even when GPS has stopped producing fixes.
      Api.call(prefs.getString("base", ""), path, "GET", prefs.getString("owner", ""), null);
      if (loc == null || System.currentTimeMillis() - loc.getTime() > 30000)
        status("새 위치 수신 대기 · 위치 설정을 확인하세요.");
    } catch (Api.Ended e) {
      finish();
    } catch (Exception e) {
      status(stopping ? "종료 대기 · 연결 후 링크 폐기를 재시도합니다." : "전송 지연 · 서버 연결을 재시도합니다.");
    }
  }

  long lastSent = 0;

  @Override
  public void onLocationChanged(Location l) {
    if (!stopping) latest = l;
  }

  @Override
  public void onProviderEnabled(String p) {}

  @Override
  public void onProviderDisabled(String p) {
    status("위치 제공이 꺼졌습니다. 마지막 위치만 표시됩니다.");
  }

  @Override
  public void onStatusChanged(String p, int s, Bundle b) {}

  @Override
  public IBinder onBind(Intent i) {
    return null;
  }

  @Override
  public void onDestroy() {
    manager.removeUpdates(this);
    network.shutdownNow();
    super.onDestroy();
  }
}
