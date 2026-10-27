package com.kintheusa.location;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.*;
import android.text.InputType;
import android.widget.*;
import java.net.URI;
import org.json.*;

public class MainActivity extends Activity {
  EditText server, key;
  TextView state;
  Button start;
  android.content.SharedPreferences prefs;
  final Handler handler = new Handler();
  final Runnable refresh =
      new Runnable() {
        public void run() {
          state.setText(prefs.getString("status", "공유를 시작하면 화면을 잠근 상태에서도 알림과 함께 위치를 전송합니다."));
          handler.postDelayed(this, 2000);
        }
      };

  @Override
  public void onCreate(Bundle b) {
    super.onCreate(b);
    prefs = getSharedPreferences("session", MODE_PRIVATE);
    LinearLayout box = new LinearLayout(this);
    box.setOrientation(LinearLayout.VERTICAL);
    box.setPadding(40, 50, 40, 32);
    ScrollView scroll = new ScrollView(this);
    scroll.addView(box);
    setContentView(scroll);
    TextView title = new TextView(this);
    title.setText("KIN THE USA\n내 위치 공유");
    title.setTextSize(26);
    box.addView(title);
    server = new EditText(this);
    server.setHint("HTTPS 서버 주소");
    server.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
    server.setText(prefs.getString("base", ""));
    box.addView(server);
    key = new EditText(this);
    key.setSaveEnabled(false);
    key.setHint("서버 연결 키 (공유받는 사람에게 보내지 마세요)");
    key.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
    box.addView(key);
    state = new TextView(this);
    state.setPadding(0, 24, 0, 24);
    box.addView(state);
    start = button(box, "1시간 위치 공유 시작", v -> begin());
    button(
        box,
        "공유 링크 보내기",
        v -> {
          String link = prefs.getString("url", "");
          if (link.isEmpty()) {
            say("먼저 공유를 시작하세요.");
            return;
          }
          Intent i = new Intent(Intent.ACTION_SEND);
          i.setType("text/plain");
          i.putExtra(Intent.EXTRA_TEXT, link);
          startActivity(Intent.createChooser(i, "위치 공유 링크"));
        });
    button(
        box,
        "지도 · 목적지 지정",
        v -> {
          String id = prefs.getString("id", "");
          if (id.isEmpty()) {
            say("먼저 공유를 시작하세요.");
            return;
          }
          String url =
              prefs.getString("base", "")
                  + "/#"
                  + id
                  + "."
                  + prefs.getString("owner", "")
                  + ".manage";
          startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        });
    button(
        box,
        "공유 종료 · 링크 폐기",
        v -> {
          if (prefs.getString("id", "").isEmpty()) {
            if (prefs.getBoolean("creating", false)) {
              prefs.edit().putBoolean("cancelCreate", true).apply();
              stopService(new Intent(this, LocationService.class));
              say("공유 시작 취소 중 · 생성된 링크도 폐기합니다.");
            } else say("현재 공유 중인 링크가 없습니다.");
            return;
          }
          prefs.edit().putBoolean("stopping", true).apply();
          try {
            startForegroundService(new Intent(this, LocationService.class).setAction("STOP"));
          } catch (Exception e) {
            stopService(new Intent(this, LocationService.class));
          }
          new Thread(
                  () -> {
                    try {
                      Api.call(
                          prefs.getString("base", ""),
                          "/api/sessions/" + prefs.getString("id", ""),
                          "DELETE",
                          prefs.getString("owner", ""),
                          null);
                      clearSession();
                    } catch (Api.Ended e) {
                      clearSession();
                    } catch (Exception e) {
                      runOnUiThread(() -> say("종료 대기 · 서버 연결 후 다시 시도하세요."));
                    }
                  })
              .start();
        });
    TextView note = new TextView(this);
    note.setText(
        "내 위치와 목적지는 지정한 서버 및 공유 링크를 가진 사람에게 전달됩니다. 이동 이력은 저장하지 않습니다. 강제 종료·위치 권한 해제·통신 단절 시 갱신이 중단될"
            + " 수 있습니다. 종료 요청은 서버 확인 후 완료되며 링크는 최대 1시간 후 만료됩니다. 운전 중 조작하지 마세요.");
    box.addView(note);
  }

  void clearSession() {
    prefs
        .edit()
        .remove("id")
        .remove("owner")
        .remove("url")
        .remove("expires")
        .remove("stopping")
        .apply();
    stopService(new Intent(this, LocationService.class));
    runOnUiThread(() -> say("공유 종료 · 링크가 폐기되었습니다."));
  }

  Button button(LinearLayout b, String text, android.view.View.OnClickListener click) {
    Button x = new Button(this);
    x.setText(text);
    x.setOnClickListener(click);
    b.addView(x);
    return x;
  }

  void say(String text) {
    state.setText(text);
    prefs.edit().putString("status", text).apply();
  }

  void begin() {
    if (prefs.getBoolean("creating", false)) {
      say("공유 링크 준비 중입니다.");
      return;
    }
    if (!prefs.getString("id", "").isEmpty()) {
      try {
        startForegroundService(new Intent(this, LocationService.class));
        say("기존 공유 연결을 다시 시작합니다.");
      } catch (Exception e) {
        say("위치 권한을 확인하거나 공유를 종료하세요.");
      }
      return;
    }
    if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
      requestPermissions(
          new String[] {
            Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION
          },
          1);
      return;
    }
    if (Build.VERSION.SDK_INT >= 33
        && !prefs.getBoolean("askedNotification", false)
        && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED) {
      prefs.edit().putBoolean("askedNotification", true).apply();
      requestPermissions(new String[] {Manifest.permission.POST_NOTIFICATIONS}, 2);
      say("알림 권한을 선택한 후 공유 시작을 다시 누르세요.");
      return;
    }
    String base = server.getText().toString().trim().replaceAll("/+$", "");
    String secret = key.getText().toString().trim();
    try {
      URI u = new URI(base);
      if (!"https".equals(u.getScheme())
          || u.getHost() == null
          || u.getUserInfo() != null
          || u.getQuery() != null
          || u.getFragment() != null
          || !u.getPath().isEmpty()) throw new Exception();
    } catch (Exception e) {
      say("경로 없는 HTTPS 서버 주소를 입력하세요.");
      return;
    }
    if (secret.length() < 32) {
      say("서버 연결 키를 입력하세요.");
      return;
    }
    try {
      startForegroundService(new Intent(this, LocationService.class).setAction("PREPARE"));
    } catch (Exception e) {
      say("앱을 연 상태에서 위치 권한을 확인하고 다시 시도하세요.");
      return;
    }
    prefs
        .edit()
        .putString("base", base)
        .putBoolean("creating", true)
        .putBoolean("cancelCreate", false)
        .apply();
    start.setEnabled(false);
    say("공유 링크를 만들고 있습니다.");
    new Thread(
            () -> {
              try {
                JSONObject result =
                    Api.call(
                        base,
                        "/api/sessions",
                        "POST",
                        secret,
                        new JSONObject().put("ttlSeconds", 3600));
                boolean cancelled = prefs.getBoolean("cancelCreate", false);
                prefs
                    .edit()
                    .putBoolean("creating", false)
                    .putString("id", result.getString("id"))
                    .putString("owner", result.getString("owner"))
                    .putString("url", result.getString("url"))
                    .putLong("expires", result.getLong("expires"))
                    .putBoolean("stopping", cancelled)
                    .apply();
                runOnUiThread(
                    () -> {
                      key.setText("");
                      start.setEnabled(true);
                      try {
                        startForegroundService(
                            new Intent(this, LocationService.class)
                                .setAction(cancelled ? "STOP" : "START"));
                        say(cancelled ? "공유 시작 취소 · 링크 폐기 요청 중" : "공유 시작 · 위치를 확인하고 있습니다.");
                      } catch (Exception e) {
                        say("앱을 연 상태에서 다시 실행하거나 공유를 종료하세요.");
                      }
                    });
              } catch (Exception e) {
                runOnUiThread(
                    () -> {
                      prefs.edit().putBoolean("creating", false).apply();
                      stopService(new Intent(this, LocationService.class));
                      start.setEnabled(true);
                      say("서버 연결 실패. 주소와 연결 키를 확인하세요.");
                    });
              }
            })
        .start();
  }

  @Override
  public void onRequestPermissionsResult(int r, String[] p, int[] g) {
    super.onRequestPermissionsResult(r, p, g);
    say("권한 설정 후 공유 시작을 다시 누르세요.");
  }

  @Override
  protected void onResume() {
    super.onResume();
    handler.post(refresh);
    if (prefs != null
        && !prefs.getString("id", "").isEmpty()
        && System.currentTimeMillis() >= prefs.getLong("expires", 0))
      prefs
          .edit()
          .remove("id")
          .remove("owner")
          .remove("url")
          .putString("status", "공유 시간이 만료되었습니다.")
          .apply();
  }

  @Override
  protected void onPause() {
    handler.removeCallbacks(refresh);
    super.onPause();
  }
}
