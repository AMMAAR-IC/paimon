package com.example.practical_exam;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    EditText etTemp;
    Button btnCtoF, btnFtoC;
    TextView tvResult;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etTemp = findViewById(R.id.etTemp);
        btnCtoF = findViewById(R.id.btnCtoF);
        btnFtoC = findViewById(R.id.btnFtoC);
        tvResult = findViewById(R.id.tvResult);

        btnCtoF.setOnClickListener(v -> {
            String input = etTemp.getText().toString();
            if (input.isEmpty()) { tvResult.setText("Enter value"); return; }
            double c = Double.parseDouble(input);
            double f = (c * 9 / 5) + 32;
            tvResult.setText("Fahrenheit: " + f);
        });

        btnFtoC.setOnClickListener(v -> {
            String input = etTemp.getText().toString();
            if (input.isEmpty()) { tvResult.setText("Enter value"); return; }
            double f = Double.parseDouble(input);
            double c = (f - 32) * 5 / 9;
            tvResult.setText("Celsius: " + c);
        });
    }
}
