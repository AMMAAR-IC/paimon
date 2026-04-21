# Paimon 🌟

Your sneaky code companion CLI — browse and copy boilerplate code right into your working directory.

## Install

### Using Winget
```powershell
winget install Ammaar.Paimon
```

### Using Scoop
```powershell
scoop install https://raw.githubusercontent.com/AmmaarBakshi/paimon/main/paimon.json
```

### Using NPM
```bash
npm install -g paimon-npm
```


## Usage

```powershell
paimon --code -ls
```

**Controls:**
- **Arrow keys / h,j,k,l**: Navigate the list
- **ENTER / l**: Open a folder or copy a file to the current directory
- **Backspace / h / ←**: Go back to the previous directory
- **c**: Copy the selected file/folder without entering (NPM version)
- **q / ESC**: Quit the application


## Adding your own codes

Just drop files/folders into the `codes/` directory and rebuild:

```
cargo build --release
```

The codes are **embedded inside the .exe** at compile time — no internet, no Python, nothing extra needed.

## Publish to Winget

1. Fork [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs)
2. Add your manifests under `manifests/a/Ammaar/Paimon/0.2.0/`
3. Open a PR — Microsoft bot auto-validates it
4. Once merged: `winget install Ammaar.Paimon` works for everyone


## Project structure

```text
paimon/
├── src/
│   └── main.rs        ← TUI navigator + copy logic
├── codes/             ← Embedded snippets directory
│   └── plan-a/        ← Android practicals/boilerplates
├── paimon-npm/        ← Node.js wrapper/implementation
└── Cargo.toml         ← Rust project config
```

