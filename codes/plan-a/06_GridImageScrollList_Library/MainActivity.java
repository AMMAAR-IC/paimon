package com.example.practical_exam;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    GridView gridView;
    ListView listView;

    String[] books = {"Java Programming", "Python Basics", "Android Dev",
                      "Data Structures", "DBMS", "AI Concepts"};

    int[] images = {android.R.drawable.ic_menu_gallery, android.R.drawable.ic_menu_gallery,
                    android.R.drawable.ic_menu_gallery, android.R.drawable.ic_menu_gallery,
                    android.R.drawable.ic_menu_gallery, android.R.drawable.ic_menu_gallery};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        gridView = findViewById(R.id.gridView);
        listView = findViewById(R.id.listView);

        gridView.setAdapter(new BaseAdapter() {
            @Override public int getCount() { return images.length; }
            @Override public Object getItem(int pos) { return images[pos]; }
            @Override public long getItemId(int pos) { return pos; }
            @Override public View getView(int pos, View convertView, android.view.ViewGroup parent) {
                ImageView iv = new ImageView(MainActivity.this);
                iv.setLayoutParams(new GridView.LayoutParams(200, 200));
                iv.setImageResource(images[pos]);
                return iv;
            }
        });

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this, android.R.layout.simple_list_item_1, books);
        listView.setAdapter(adapter);

        listView.setOnItemClickListener((parent, view, position, id) ->
                Toast.makeText(this, books[position], Toast.LENGTH_SHORT).show());
    }
}
