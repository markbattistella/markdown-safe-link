'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const {
    extractUrls,
    replaceThreatsInMarkdown,
    resolveTargetDirectory,
} = require('../bin/index.js');

const cliPath = path.join(__dirname, '..', 'bin', 'index.js');

test('prints help and exits successfully', () => {
    const result = spawnSync(process.execPath, [cliPath, '--help'], {
        encoding: 'utf8',
    });

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage: markdown-safe-link/);
});

test('missing api exits before scanning or making a request', () => {
    const result = spawnSync(process.execPath, [cliPath], {
        encoding: 'utf8',
    });

    const output = `${result.stdout}${result.stderr}`;

    assert.equal(result.status, 1);
    assert.match(output, /API argument not declared/);
    assert.doesNotMatch(output, /Scanning:/);
});

test('markdown file arguments resolve to their containing directory', () => {
    assert.equal(resolveTargetDirectory('README.md'), '.');
    assert.equal(resolveTargetDirectory('docs/site/home.md'), 'docs/site');
});

test('extracts common markdown urls without trailing markdown punctuation', () => {
    const urls = extractUrls('[safe](https://example.com/path?q=1). https://site.test/doc#anchor)');

    assert.deepEqual(urls, [
        'https://example.com/path?q=1',
        'https://site.test/doc#anchor',
    ]);
});

test('replaces unsafe urls literally, not as regular expressions', () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-safe-link-'));
    const markdownFile = path.join(tempDirectory, 'sample.md');

    fs.writeFileSync(
        markdownFile,
        [
            'Safe: https://safe.example/path',
            'Bad: https://bad.example/path?q=.*',
        ].join('\n'),
        'utf8',
    );

    replaceThreatsInMarkdown(
        ['https://bad.example/path?q=.*'],
        [markdownFile],
        { replace: '[REDACTED]' },
        { log() {} },
    );

    assert.equal(
        fs.readFileSync(markdownFile, 'utf8'),
        [
            'Safe: https://safe.example/path',
            'Bad: [REDACTED]',
        ].join('\n'),
    );
});
