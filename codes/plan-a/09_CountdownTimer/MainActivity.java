package com.example.practical_exam;

import android.os.Bundle;
import android.os.CountDownTimer;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    EditText etTime;
    Button btnStart;
    TextView tvTimer;
    CountDownTimer timer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etTime = findViewById(R.id.etTime);
        btnStart = findViewById(R.id.btnStart);
        tvTimer = findViewById(R.id.tvTimer);

        btnStart.setOnClickListener(v -> {
            String input = etTime.getText().toString();
            if (input.isEmpty()) { tvTimer.setText("Enter time!"); return; }
            int seconds = Integer.parseInt(input);

            timer = new CountDownTimer(seconds * 1000, 1000) {
                @Override public void onTick(long ms) { tvTimer.setText("Time: " + (ms / 1000)); }
                @Override public void onFinish() { tvTimer.setText("Done!"); }
            }.start();
        });
    }
}
