use clap::Parser;
use inquire::{Confirm, Select};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Parser)]
#[command(name = "paimon", about = "CLI code snippet manager", version = "1.0")]
struct Cli {
    #[arg(long)]
    code: bool,

    #[arg(short, long)]
    ls: bool,
}

fn main() {
    let cli = Cli::parse();

    // Locates /codes folder next to the paimon.exe
    let exe_path = env::current_exe().expect("Failed to get exe path");
    let program_dir = exe_path.parent().expect("Failed to get program directory");
    let codes_dir = program_dir.join("codes");

    if cli.code && cli.ls {
        browse_paimon(&codes_dir);
    } else {
        let total = count_snippets(&codes_dir);
        println!("\n  paimon v1.0 | {} snippet(s) ready", total);
        println!("  usage: paimon --code -ls\n");
    }
}

fn count_snippets(dir: &Path) -> usize {
    WalkDir::new(dir).into_iter().filter_map(|e| e.ok()).filter(|e| e.file_type().is_file()).count()
}

fn browse_paimon(base_dir: &Path) {
    let mut current_path = base_dir.to_path_buf();
    let mut history = Vec::new();

    loop {
        let mut choices = Vec::new();
        if current_path != base_dir { choices.push(".. (back)".to_string()); }

        let entries = fs::read_dir(&current_path).expect("Cannot access codes/");
        let mut items: Vec<_> = entries.filter_map(|e| e.ok()).collect();
        items.sort_by_key(|e| (e.file_type().unwrap().is_file(), e.file_name()));

        for entry in items {
            let name = entry.file_name().into_string().unwrap();
            if entry.path().is_dir() { choices.push(format!("📁 {}/", name)); } 
            else { choices.push(format!("📄 {}", name)); }
        }
        choices.push("✖ Exit".to_string());

        let rel = current_path.strip_prefix(base_dir).unwrap().display();
        let selection = Select::new(&format!("paimon: codes/{}/", rel), choices).prompt();

        match selection {
            Ok(choice) if choice == "✖ Exit" => break,
            Ok(choice) if choice == ".. (back)" => {
                if let Some(prev) = history.pop() { current_path = prev; }
            }
            Ok(choice) => {
                let name = choice.replace("📁 ", "").replace("📄 ", "").replace("/", "");
                let target = current_path.join(&name);

                if target.is_dir() {
                    history.push(current_path.clone());
                    current_path = target;
                } else {
                    perform_copy(&target, &name);
                    if !Confirm::new("Copy another?").with_default(true).prompt().unwrap_or(false) { break; }
                }
            }
            _ => break,
        }
    }
}

fn perform_copy(src: &Path, name: &str) {
    let dest = env::current_dir().unwrap().join(name);
    if dest.exists() && !Confirm::new(&format!("Overwrite '{}'?", name)).with_default(false).prompt().unwrap_or(false) { return; }

    let res = if src.is_dir() {
        let mut opt = fs_extra::dir::CopyOptions::new();
        opt.overwrite = true;
        opt.copy_inside = true;
        fs_extra::dir::copy(src, &dest, &opt).map(|_| ())
    } else {
        fs::copy(src, &dest).map(|_| ())
    };

    match res {
        Ok(_) => println!("✓ Copied: {}", name),
        Err(e) => println!("Error: {}", e),
    }
}