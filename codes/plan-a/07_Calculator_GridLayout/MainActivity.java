package com.example.practical_exam;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    TextView tvResult;
    String current = "";
    double num1 = 0, num2 = 0;
    String operator = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        tvResult = findViewById(R.id.tvResult);
        GridLayout grid = findViewById(R.id.gridLayout);

        for (int i = 0; i < grid.getChildCount(); i++) {
            View v = grid.getChildAt(i);
            if (v instanceof Button) ((Button) v).setOnClickListener(this::onButtonClick);
        }
    }

    public void onButtonClick(View v) {
        String text = ((Button) v).getText().toString();

        if (text.matches("[0-9]")) {
            current += text;
            tvResult.setText(current);
        } else if (text.matches("[+\\-*/]")) {
            if (!current.isEmpty()) {
                num1 = Double.parseDouble(current);
                operator = text;
                current = "";
            }
        } else if (text.equals("=")) {
            if (!current.isEmpty()) {
                num2 = Double.parseDouble(current);
                double result = 0;
                switch (operator) {
                    case "+": result = num1 + num2; break;
                    case "-": result = num1 - num2; break;
                    case "*": result = num1 * num2; break;
                    case "/":
                        if (num2 != 0) result = num1 / num2;
                        else { tvResult.setText("Error"); return; }
                        break;
                }
                tvResult.setText(String.valueOf(result));
                current = String.valueOf(result);
            }
        } else if (text.equals("C")) {
            current = ""; num1 = num2 = 0; operator = "";
            tvResult.setText("0");
        }
    }
}
