package com.example.practical_exam;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    CheckBox check1, check2;
    RadioGroup radioGroup;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        check1 = findViewById(R.id.check1);
        check2 = findViewById(R.id.check2);
        radioGroup = findViewById(R.id.radioGroup);

        check1.setOnClickListener(v -> showMessage());
        check2.setOnClickListener(v -> showMessage());

        radioGroup.setOnCheckedChangeListener((group, checkedId) -> {
            RadioButton selected = findViewById(checkedId);
            Toast.makeText(MainActivity.this, "Selected: " + selected.getText(), Toast.LENGTH_SHORT).show();
        });
    }

    private void showMessage() {
        String result = "Selected: ";
        if (check1.isChecked()) result += "Cricket ";
        if (check2.isChecked()) result += "Football ";
        Toast.makeText(this, result, Toast.LENGTH_SHORT).show();
    }
}
