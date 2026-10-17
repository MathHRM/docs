import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const directory = 'site/src/content/docs';
const sourceFiles = (await readdir(path.join(root, directory, 'en/13.x'))).filter(f => f.endsWith('.md')).sort();
const targetFiles = (await readdir(path.join(root, directory, 'es/13.x'))).filter(f => f.endsWith('.md')).sort();
const partial = process.argv.includes('--partial');
if (!partial) assert.deepEqual(targetFiles, sourceFiles, 'Spanish and English page sets must match');
const errors = [];
const capture = (text, regex) => [...text.matchAll(regex)].map(match => match[1]);
function structure(text) {
  const blocks = [];
  const prose = text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, block => {
    // Code examples may translate comments while keeping the executable code unchanged.
    blocks.push(block.split('\n').filter(line => !/^\s*(?:\/\/|#|\/\*|\*|\*\/|<!--|-->)/.test(line)).join('\n'));
    return '';
  });
  return {
    blocks,
    identifiers: capture(prose, /\b([A-Z][A-Za-z0-9_]*(?:\\[A-Za-z_][A-Za-z0-9_]*)+)\b/g).sort(),
    destinations: capture(prose, /\]\(([^\n]*?)\)/g),
    anchors: capture(prose, /<a\s+(?:id|name)="([^"]+)"\s*>/g),
    headings: capture(prose, /^(#{1,6})\s+/gm),
    inlineCode: capture(prose, /(?<!`)`([^`\n]+)`(?!`)/g).sort(),
  };
}
for (const filename of targetFiles) {
  try {
    assert(sourceFiles.includes(filename), 'Translation has no English source');
    const sourcePath = `${directory}/en/13.x/${filename}`;
    const source = await readFile(path.join(root, sourcePath), 'utf8');
    const target = await readFile(path.join(root, directory, 'es/13.x', filename), 'utf8');
    const commit = execFileSync('git', ['log', '-1', '--format=%H', '--', sourcePath], { cwd: root, encoding: 'utf8' }).trim();
    assert.match(target, new RegExp(`^translationSourceCommit: ["']?${commit}["']?$`, 'm'), 'Source commit must match last English change');
    assert(!target.includes('translation pending'), 'Placeholder translation');
    if (filename === 'index.md') continue; // Localized splash deliberately announces Spanish availability.
    if (filename === 'license.md') {
      assert(target.includes(source.replace(/^---\n[\s\S]*?\n---\n/, '').trim()), 'License must include verbatim English original');
      assert.match(target, /informativa/i);
      continue;
    }
    const expected = structure(source);
    const actual = structure(target);
    for (const key of Object.keys(expected)) assert.deepEqual(actual[key], expected[key], `${key} differ`);
    const sourceProse = source.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '');
    const targetLines = new Set(target.split('\n').map(line => line.trim()));
    for (const line of sourceProse.split('\n').map(line => line.trim())) {
      const naturalText = line.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']');
      if (/^[A-Z>]/.test(line) && naturalText.split(/\s+/).length >= 12) {
        assert(!targetLines.has(line), `Untranslated prose: ${line.slice(0, 100)}`);
      }
    }
    const body = target.replace(/^---\n[\s\S]*?\n---\n/, '');
    assert.notEqual(body, source.replace(/^---\n[\s\S]*?\n---\n/, ''), 'Body was not translated');
  } catch (error) {
    errors.push(`${filename}: ${error.message}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${targetFiles.length}/${sourceFiles.length} Spanish pages: source commits, code, links, anchors, and heading structure.`);
}
