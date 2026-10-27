package com.kintheusa.location;

import java.io.*;
import java.net.*;
import org.json.*;

final class Api {
  static JSONObject call(String base, String path, String method, String key, JSONObject data)
      throws Exception {
    URL url = new URL(base + path);
    if (!url.getProtocol().equals("https")) throw new IOException("HTTPS 서버 주소가 필요합니다.");
    HttpURLConnection c = (HttpURLConnection) url.openConnection();
    c.setInstanceFollowRedirects(false);
    c.setConnectTimeout(10000);
    c.setReadTimeout(10000);
    c.setRequestMethod(method);
    c.setRequestProperty("Authorization", "Bearer " + key);
    c.setRequestProperty("Content-Type", "application/json");
    try {
      if (data != null) {
        c.setDoOutput(true);
        try (OutputStream out = c.getOutputStream()) {
          out.write(data.toString().getBytes("UTF-8"));
        }
      }
      int status = c.getResponseCode();
      if (status == 404) throw new Ended();
      if (status < 200 || status >= 300) throw new IOException("서버 요청 실패 (" + status + ")");
      try (InputStream in = c.getInputStream()) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = in.read(buf)) != -1) {
          out.write(buf, 0, n);
          if (out.size() > 2000000) throw new IOException("응답 크기 초과");
        }
        return new JSONObject(out.toString("UTF-8"));
      }
    } finally {
      c.disconnect();
    }
  }

  static final class Ended extends IOException {}
}
