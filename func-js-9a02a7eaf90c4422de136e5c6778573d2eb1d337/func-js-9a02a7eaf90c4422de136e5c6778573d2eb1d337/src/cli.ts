#!/usr/bin/env node
import arg from 'arg';
import { compileFunc, compilerVersion } from '.';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const main = async () => {
    const args = arg({
        '--version': Boolean,
        '--help': Boolean,
        '--require-version': String,
        '--artifact': String,
        '--boc': String,
        '--boc-base64': String,
        '--fift': String,
        '--cwd': String,

        '-v': '--version',
        '-h': '--help',
        '-C': '--cwd',
    });

    if (args['--help']) {
        console.log(`Usage: func-js [OPTIONS] targets
Options:
-h, --help - print this and exit
-v, --version - print func version and exit
--cwd <path>, -C <path> - run func-js as if it was launched from the given path (useful in npm scripts)
--require-version <version> - set the required func version, exit if it is different
--artifact <path> - path where JSON artifact, containing BOC and FIFT output, will be written
--boc <path> - path where compiled code will be written as binary bag of cells
--boc-base64 <path> - path where compiled code will be written as bag of cells using base64 encoding
--fift <path> - path where compiled fift code will be written
`);
        process.exit(0);
    }

    const v = await compilerVersion();

    if (args['--require-version'] !== undefined && v.funcVersion !== args['--require-version']) {
        console.error(`Failed to run func-js: the required func version is ${args['--require-version']}, but the func version is ${v.funcVersion}`);
        process.exit(1);
    }

    if (args['--version']) {
        console.log(`func v${v.funcVersion}`);
        process.exit(0);
    }

    if (args._.length === 0) {
        console.error('No targets were specified. Run with -h to see help.');
        process.exit(1);
    }

    console.log(`Compiling using func v${v.funcVersion}`);

    const basePath = args['--cwd'];
    const pathResolver = basePath === undefined
        ? (p: string) => p
        : (p: string) => path.join(basePath, p);

    const cr = await compileFunc({
        targets: args._,
        sources: (reqPath: string) => readFileSync(pathResolver(reqPath)).toString(),
    });

    if (cr.status === 'error') {
        console.error(cr.message);
        process.exit(1);
    }

    if (args['--artifact'] !== undefined) {
        writeFileSync(args['--artifact'], JSON.stringify({
            artifactVersion: 1,
            version: v.funcVersion,
            sources: cr.snapshot,
            codeBoc: cr.codeBoc,
            fiftCode: cr.fiftCode,
        }));
    }

    if (args['--boc-base64'] !== undefined) {
        writeFileSync(args['--boc-base64'], cr.codeBoc);
    }

    if (args['--boc'] !== undefined) {
        writeFileSync(args['--boc'], Buffer.from(cr.codeBoc, 'base64'));
    }

    if (args['--fift'] !== undefined) {
        writeFileSync(args['--fift'], cr.fiftCode);
    }

    console.log('Compiled successfully!');

    if (!args['--artifact'] && !args['--boc'] && !args['--boc-base64'] && !args['--fift']) {
        console.warn('Warning: No output options were specified. Run with -h to see help.');
    } else {
        console.log('Written output files.');
    }
};

main();