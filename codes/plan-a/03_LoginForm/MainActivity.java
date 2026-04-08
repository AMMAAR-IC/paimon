package com.example.practical_exam;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    EditText etUsername, etPassword;
    CheckBox checkRemember;
    RadioGroup radioGroup;
    Button btnLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        checkRemember = findViewById(R.id.checkRemember);
        radioGroup = findViewById(R.id.radioGroup);
        btnLogin = findViewById(R.id.btnLogin);

        btnLogin.setOnClickListener(v -> {
            String username = etUsername.getText().toString();
            String password = etPassword.getText().toString();
            int selectedId = radioGroup.getCheckedRadioButtonId();
            RadioButton selectedRadio = findViewById(selectedId);

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(MainActivity.this, "Please enter all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            String message = "Login Successful\nUser: " + username;
            if (selectedRadio != null) message += "\nGender: " + selectedRadio.getText();
            if (checkRemember.isChecked()) message += "\nRemember Me: Enabled";

            Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
        });
    }
}
