package com.example.practical_exam;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    Button btnBuy;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnBuy = findViewById(R.id.btnBuy);
        btnBuy.setOnClickListener(v ->
                Toast.makeText(this, "Item Added to Cart", Toast.LENGTH_SHORT).show());
    }
}
