#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');

// ── resolve codes dir ────────────────────────────────────────────────────────
const CODES_DIR = path.join(__dirname, '..', 'codes');

// ── helpers ──────────────────────────────────────────────────────────────────
function naturalCmp(a, b) {
  const re = /(\d+)|(\D+)/g;
  const pa = a.match(re) || [];
  const pb = b.match(re) || [];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const ca = pa[i] || '';
    const cb = pb[i] || '';
    const na = parseInt(ca, 10);
    const nb = parseInt(cb, 10);
    if (!isNaN(na) && !isNaN(nb)) {
      if (na !== nb) return na - nb;
    } else {
      if (ca < cb) return -1;
      if (ca > cb) return  1;
    }
  }
  return 0;
}

function listEntries(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const items = fs.readdirSync(dirPath);
  const dirs  = [];
  const files = [];
  for (const item of items) {
    const full = path.join(dirPath, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) dirs.push(item);
    else                    files.push(item);
  }
  dirs.sort(naturalCmp);
  files.sort(naturalCmp);
  return [
    ...dirs.map(n  => ({ name: n, full: path.join(dirPath, n),  isDir: true  })),
    ...files.map(n => ({ name: n, full: path.join(dirPath, n),  isDir: false })),
  ];
}

function countAll(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  for (const item of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, item);
    if (fs.statSync(full).isDirectory()) count += countAll(full);
    else count++;
  }
  return count;
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function getIcon(name, isDir) {
  if (isDir) return '📁';
  const ext = name.split('.').pop().toLowerCase();
  const map  = { java:'☕', c:'🔵', cpp:'🔷', py:'🐍', js:'🟨', ts:'🔷', rs:'🦀', xml:'📋', json:'📦' };
  return map[ext] || '📄';
}

// ── TUI ──────────────────────────────────────────────────────────────────────
function runTUI() {
  let blessed;
  try { blessed = require('blessed'); }
  catch (e) {
    console.error('Missing dependency. Run: npm install -g paimon-npm');
    process.exit(1);
  }

  const screen = blessed.screen({
    smartCSR: true,
    title: 'PAIMON',
    fullUnicode: true,
  });

  // ── state ──
  const navStack = [{ dirPath: CODES_DIR, selected: 0 }];
  let entries  = listEntries(CODES_DIR);
  let selected = 0;
  let status   = '';
  let statusOk = true;

  // ── layout ──
  const header = blessed.box({
    top: 0, left: 0, width: '100%', height: 1,
    content: ' ✨ PAIMON  v0.2.0',
    style: { fg: '#ffdc64', bg: '#19193d', bold: true },
  });

  const breadcrumb = blessed.box({
    top: 1, left: 0, width: '100%', height: 1,
    style: { fg: '#82beff', bg: '#121223' },
  });

  const infoBar = blessed.box({
    top: 2, left: 0, width: '100%', height: 1,
    style: { fg: '#5a5a78' },
  });

  const divTop = blessed.line({
    top: 3, left: 0, width: '100%', orientation: 'horizontal',
    style: { fg: '#37375a' },
  });

  const list = blessed.list({
    top: 4, left: 0, width: '100%', bottom: 3,
    keys: false, mouse: false,
    style: {
      item:     { fg: '#c8c8dc' },
      selected: { fg: '#0a0a14', bg: '#ffd750', bold: true },
    },
    scrollbar: { ch: '│', style: { fg: '#5a5a78' } },
  });

  const divBot = blessed.line({
    bottom: 2, left: 0, width: '100%', orientation: 'horizontal',
    style: { fg: '#37375a' },
  });

  const statusBar = blessed.box({
    bottom: 1, left: 0, width: '100%', height: 1,
    style: { fg: '#5a5a78' },
  });

  screen.append(header);
  screen.append(breadcrumb);
  screen.append(infoBar);
  screen.append(divTop);
  screen.append(list);
  screen.append(divBot);
  screen.append(statusBar);

  // ── render ──
  function breadcrumbText() {
    return ' 📂 ' + navStack.map((f, i) => {
      if (i === 0) return 'codes';
      return path.basename(f.dirPath);
    }).join(' / ') + ' ';
  }

  function render() {
    const total = countAll(CODES_DIR);
    breadcrumb.setContent(breadcrumbText());
    infoBar.setContent(
      ` ${total} files bundled | ${entries.length} here | ENTER=open  c=copy  ←=back  q=quit `
    );
    list.setItems(entries.map(e => ` ${getIcon(e.name, e.isDir)} ${e.name} `));
    list.select(selected);

    if (status) {
      statusBar.style.fg = statusOk ? '#50ff96' : '#ff5050';
      statusBar.setContent(` ✦ ${status} `);
    } else {
      statusBar.style.fg = '#5a5a78';
      statusBar.setContent(' ✦ ↑↓ navigate   ENTER=open folder   c=copy to cwd   ←=back   q=quit ');
    }
    screen.render();
  }

  // ── actions ──
  function enterDir(entry) {
    navStack[navStack.length - 1].selected = selected;
    navStack.push({ dirPath: entry.full, selected: 0 });
    entries  = listEntries(entry.full);
    selected = 0;
    status   = '';
    render();
  }

  function goBack() {
    if (navStack.length <= 1) return;
    navStack.pop();
    const top = navStack[navStack.length - 1];
    entries  = listEntries(top.dirPath);
    selected = Math.min(top.selected, Math.max(0, entries.length - 1));
    status   = '';
    render();
  }

  function copyEntry(entry) {
    const cwd  = process.cwd();
    const dest = path.join(cwd, entry.name);
    try {
      if (entry.isDir) {
        copyRecursive(entry.full, dest);
        status  = `Copied folder ${entry.name} → ${dest}`;
      } else {
        fs.copyFileSync(entry.full, dest);
        status  = `Copied ${entry.name} → ${dest}`;
      }
      statusOk = true;
    } catch (e) {
      status   = `Error: ${e.message}`;
      statusOk = false;
    }
    render();
  }

  // ── keys ──
  screen.key(['up', 'k'], () => {
    if (selected > 0) { selected--; render(); }
  });

  screen.key(['down', 'j'], () => {
    if (selected < entries.length - 1) { selected++; render(); }
  });

  screen.key(['left', 'backspace', 'h'], () => {
    goBack();
  });

  // ENTER — open folder OR copy file
  screen.key(['enter'], () => {
    if (!entries.length) { status = 'Empty folder.'; statusOk = false; render(); return; }
    const e = entries[selected];
    if (e.isDir) enterDir(e);
    else         copyEntry(e);
  });

  // C — always copy (file or entire folder) without entering
  screen.key(['c'], () => {
    if (!entries.length) { status = 'Empty folder.'; statusOk = false; render(); return; }
    copyEntry(entries[selected]);
  });

  // RIGHT arrow — same as enter
  screen.key(['right'], () => {
    if (!entries.length) { status = 'Empty folder.'; statusOk = false; render(); return; }
    const e = entries[selected];
    if (e.isDir) enterDir(e);
    else         copyEntry(e);
  });

  screen.key(['q', 'escape', 'C-c'], () => {
    screen.destroy();
    process.exit(0);
  });

  render();
}

// ── help ─────────────────────────────────────────────────────────────────────
function printHelp() {
  console.log(`
  ✨  PAIMON - Your sneaky code companion

  USAGE:
    paimon-npm --code -ls       Open interactive code browser
    paimon-npm --help           Show this help

  CONTROLS:
    ↑ k        Move up
    ↓ j        Move down
    ENTER →    Open folder / copy file
    c          Copy file or folder to current directory
    ← Bksp     Go back
    q / ESC    Quit

  Files are copied to wherever you ran paimon from.
`);
}

// ── entry ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args[0] === '--code' && args[1] === '-ls') {
  runTUI();
} else if (args[0] === '--help' || args[0] === '-h' || args.length === 0) {
  printHelp();
} else {
  console.error('Unknown command. Try: paimon-npm --code -ls');
  process.exit(1);
}