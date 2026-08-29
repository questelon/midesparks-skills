#!/usr/bin/env node
/**
 * Memory checkpoint hook.
 *
 * Prints a checkpoint notice into the session at the two moments working
 * knowledge is actually destroyed: just before compaction, and at session end.
 *
 * This exists because relying on the assistant to remember to write memory has
 * failed repeatedly. A hook is run by the harness rather than chosen by the
 * model, so it fires whether or not anything remembered to fire it.
 *
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Claude Code keys the memory folder to the directory the session started from,
// replacing every non-alphanumeric character with a dash. Deriving it means this
// works in any project without editing paths.
const PROJECT_KEY = process.cwd().replace(/[^a-zA-Z0-9]/g, '-');
const CANONICAL = process.env.CLAUDE_MEMORY_DIR
  || path.join(os.homedir(), '.claude', 'projects', PROJECT_KEY, 'memory');
const OPS = process.env.CLAUDE_HANDOFF_DIR || path.join(process.cwd(), 'operations');

function stat(dir) {
  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return null;
  }

  let newest = 0;
  for (const file of files) {
    try {
      const { mtimeMs } = fs.statSync(path.join(dir, file));
      if (mtimeMs > newest) newest = mtimeMs;
    } catch { /* a file vanishing mid-scan is not worth failing over */ }
  }

  const minutes = newest ? Math.round((Date.now() - newest) / 60000) : null;
  const age =
    minutes === null ? 'never written'
      : minutes < 60 ? `${minutes} min ago`
        : `${Math.round(minutes / 60)} h ago`;

  return { count: files.length, age, newest };
}

const canonical = stat(CANONICAL);

const lines = [
  '',
  '=== MEMORY CHECKPOINT ===',
  `Canonical memory: ${CANONICAL}`,
];

if (canonical) {
  lines.push(`${canonical.count} memories on file. Last written: ${canonical.age}.`);
} else {
  lines.push('WARNING: the canonical memory folder could not be read.');
}


lines.push(
  '',
  'Before continuing, write anything from this stretch that would cost time',
  'if lost. Follow the project-memory skill. Specifically:',
  '  1. What was decided (including anything deferred)?',
  '  2. What turned out to be wrong? Correct that file, do not add a second one.',
  '  3. What reached production, and what proved it?',
  '  4. What constraint was hit that should stop a future attempt?',
  '  5. What did the user say about how the work should be done?',
  '  6. Does MEMORY.md have a line for every file?',
  '',
  'Write the files now, then say what was written. Never say memory will be',
  'written later - that promise has been broken enough to be worth nothing.',
  'If nothing genuinely qualifies, say "memory current" and move on.',
  '=========================',
  '',
);

process.stdout.write(lines.join('\n'));
process.exit(0);
