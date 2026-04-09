# Paimon 🌟

Your sneaky code companion CLI — browse and copy boilerplate code right into your working directory.

## Install

```bash
npm install -g paimon-cli
```

## Usage

```bash
paimon --code -ls
```

Arrow keys to navigate, ENTER to copy a file (or open a folder), ← to go back, q to quit.

## Adding your own codes

Just drop files/folders into the `codes/` directory inside the package:

```
~/.npm-global/lib/node_modules/paimon-cli/codes/
```

Or find it with:
```bash
npm root -g
```

Then navigate to `paimon-cli/codes/` and add your files.

## Controls

| Key | Action |
|-----|--------|
| ↑ / k | Move up |
| ↓ / j | Move down |
| ENTER / → | Copy file or open folder |
| ← / Backspace | Go back |
| q / ESC | Quit |
