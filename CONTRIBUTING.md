# Contributing to Paimon 🌟

First of all, thank you for taking the time to contribute! Paimon is built on the philosophy that **building is the best way to understand**, and your contributions help other developers build faster.

By participating in this project, you help maintain a high-performance, zero-dependency toolkit for the developer community.

---

## 🧭 Table of Contents
- [How Can I Contribute?](#-how-can-i-contribute)
- [Adding New Snippets (No Rust knowledge needed)](#-adding-new-snippets)
- [Core Development (Rust)](#-core-development)
- [Pull Request Guidelines](#-pull-request-guidelines)
- [Distribution & Manifests](#-distribution--manifests)

---

## 🛠 How Can I Contribute?

### 1. Adding New Snippets
This is the easiest way to contribute! If you have optimized boilerplates, DSA solutions, or project starters, you can add them to the internal library.

### 2. Improving the TUI
Paimon uses a keyboard-driven interface. If you're a Rustacean, you can help by:
- Enhancing the navigation logic in `src/main.rs`.
- Adding search/filter functionality.
- Improving cross-platform terminal compatibility (Windows/Linux/macOS).

### 3. Bug Reports & Feature Requests
If you find a bug or have an idea for a new flag (e.g., `--update` or `--search`), please open an **Issue**.

---

## 📂 Adding New Snippets
Paimon embeds files into the binary at compile-time. To add your own:

1.  Navigate to the `codes/` directory.
2.  Find or create the appropriate language folder (e.g., `codes/python/`).
3.  Add your `.py`, `.java`, `.c`, or `.rs` file.
4.  **Requirement:** Ensure the code is clean, well-commented, and standalone.
5.  Rebuild to test: `cargo run -- --code -ls`.

---

## 🦀 Core Development

### Prerequisites
- [Rust & Cargo](https://rustup.rs/) (Stable)
- A terminal emulator (Alacritty, iTerm2, or Windows Terminal recommended)

### Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/paimon.git
cd paimon

# Build and run
cargo build
cargo run -- --code -ls
```