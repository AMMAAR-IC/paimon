use crossterm::{
    cursor,
    event::{self, Event, KeyCode, KeyEvent},
    execute, queue,
    style::{self, Color, Stylize},
    terminal::{self, ClearType},
};
use include_dir::{include_dir, Dir};
use std::env;
use std::fs;
use std::io::{self, Write};
use std::path::Path;

static CODES_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/codes");

#[derive(Debug, Clone)]
enum Entry {
    File { name: String, path: String },
    Dir  { name: String, path: String },
}

impl Entry {
    fn name(&self) -> &str { match self { Entry::File{name,..}|Entry::Dir{name,..} => name } }
    fn path(&self) -> &str { match self { Entry::File{path,..}|Entry::Dir{path,..} => path } }
    fn is_dir(&self) -> bool { matches!(self, Entry::Dir{..}) }
}

// ── Natural sort: compares numeric segments numerically so "2" < "10" ─────────
fn natural_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    let mut ai = a.chars().peekable();
    let mut bi = b.chars().peekable();
    loop {
        match (ai.peek(), bi.peek()) {
            (None, None) => return std::cmp::Ordering::Equal,
            (None, _)    => return std::cmp::Ordering::Less,
            (_, None)    => return std::cmp::Ordering::Greater,
            (Some(ac), Some(bc)) => {
                let ac_digit = ac.is_ascii_digit();
                let bc_digit = bc.is_ascii_digit();
                if ac_digit && bc_digit {
                    // collect full number from each side
                    let na: u64 = {
                        let s: String = ai.by_ref().take_while(|c| c.is_ascii_digit()).collect();
                        s.parse().unwrap_or(0)
                    };
                    let nb: u64 = {
                        let s: String = bi.by_ref().take_while(|c| c.is_ascii_digit()).collect();
                        s.parse().unwrap_or(0)
                    };
                    let ord = na.cmp(&nb);
                    if ord != std::cmp::Ordering::Equal { return ord; }
                } else {
                    let ac = ai.next().unwrap().to_ascii_lowercase();
                    let bc = bi.next().unwrap().to_ascii_lowercase();
                    let ord = ac.cmp(&bc);
                    if ord != std::cmp::Ordering::Equal { return ord; }
                }
            }
        }
    }
}

fn list_entries(dir_path: &str) -> Vec<Entry> {
    let mut out = Vec::new();
    let target = if dir_path.is_empty() {
        &CODES_DIR
    } else {
        match CODES_DIR.get_dir(dir_path) { Some(d) => d, None => return out }
    };
    for sub in target.dirs() {
        let name = sub.path().file_name().unwrap_or_default().to_string_lossy().into_owned();
        let path = sub.path().to_string_lossy().into_owned();
        out.push(Entry::Dir { name, path });
    }
    for f in target.files() {
        let name = f.path().file_name().unwrap_or_default().to_string_lossy().into_owned();
        let path = f.path().to_string_lossy().into_owned();
        out.push(Entry::File { name, path });
    }

    // Sort: dirs first (alphabetically), then files in natural order
    out.sort_by(|a, b| {
        match (a.is_dir(), b.is_dir()) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _             => natural_cmp(a.name(), b.name()),
        }
    });

    // after sort, remove duplicate names
out.dedup_by(|a, b| a.name() == b.name());

    out
}

fn copy_entry_to_cwd(entry: &Entry) -> io::Result<String> {
    let cwd = env::current_dir()?;
    match entry {
        Entry::File { path, name } => {
            let f = CODES_DIR.get_file(path)
                .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "not found"))?;
            let dest = cwd.join(name);
            fs::write(&dest, f.contents())?;
            Ok(format!("Copied {} -> {}", name, dest.display()))
        }
        Entry::Dir { path, name } => {
            let d = CODES_DIR.get_dir(path)
                .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "not found"))?;
            let dest = cwd.join(name);
            copy_dir_recursive(d, &dest)?;
            Ok(format!("Copied folder {} -> {}", name, dest.display()))
        }
    }
}

fn copy_dir_recursive(dir: &include_dir::Dir, dest: &Path) -> io::Result<()> {
    fs::create_dir_all(dest)?;
    for f in dir.files() {
        let fname = f.path().file_name().unwrap_or_default();
        fs::write(dest.join(fname), f.contents())?;
    }
    for sub in dir.dirs() {
        let dname = sub.path().file_name().unwrap_or_default();
        copy_dir_recursive(sub, &dest.join(dname))?;
    }
    Ok(())
}

fn count_all(dir: &include_dir::Dir) -> usize {
    dir.files().count() + dir.dirs().map(count_all).sum::<usize>()
}

struct App {
    nav_stack: Vec<(String, usize)>,
    entries:   Vec<Entry>,
    selected:  usize,
    status:    Option<(String, bool)>,
}

impl App {
    fn new() -> Self {
        App {
            nav_stack: vec![("".into(), 0)],
            entries:   list_entries(""),
            selected:  0,
            status:    None,
        }
    }
    fn breadcrumb(&self) -> String {
        self.nav_stack.iter()
            .map(|(p,_)| if p.is_empty() { "codes" } else { p.split('/').last().unwrap_or("codes") })
            .collect::<Vec<_>>().join(" / ")
    }
    fn enter_dir(&mut self, path: String) {
        self.nav_stack.last_mut().unwrap().1 = self.selected;
        self.nav_stack.push((path.clone(), 0));
        self.entries  = list_entries(&path);
        self.selected = 0;
    }
    fn go_back(&mut self) {
        if self.nav_stack.len() > 1 { self.nav_stack.pop(); }
        let (p, s) = self.nav_stack.last().unwrap().clone();
        self.entries  = list_entries(&p);
        self.selected = s.min(self.entries.len().saturating_sub(1));
    }
}

fn render(app: &App, out: &mut impl Write) -> io::Result<()> {
    let (cols, rows) = terminal::size()?;
    queue!(out, terminal::Clear(ClearType::All), cursor::MoveTo(0,0))?;

    // Header
    let blank = " ".repeat(cols as usize);
    queue!(out, cursor::MoveTo(0,0))?;
    queue!(out, style::PrintStyledContent(blank.clone().on(Color::Rgb{r:25,g:25,b:45})))?;
    queue!(out, cursor::MoveTo(0,0))?;
    queue!(out, style::PrintStyledContent(
        format!(" \u{2728} PAIMON  v0.2.0 ")
            .with(Color::Rgb{r:255,g:220,b:100}).on(Color::Rgb{r:25,g:25,b:45}).bold()
    ))?;

    // Breadcrumb
    queue!(out, cursor::MoveTo(0,1))?;
    queue!(out, style::PrintStyledContent(
        format!(" \u{1F4C2} {} ", app.breadcrumb())
            .with(Color::Rgb{r:130,g:190,b:255}).on(Color::Rgb{r:18,g:18,b:35})
    ))?;

    // Info bar
    let total = count_all(&CODES_DIR);
    queue!(out, cursor::MoveTo(0,2))?;
    queue!(out, style::PrintStyledContent(
        format!(" {} files bundled | {} here | ENTER=copy  \u{2190}=back  q=quit ", total, app.entries.len())
            .with(Color::Rgb{r:90,g:90,b:120})
    ))?;

    // Divider
    queue!(out, cursor::MoveTo(0,3))?;
    queue!(out, style::PrintStyledContent(
        "\u{2500}".repeat(cols as usize).with(Color::Rgb{r:55,g:55,b:85})
    ))?;

    // List
    let list_rows = rows.saturating_sub(7) as usize;
    let scroll    = if app.selected >= list_rows { app.selected - list_rows + 1 } else { 0 };

    for (i, entry) in app.entries.iter().enumerate().skip(scroll).take(list_rows) {
        let row = 4u16 + (i - scroll) as u16;
        queue!(out, cursor::MoveTo(0, row))?;

        let icon = if entry.is_dir() { "📁" } else {
            match entry.name().rsplit('.').next().unwrap_or("") {
                "java" => "☕", "c" => "🔵", "cpp" => "🔷",
                "py"   => "🐍", "rs" => "🦀",
                "js"   => "🟨", _ => "📄",
            }
        };
        let label = format!(" {} {} ", icon, entry.name());

        if i == app.selected {
            let padded = format!("{:<width$}", label, width = cols as usize);
            queue!(out, style::PrintStyledContent(
                padded.with(Color::Rgb{r:10,g:10,b:20}).on(Color::Rgb{r:255,g:215,b:80}).bold()
            ))?;
        } else {
            let color = if entry.is_dir() { Color::Rgb{r:130,g:190,b:255} }
                        else { Color::Rgb{r:200,g:200,b:220} };
            queue!(out, style::PrintStyledContent(label.with(color)))?;
        }
    }

    // Status bar
    let sr = rows.saturating_sub(2);
    queue!(out, cursor::MoveTo(0, sr))?;
    queue!(out, style::PrintStyledContent(
        "\u{2500}".repeat(cols as usize).with(Color::Rgb{r:55,g:55,b:85})
    ))?;
    queue!(out, cursor::MoveTo(0, sr+1))?;
    match &app.status {
        Some((msg, is_err)) => {
            let col = if *is_err { Color::Rgb{r:255,g:80,b:80} } else { Color::Rgb{r:80,g:255,b:150} };
            queue!(out, style::PrintStyledContent(format!(" \u{2726} {} ", msg).with(col).bold()))?;
        }
        None => {
            queue!(out, style::PrintStyledContent(
                " \u{2726} Use arrow keys to navigate, ENTER to copy to current directory "
                    .with(Color::Rgb{r:90,g:90,b:120})
            ))?;
        }
    }
    out.flush()
}

fn run_tui() -> io::Result<()> {
    let mut stdout = io::stdout();
    terminal::enable_raw_mode()?;
    execute!(stdout, terminal::EnterAlternateScreen, cursor::Hide)?;

    let mut app = App::new();
    let mut last_status: Option<(String, bool)> = None;

    loop {
        app.status = last_status.clone();
        render(&app, &mut stdout)?;
        last_status = None;

        if let Event::Key(KeyEvent { code, kind, .. }) = event::read()? {
            // ✅ THIS IS THE FIX — ignore key release and repeat events
            if kind != event::KeyEventKind::Press { continue; }

            match code {
                KeyCode::Up   | KeyCode::Char('k') => {
                    if app.selected > 0 { app.selected -= 1; }
                }
                KeyCode::Down | KeyCode::Char('j') => {
                    if app.selected + 1 < app.entries.len() { app.selected += 1; }
                }
                KeyCode::Left | KeyCode::Backspace | KeyCode::Char('h') => {
                    app.go_back();
                }
                KeyCode::Enter | KeyCode::Char('l') => {
                    if app.entries.is_empty() {
                        last_status = Some(("Empty folder.".into(), true));
                        continue;
                    }
                    let entry = app.entries[app.selected].clone();
                    if entry.is_dir() {
                        app.enter_dir(entry.path().to_string());
                    } else {
                        match copy_entry_to_cwd(&entry) {
                            Ok(msg)  => last_status = Some((msg, false)),
                            Err(e)   => last_status = Some((format!("Error: {}", e), true)),
                        }
                    }
                }
                KeyCode::Right | KeyCode::Char('c') => {
                    if app.entries.is_empty() {
                        last_status = Some(("Empty folder.".into(), true));
                        continue;
                    }
                    let entry = app.entries[app.selected].clone();
                    match copy_entry_to_cwd(&entry) {
                        Ok(msg)  => last_status = Some((msg, false)),
                        Err(e)   => last_status = Some((format!("Error: {}", e), true)),
                    }
                }
                KeyCode::Char('q') | KeyCode::Esc => break,
                _ => {}
            }
        }
    }

    execute!(stdout, terminal::LeaveAlternateScreen, cursor::Show)?;
    terminal::disable_raw_mode()?;
    Ok(())
}

fn print_help() {
    println!("\n  \u{2728}  PAIMON - Your sneaky code companion\n");
    println!("  USAGE:");
    println!("    paimon --code -ls       Open interactive code browser");
    println!("    paimon --help           Show this help\n");
    println!("  CONTROLS:");
    println!("    \u{2191} k        Move up");
    println!("    \u{2193} j        Move down");
    println!("    ENTER \u{2192}   Select file (copies to cwd) or open folder");
    println!("    \u{2190} Bksp    Go back");
    println!("    q / ESC   Quit\n");
    println!("  Files are copied to wherever you ran paimon from.\n");
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() >= 3 && args[1] == "--code" && args[2] == "-ls" {
        if let Err(e) = run_tui() { eprintln!("Error: {e}"); std::process::exit(1); }
    } else if args.len() >= 2 && (args[1] == "--help" || args[1] == "-h") {
        print_help();
    } else if args.len() == 1 {
        print_help();
    } else {
        eprintln!("Unknown command. Try: paimon --code -ls");
        std::process::exit(1);
    }
}