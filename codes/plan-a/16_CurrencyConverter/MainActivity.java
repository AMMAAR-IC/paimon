package com.example.practical_exam;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    EditText etAmount;
    Button btnInrToUsd, btnUsdToInr;
    TextView tvResult;
    double rate = 83.0; // 1 USD = 83 INR (static demo rate)

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etAmount = findViewById(R.id.etAmount);
        btnInrToUsd = findViewById(R.id.btnInrToUsd);
        btnUsdToInr = findViewById(R.id.btnUsdToInr);
        tvResult = findViewById(R.id.tvResult);

        btnInrToUsd.setOnClickListener(v -> {
            String input = etAmount.getText().toString();
            if (input.isEmpty()) { tvResult.setText("Enter amount"); return; }
            double inr = Double.parseDouble(input);
            tvResult.setText("USD: " + (inr / rate));
        });

        btnUsdToInr.setOnClickListener(v -> {
            String input = etAmount.getText().toString();
            if (input.isEmpty()) { tvResult.setText("Enter amount"); return; }
            double usd = Double.parseDouble(input);
            tvResult.setText("INR: " + (usd * rate));
        });
    }
}
