package com.example.practical_exam;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class SecondActivity extends AppCompatActivity {

    TextView tvWelcome;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_second);

        tvWelcome = findViewById(R.id.tvWelcome);
        String username = getIntent().getStringExtra("username");
        tvWelcome.setText("Welcome " + username);
    }
}
