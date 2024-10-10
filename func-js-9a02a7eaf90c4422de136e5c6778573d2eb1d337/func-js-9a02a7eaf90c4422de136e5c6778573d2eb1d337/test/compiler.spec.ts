import {compileFunc, compilerVersion, SuccessResult, ErrorResult, mapSourceResolver, latestCompiler} from '../src/index';
import fs from 'fs';
import {Cell} from 'ton-core';

describe('func-js', () => {
    const walletCodeCellHash = Buffer.from("hA3nAz+xEJePYGrDyjJ+BXBcxSp9Y2xaAFLRgGntfDs=", 'base64');

    const compilerVersionExpected = {
        funcVersion: "0.4.4",
        funcFiftLibCommitDate: "2024-03-27 12:57:15 +0300",
        funcFiftLibCommitHash: "ffe0a1c63073dda0a0dd0e14f199b83fe5b05e66",
    };

    it('should return compiler version', async () => {
        let version = await compilerVersion();
        expect(version).toEqual(compilerVersionExpected);
    });

    it('should compile', async () => {
        let result = await compileFunc({
            optLevel: 2,
            targets: ["stdlib.fc", "wallet-code.fc"],
            sources: {
                "stdlib.fc": fs.readFileSync('./test/contracts/stdlib.fc', { encoding: 'utf-8' }),
                "wallet-code.fc":  fs.readFileSync('./test/contracts/wallet-code.fc', { encoding: 'utf-8' })
            }
        });

        expect(result.status).toEqual('ok');
        result = result as SuccessResult;

        let codeCell = Cell.fromBoc(Buffer.from(result.codeBoc, "base64"))[0];
        expect(codeCell.hash().equals(walletCodeCellHash)).toBe(true);
    });

    it('should compile using map source resolver', async () => {
        let result = await compileFunc({
            optLevel: 2,
            targets: ["stdlib.fc", "wallet-code.fc"],
            sources: mapSourceResolver({
                "stdlib.fc": fs.readFileSync('./test/contracts/stdlib.fc', { encoding: 'utf-8' }),
                "wallet-code.fc":  fs.readFileSync('./test/contracts/wallet-code.fc', { encoding: 'utf-8' })
            })
        });

        expect(result.status).toEqual('ok');
        result = result as SuccessResult;

        let codeCell = Cell.fromBoc(Buffer.from(result.codeBoc, "base64"))[0];
        expect(codeCell.hash().equals(walletCodeCellHash)).toBe(true);
    });

    it('should handle includes', async () => {
        let result = await compileFunc({
            optLevel: 2,
            targets: ["wallet-code.fc"],
            sources: {
                "stdlib.fc": fs.readFileSync('./test/contracts/stdlib.fc', 'utf-8'),
                "wallet-code.fc": '#include "stdlib.fc";\n' + fs.readFileSync('./test/contracts/wallet-code.fc', 'utf-8')
            }
        });

        expect(result.status).toEqual('ok');

        result = result as SuccessResult;

        let codeCell = Cell.fromBoc(Buffer.from(result.codeBoc, "base64"))[0];
        expect(codeCell.hash().equals(walletCodeCellHash)).toBe(true);
    });

    it('should fail if entry point source is not provided', async () => {
        expect(compileFunc({
            optLevel: 2,
            targets: ["main.fc"],
            sources: {}
        })).rejects.toThrowError('The entry point `main.fc` was not provided in sources.');
    });

    it('should handle pragma', async () => {
        let source = `
            #pragma version ^${compilerVersionExpected.funcVersion};
            
            () main() { return(); }
        `;
        let result = await compileFunc({
            optLevel: 1,
            targets: ["main.fc"],
            sources: {
                "main.fc": source,
            }
        });

        expect(result.status).toEqual('ok')

        source = `
            #pragma version <${compilerVersionExpected.funcVersion};
            
            () main() { return(); }
        `;
        result = await compileFunc({
            optLevel: 1,
            targets: ["main.fc"],
            sources: {
                "main.fc": source,
            }
        });

        expect(result.status).toEqual('error');
        result = result as ErrorResult;
        expect(result.message.indexOf(`FunC version ${compilerVersionExpected.funcVersion} does not satisfy condition <${compilerVersionExpected.funcVersion}`) >= 0).toBeTruthy();
    });

    it('should fail if a non-existing source is included', async () => {
        let result = await compileFunc({
            optLevel: 2,
            targets: ["main.fc"],
            sources: {
                "main.fc": '#include "non-existing.fc";'
            }
        });

        expect(result.status).toEqual('error');
        result = result as ErrorResult;
        expect(result.message.indexOf('Cannot find source file `non-existing.fc`') >= 0).toBeTruthy();
    });

    it('should return correct snapshot using resolver', async () => {
        let result = await compileFunc({
            targets: ["wallet-code.fc"],
            sources: (path: string) => fs.readFileSync(__dirname + '/contracts/' + path).toString(),
        });

        expect(result.status).toBe('ok');
        result = result as SuccessResult;

        expect(result.snapshot).toStrictEqual([
            {
                filename: 'stdlib.fc',
                content: fs.readFileSync(__dirname + '/contracts/stdlib.fc').toString(),
            },
            {
                filename: 'wallet-code.fc',
                content: fs.readFileSync(__dirname + '/contracts/wallet-code.fc').toString(),
            },
        ]);
    })

    it('should compile array sources', async () => {
        let result = await compileFunc({
            sources: [
                {
                    filename: 'stdlib.fc',
                    content: fs.readFileSync(__dirname + '/contracts/stdlib.fc').toString(),
                },
                {
                    filename: 'wallet-code.fc',
                    content: fs.readFileSync(__dirname + '/contracts/wallet-code.fc').toString(),
                },
            ],
        });

        expect(result.status).toBe('ok');
    })

    it('should validate version', async () => {
        expect(await latestCompiler.validateVersion()).toBe(true);
    })
});