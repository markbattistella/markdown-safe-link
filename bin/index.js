#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const axios = require('axios');
const glob = require('glob');

const DEFAULT_REPLACEMENT = '[~X~]';
const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/gi;

const HELP_TEXT = [
    '---------------------------------------------------',
    '--              Markdown URL scanner             --',
    '---------------------------------------------------',
    '',
    'Usage: markdown-safe-link [options]',
    '',
    'Options:',
    '  --dir           The directory to scan md files',
    '  --api           Your API key',
    '  --proxy         Are you behind a proxy server',
    '    --url         Proxy url address or IP address',
    '    --port        Proxy port number',
    '    --username    Username if your proxy has auth',
    '    --password    Password if your proxy has auth',
    '  --replace       String to replace bad urls with',
    "  --dry           Don't actually re-write files",
    '  --help          Display this screen',
    '',
    "Example:",
    "markdown-safe-link --dir='~/docs' --api='qwerty12345' --replace='UNSAFE'",
].join('\n');

function parseArgs(argv) {
    const args = {};

    for (let index = 2; index < argv.length; index += 1) {
        const argument = argv[index];

        if (!argument.startsWith('-')) {
            continue;
        }

        const match = argument.match(/^-{1,2}([^=]+)(?:=(.*))?$/);

        if (!match) {
            continue;
        }

        const name = match[1];
        let value = match[2];

        if (value === undefined) {
            const nextValue = argv[index + 1];

            if (nextValue && !nextValue.startsWith('-')) {
                value = nextValue;
                index += 1;
            } else {
                value = true;
            }
        }

        args[name] = value;
    }

    return args;
}

function booleanOption(value) {
    return value === true || value === 'true' || value === '1' || value === 'yes';
}

function apiKeyFromArgs(args) {
    if (!args.api) {
        return { error: '[x] Exiting: API argument not declared!' };
    }

    if (args.api === true || args.api === '') {
        return { error: '[x] Exiting: API key not provided!' };
    }

    return { value: String(args.api) };
}

function resolveTargetDirectory(dirArg) {
    let target = dirArg;

    if (!target || target === true || target === '') {
        return process.cwd();
    }

    target = String(target);

    if (target === '~') {
        target = os.homedir();
    } else if (target.startsWith('~/')) {
        target = path.join(os.homedir(), target.slice(2));
    }

    if (path.extname(target).toLowerCase() === '.md') {
        target = path.dirname(target);
    }

    return target.replace(/\/$/, '') || '.';
}

function findMarkdownFiles(directory) {
    return glob.sync(`${directory}/**/*.md`, {
        ignore: ['**/node_modules/**'],
        nodir: true,
    });
}

function cleanUrlMatch(url) {
    return url.replace(/[)\].,;!?]+$/g, '');
}

function extractUrls(markdownFileContents) {
    const urls = [];

    for (const match of markdownFileContents.matchAll(URL_PATTERN)) {
        const url = cleanUrlMatch(match[0]);

        try {
            new URL(url);
            urls.push(url);
        } catch {
            // Ignore malformed matches rather than sending bad entries to the API.
        }
    }

    return urls;
}

function scanMarkdownFiles(markdownFiles, directory, logger = console) {
    const urlMatches = [];
    const markdownFilesWithUrls = [];

    for (const markdownFile of markdownFiles) {
        logger.log(`[~] Reading file: "${markdownFile.replace(directory, '')}"`);

        const markdownFileContents = fs.readFileSync(markdownFile, 'utf8');
        const urls = extractUrls(markdownFileContents);

        for (const url of urls) {
            urlMatches.push({ url });
        }

        if (urls.length < 1) {
            logger.log(`    [i] Skipping: ${urls.length} urls\n`);
            continue;
        }

        logger.log(`    [i] Found: ${urls.length} urls\n`);
        markdownFilesWithUrls.push(markdownFile);
    }

    return { urlMatches, markdownFilesWithUrls };
}

function uniqueUrls(urlMatches) {
    return [...new Set(urlMatches.map((value) => value.url))];
}

function safeBrowsingPayload(urls) {
    return {
        client: {
            clientId: 'github-actions-safe-browsing',
            clientVersion: '1.0.0',
        },
        threatInfo: {
            threatTypes: [
                'MALWARE',
                'SOCIAL_ENGINEERING',
                'POTENTIALLY_HARMFUL_APPLICATION',
                'UNWANTED_SOFTWARE',
            ],
            platformTypes: ['ALL_PLATFORMS'],
            threatEntryTypes: ['URL'],
            threatEntries: urls.map((url) => ({ url })),
        },
    };
}

function proxyConfig(args) {
    if (!booleanOption(args.proxy)) {
        return undefined;
    }

    const host = args.url;
    const port = Number(args.port);

    if (!host || !Number.isInteger(port) || port < 1) {
        throw new Error('Proxy mode requires --url and a numeric --port value.');
    }

    const proxy = { host: String(host), port };

    if (args.username || args.password) {
        proxy.auth = {
            username: String(args.username || ''),
            password: String(args.password || ''),
        };
    }

    return proxy;
}

async function findUnsafeUrls(apiKey, urls, args) {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`;
    const response = await axios.post(endpoint, safeBrowsingPayload(urls), {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60 * 4 * 1000,
        proxy: proxyConfig(args),
    });

    return response.data.matches || [];
}

function errorMessage(error) {
    if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error.message;
    }

    return error.message || String(error);
}

function replaceThreatsInMarkdown(urls, markdownFiles, args, logger = console) {
    const replacement = args.replace ? String(args.replace) : DEFAULT_REPLACEMENT;
    const dryRun = booleanOption(args.dry);

    for (const markdownFile of markdownFiles) {
        let markdownFileContents = fs.readFileSync(markdownFile, 'utf8');

        logger.log(`    [~] Working on file: "${markdownFile}"`);

        for (const url of urls) {
            markdownFileContents = markdownFileContents.split(url).join(replacement);
        }

        if (dryRun) {
            logger.log('   *[i] Dry run - no urls were replaced\n');
            continue;
        }

        fs.writeFileSync(markdownFile, markdownFileContents, 'utf8');
        logger.log(`        [i] Removed url from: ${markdownFile}`);
    }
}

async function main(argv = process.argv, logger = console) {
    const args = parseArgs(argv);

    if (args.help) {
        logger.log(HELP_TEXT);
        return 0;
    }

    const apiKey = apiKeyFromArgs(args);

    if (apiKey.error) {
        logger.error(apiKey.error);
        return 1;
    }

    const directory = resolveTargetDirectory(args.dir);
    const markdownFiles = findMarkdownFiles(directory);
    const { urlMatches, markdownFilesWithUrls } = scanMarkdownFiles(markdownFiles, directory, logger);
    const urls = uniqueUrls(urlMatches);

    logger.log('[i] Removing duplicates');

    if (urls.length < 1) {
        logger.log('[i] No urls found');
        logger.log('[i] No url sanitisation needed');
        return 0;
    }

    logger.log(`[i] Scanning: ${urls.length} unique urls\n`);

    const badURLMatches = await findUnsafeUrls(apiKey.value, urls, args);

    if (badURLMatches.length < 1) {
        logger.log('[i] No url sanitisation needed');
        logger.log('[i] All urls safe for browsing');
        return 0;
    }

    const urlThreats = uniqueUrls(badURLMatches.map((match) => ({ url: match.threat.url })));

    logger.log(`[!] Found: ${urlThreats.length} malicious urls`);

    urlThreats.forEach((value, index) => {
        logger.log(`    [${index + 1}]: detected ${value}`);
    });

    logger.log('\n[~] Begin sanitisation of urls');
    replaceThreatsInMarkdown(urlThreats, markdownFilesWithUrls, args, logger);

    return 0;
}

if (require.main === module) {
    main()
        .then((exitCode) => {
            process.exitCode = exitCode;
        })
        .catch((error) => {
            console.error('* * * * * * * * * * * * * * * * * * * * *');
            console.error(`ERROR: > ${errorMessage(error)}`);
            console.error('* * * * * * * * * * * * * * * * * * * * *');
            process.exitCode = 1;
        });
}

module.exports = {
    apiKeyFromArgs,
    booleanOption,
    cleanUrlMatch,
    errorMessage,
    extractUrls,
    main,
    parseArgs,
    proxyConfig,
    replaceThreatsInMarkdown,
    resolveTargetDirectory,
};
