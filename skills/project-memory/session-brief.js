#!/usr/bin/env node
/**
 * SessionStart hook - "where we stand".
 *
 * The PreCompact and SessionEnd hooks handle WRITING memory. This handles the
 * other half, which was missing: READING it back at the start of a session, so
 * work never begins from a blank slate.
 *
 * It cannot force anything to be remembered - no hook can. What it does is put
 * the current state into context before the first reply, so that forgetting
 * requires ignoring text that is already on screen.
 *
 * It must never crash a session. Every read is guarded; on failure it prints a
 * short notice and exits 0.
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

// Words in a memory's description that mean the item is not finished.
const OPEN_MARKERS = /\b(paused|outstanding|still not|not done|unfinished|pending|blocked|open|deferred|before .* live|must be|needs?|resurface)\b/i;
const MAX_OPEN = 14;
const MAX_RECENT = 10;

const out = [];
const say = (s) => out.push(s === undefined ? '' : s);

function readDir(dir) {
  try { return fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'MEMORY.md'); }
  catch { return null; }
}

/** Pull `name` and `description` out of the frontmatter without a YAML parser. */
function meta(dir, file) {
  let text;
  try { text = fs.readFileSync(path.join(dir, file), 'utf8'); } catch { return null; }
  const desc = text.match(/^description:\s*(.+)$/m);
  let d = desc ? desc[1].trim() : '';
  if ((d.startsWith('"') && d.endsWith('"')) || (d.startsWith("'") && d.endsWith("'"))) d = d.slice(1, -1);
  let mtime = 0;
  try { mtime = fs.statSync(path.join(dir, file)).mtimeMs; } catch { /* ignore */ }
  return { file, slug: file.replace(/\.md$/, ''), desc: d, mtime };
}

const files = readDir(CANONICAL);

say();
say('=== WHERE WE STAND - loaded automatically, read before replying ===');

if (!files) {
  say(`Memory folder could not be read: ${CANONICAL}`);
  say('Say so plainly rather than proceeding as if there is no history.');
  say('================================================================');
  process.stdout.write(out.join('\n') + '\n');
  process.exit(0);
}

const entries = files.map((f) => meta(CANONICAL, f)).filter(Boolean);
say(`Memory: ${entries.length} files at ${CANONICAL}`);
say('Memory is keyed to the directory the session starts from.');


// Anything whose description reads as unfinished.
const CLOSED = /(resolved|superseded|closed|done|completed|no longer|fixed|shipped)/i;
const open = entries.filter((e) => OPEN_MARKERS.test(e.desc) && !CLOSED.test(e.desc));
if (open.length) {
  say();
  say(`NOT FINISHED (${open.length} item${open.length === 1 ? '' : 's'} flagged in memory):`);
  open.slice(0, MAX_OPEN).forEach((e) => say(`  - [${e.slug}] ${e.desc}`));
  if (open.length > MAX_OPEN) say(`  ...and ${open.length - MAX_OPEN} more - read MEMORY.md`);
}

// What changed most recently tells you what the last session was doing.
const recent = entries.slice().sort((a, b) => b.mtime - a.mtime).slice(0, MAX_RECENT);
if (recent.length) {
  say();
  say('CHANGED MOST RECENTLY (what the last session was working on):');
  recent.forEach((e) => {
    const days = Math.floor((Date.now() - e.mtime) / 86400000);
    const when = days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`;
    say(`  - ${e.slug} (${when})`);
  });
}

// The newest handoff carries the narrative the memory files deliberately omit.
try {
  const h = fs.readdirSync(OPS)
    .filter((f) => /^SESSION-HANDOFF-.*\.md$/i.test(f))
    .sort()
    .pop();
  if (h) {
    say();
    say(`LATEST HANDOFF: ${path.join(OPS, h)}`);
    const body = fs.readFileSync(path.join(OPS, h), 'utf8');
    const sec = body.match(/##\s*Open threads([\s\S]*?)(?=\n##\s|\n---|\s*$)/i);
    if (sec) {
      sec[1].split('\n')
        .map((l) => l.trim())
        .filter((l) => /^(\d+\.|[-*])\s+/.test(l))
        .slice(0, 10)
        .forEach((l) => say('  ' + l));
    }
  }
} catch { /* no handoff is fine */ }

// Keep the tree current, then point at it. A stale tree is worse than none.
try {
  require('child_process').execFileSync(
    process.execPath,
    [path.join(__dirname, 'build-memory-tree.js'), CANONICAL],
    { stdio: 'ignore', timeout: 15000 },
  );
  const tree = path.join(CANONICAL, 'MEMORY-TREE.md');
  if (fs.existsSync(tree)) {
    say();
    say(`MEMORY TREE (regenerated just now): ${tree}`);
    say('  Grouped by branch, with what is still open marked.');
    say('  Open it before any task that touches more than one memory.');
  }
} catch { /* the brief must still print even if the tree cannot be built */ }

say();
say('BEFORE THE FIRST REPLY OF THIS SESSION:');
say('  1. Read MEMORY.md in the folder above. Do not guess at state.');
say('  2. Open any memory named in NOT FINISHED that touches the current task.');
say('  3. Say where things stand in one or two lines, including anything left');
say('     half-done, before starting new work.');
say('  4. Never claim something shipped, was fixed, or was written without');
say('     checking the actual file, process or console first.');
say('  5. Before describing how anything works, or giving the user a procedure,');
say('     OPEN the artefact that defines it - the config file, the --help, the');
say('     manifest. Name what you read. See the check-first skill.');
say('================================================================');
say();

process.stdout.write(out.join('\n'));
process.exit(0);
