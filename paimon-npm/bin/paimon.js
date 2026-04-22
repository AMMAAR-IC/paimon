#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');

// ── resolve codes dir ────────────────────────────────────────────────────────
let CODES_DIR = path.join(__dirname, '..', 'codes');
if (!fs.existsSync(CODES_DIR)) {
  CODES_DIR = path.join(__dirname, '..', '..', 'codes');
}

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
    console.error('Missing dependency. Run: npm install blessed');
    process.exit(1);
  }

  const screen = blessed.screen({
    smartCSR: true,
    title: 'PAIMON',
    fullUnicode: true,
  });

  // ── state ──
  const navStack = [{ dirPath: CODES_DIR, selected: 0 }];
  let allEntries = listEntries(CODES_DIR);
  let entries  = [...allEntries];
  let selected = 0;
  let status   = '';
  let statusOk = true;
  let isSearching = false;
  let searchQuery = '';

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

  // 40% left column
  const list = blessed.list({
    top: 4, left: 0, width: '40%', bottom: 3,
    keys: false, mouse: false,
    style: {
      item:     { fg: '#c8c8dc' },
      selected: { fg: '#0a0a14', bg: '#ffd750', bold: true },
    },
    scrollbar: { ch: '│', style: { fg: '#5a5a78' } },
  });

  const verticalDiv = blessed.line({
    top: 4, left: '40%', width: 1, bottom: 3, orientation: 'vertical',
    style: { fg: '#37375a' },
  });

  // 60% right column
  const previewBox = blessed.box({
    top: 4, left: '41%', width: '59%', bottom: 3,
    style: { fg: '#a0a0b4' },
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
  screen.append(verticalDiv);
  screen.append(previewBox);
  screen.append(divBot);
  screen.append(statusBar);

  // ── render ──
  function breadcrumbText() {
    return ' 📂 ' + navStack.map((f, i) => {
      if (i === 0) return 'codes';
      return path.basename(f.dirPath);
    }).join(' / ') + ' ';
  }

  function updateFilter() {
    if (!searchQuery) { entries = allEntries; }
    else {
      entries = allEntries.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    selected = 0;
  }

  function renderPreview() {
    if (!entries.length) { previewBox.setContent(' No files matched.'); return; }
    const e = entries[selected];
    if (e.isDir) {
      previewBox.setContent(' 📁 Directory\n Press ENTER to explore.');
    } else {
      try {
        let content = fs.readFileSync(e.full, 'utf-8');
        try {
          const highlight = require('cli-highlight').highlight;
          const ext = e.name.split('.').pop()?.toLowerCase();
          content = highlight(content, { language: ext, ignoreIllegals: true });
        } catch (highlightErr) {}
        const lines = content.split('\n').slice(0, 40).map(l => ' ' + l).join('\n');
        previewBox.setContent(lines);
      } catch (err) {
        previewBox.setContent(' Binary file or unreadable content.');
      }
    }
  }

  function render() {
    const total = countAll(CODES_DIR);
    breadcrumb.setContent(breadcrumbText());
    infoBar.setContent(
      ` ${total} files bundled | ${entries.length} here | [/] search  ENTER=open  c=copy  ←=back `
    );
    list.setItems(entries.map(e => ` ${getIcon(e.name, e.isDir)} ${e.name} `));
    list.select(selected);

    renderPreview();

    if (isSearching) {
      statusBar.style.fg = '#ffd750';
      statusBar.setContent(` 🔍 Search: ${searchQuery}_ `);
      statusBar.style.bold = true;
    } else if (status) {
      statusBar.style.fg = statusOk ? '#50ff96' : '#ff5050';
      statusBar.style.bold = true;
      statusBar.setContent(` ✦ ${status} `);
    } else {
      statusBar.style.fg = '#5a5a78';
      statusBar.style.bold = false;
      statusBar.setContent(' ✦ [/] search   ↑↓ navigate   ENTER=open/copy   c=copy   ←=back ');
    }
    screen.render();
  }

  // ── actions ──
  function enterDir(entry) {
    navStack[navStack.length - 1].selected = selected;
    navStack.push({ dirPath: entry.full, selected: 0 });
    allEntries = listEntries(entry.full);
    searchQuery = '';
    isSearching = false;
    updateFilter();
    status   = '';
    render();
  }

  function goBack() {
    if (navStack.length <= 1) return;
    navStack.pop();
    const top = navStack[navStack.length - 1];
    allEntries = listEntries(top.dirPath);
    searchQuery = '';
    isSearching = false;
    updateFilter();
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
  screen.on('keypress', (ch, key) => {
    if (isSearching) {
      if (key && (key.name === 'escape' || key.name === 'enter' || key.name === 'return')) {
        isSearching = false;
        render();
      } else if (key && key.name === 'backspace') {
        searchQuery = searchQuery.slice(0, -1);
        updateFilter();
        render();
      } else if (ch && !key.ctrl && !key.meta && ch.length === 1) {
        searchQuery += ch;
        updateFilter();
        render();
      }
    } else {
      if (ch === '/' || ch === 's') {
        isSearching = true;
        render();
      }
    }
  });

  screen.key(['up', 'k'], () => {
    if (isSearching) return;
    if (selected > 0) { selected--; render(); }
  });

  screen.key(['down', 'j'], () => {
    if (isSearching) return;
    if (selected < entries.length - 1) { selected++; render(); }
  });

  screen.key(['left', 'backspace', 'h'], () => {
    if (isSearching) return;
    goBack();
  });

  screen.key(['enter', 'right', 'l'], () => {
    if (isSearching) return; // handled by keypress
    if (!entries.length) { status = 'Empty folder.'; statusOk = false; render(); return; }
    const e = entries[selected];
    if (e.isDir) enterDir(e);
    else         copyEntry(e);
  });

  screen.key(['c'], () => {
    if (isSearching) return;
    if (!entries.length) { status = 'Empty folder.'; statusOk = false; render(); return; }
    copyEntry(entries[selected]);
  });

  screen.key(['q', 'escape', 'C-c'], () => {
    if (isSearching && key.name === 'escape') return; // handled
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
    / or s     Search & filter items
    ↑ k        Move up
    ↓ j        Move down
    ENTER →    Select file (copies to cwd) or open folder
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