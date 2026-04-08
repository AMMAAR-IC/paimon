package com.example.practical_exam;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    Button btnOn, btnOff;
    WifiManager wifiManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnOn = findViewById(R.id.btnOn);
        btnOff = findViewById(R.id.btnOff);
        wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);

        btnOn.setOnClickListener(v -> {
            if (!wifiManager.isWifiEnabled()) {
                wifiManager.setWifiEnabled(true);
                Toast.makeText(this, "Wi-Fi Turned ON", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Wi-Fi already ON", Toast.LENGTH_SHORT).show();
            }
        });

        btnOff.setOnClickListener(v -> {
            if (wifiManager.isWifiEnabled()) {
                wifiManager.setWifiEnabled(false);
                Toast.makeText(this, "Wi-Fi Turned OFF", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Wi-Fi already OFF", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
