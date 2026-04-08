package com.example.practical_exam;

import android.app.TimePickerDialog;
import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Calendar;

public class MainActivity extends AppCompatActivity {

    Button btnPickTime;
    TextView tvTime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnPickTime = findViewById(R.id.btnPickTime);
        tvTime = findViewById(R.id.tvTime);

        btnPickTime.setOnClickListener(v -> {
            Calendar cal = Calendar.getInstance();
            new TimePickerDialog(MainActivity.this,
                    (view, h, min) -> tvTime.setText("Selected Time: " + h + ":" + min),
                    cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE), true
            ).show();
        });
    }
}
