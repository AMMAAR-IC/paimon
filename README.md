# Paimon 🌟

Your sneaky code companion CLI — browse and copy boilerplate code right into your working directory.

## Install

```
winget install Ammaar.Paimon
```

## Usage

```
paimon --code -ls
```

Arrow keys to navigate, ENTER to copy a file (or open a folder), ← to go back, q to quit.

## Adding your own codes

Just drop files/folders into the `codes/` directory and rebuild:

```
cargo build --release
```

The codes are **embedded inside the .exe** at compile time — no internet, no Python, nothing extra needed.

## Publish to winget

1. Fork https://github.com/microsoft/winget-pkgs
2. Add your manifests under `manifests/a/Ammaar/Paimon/0.1.0/`
3. Open a PR — Microsoft bot auto-validates it
4. Once merged: `winget install Ammaar.Paimon` works for everyone

## Project structure

```
paimon/
├── src/
│   └── main.rs        ← TUI navigator + copy logic
├── codes/
│   ├── java/          ← Java practicals
│   ├── c/             ← C practicals
│   └── cpp/           ← C++ practicals
└── Cargo.toml
```
