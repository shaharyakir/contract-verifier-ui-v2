import { normalize } from "./path";
import { base64Decode } from "./utils";
import { object as latestObject } from "@ton-community/func-js-bin";

export type SourcesMap = { [filename: string]: string };

export type SourceEntry = {
    filename: string
    content: string
};

export type SourcesArray = SourceEntry[];

export type SourceResolver = (path: string) => string;

export type Sources = SourcesMap | SourcesArray | SourceResolver;

export const mapSourceResolver = (map: SourcesMap): SourceResolver => {
    return (path: string) => {
        if (path in map) {
            return map[path];
        }
        throw new Error(`Cannot find source file \`${path}\``);
    };
};

export const arraySourceResolver = (arr: SourcesArray): SourceResolver => {
    return (path: string) => {
        const entry = arr.find(e => e.filename === path);
        if (entry === undefined) throw new Error(`Cannot find source file \`${path}\``);
        return entry.content;
    };
};

export const sourcesResolver = (sources: Sources): SourceResolver => {
    if (typeof sources === 'function') return sources;
    if (Array.isArray(sources)) return arraySourceResolver(sources);
    return mapSourceResolver(sources);
};

/*
 * CompilerConfig example:
 * {
 *      // Entry points of your project.
 *      // If your project has no includes you should provide all files to this array.
 *      // Else provide only main entry with all necessary includes.
 *      entryPoints: ["stdlib.fc", "main.fc", ...],
 *
 *      // All .fc source files from your project
 *      sources: {
 *          "stdlib.fc": "<stdlib code>",
 *          "contract1": "<contract1 code>",
 *          ...
 *      },
 *
 *      // FunC compiler optimization level
 *      optLevel: number of <0-2> (default is 2)
 * }
 *
 */
export type CompilerConfig = {
    optLevel?: number
} & ({
    targets: string[]
    sources: SourceResolver | SourcesMap
} | {
    targets?: string[]
    sources: SourcesArray
});

export type SuccessResult = {
    status: "ok"
    codeBoc: string
    fiftCode: string
    warnings: string
    snapshot: SourcesArray
};

export type ErrorResult = {
    status: "error"
    message: string
    snapshot: SourcesArray
};

export type CompileResult = SuccessResult | ErrorResult;

export type CompilerVersion = {
    funcVersion: string
};

const copyToCString = (mod: any, str: string) => {
    const len = mod.lengthBytesUTF8(str) + 1;
    const ptr = mod._malloc(len);
    mod.stringToUTF8(str, ptr, len);
    return ptr;
};

const copyToCStringPtr = (mod: any, str: string, ptr: any) => {
    const allocated = copyToCString(mod, str);
    mod.setValue(ptr, allocated, '*');
    return allocated;
};

const copyFromCString = (mod: any, ptr: any) => {
    return mod.UTF8ToString(ptr);
};

type FuncWASMObject = {
    schemaVersion: 1;
    funcVersion: string;
    module: any;
    wasmBase64: string;
};

export class FuncCompiler {
    private module: any;
    private wasmBinary: Uint8Array;
    private inputFuncVersion: string;

    constructor(funcWASMObject: any) {
        if (!('schemaVersion' in funcWASMObject)) throw new Error('FunC WASM Object does not contain schemaVersion');

        if (funcWASMObject.schemaVersion !== 1) throw new Error('FunC WASM Object is of unknown schemaVersion ' + funcWASMObject.schemaVersion);

        const normalObject = funcWASMObject as FuncWASMObject;

        this.module = normalObject.module;
        this.wasmBinary = base64Decode(normalObject.wasmBase64);
        this.inputFuncVersion = normalObject.funcVersion;
    }

    private createModule = async () => await this.module({ wasmBinary: this.wasmBinary });

    compilerVersion = async (): Promise<CompilerVersion> => {
        const mod = await this.createModule();

        const versionJsonPointer = mod._version();
        const versionJson = copyFromCString(mod, versionJsonPointer);
        mod._free(versionJsonPointer);

        return JSON.parse(versionJson);
    }

    validateVersion = async (): Promise<boolean> => {
        const v = await this.compilerVersion();

        return v.funcVersion === this.inputFuncVersion;
    }

    compileFunc = async (compileConfig: CompilerConfig): Promise<CompileResult> => {
        const resolver = sourcesResolver(compileConfig.sources);

        let targets = compileConfig.targets;
        if (targets === undefined && Array.isArray(compileConfig.sources)) {
            targets = compileConfig.sources.map(s => s.filename);
        }
        if (targets === undefined) {
            throw new Error('`sources` is not an array and `targets` were not provided');
        }

        const entryWithNoSource = targets.find(filename => {
            try {
                resolver(filename);
                return false;
            } catch (e) {
                return true;
            }
        });
        if (entryWithNoSource) {
            throw new Error(`The entry point \`${entryWithNoSource}\` was not provided in sources.`)
        }

        const mod = await this.createModule();

        const allocatedPointers = [];

        const sourceMap: { [path: string]: { content: string, included: boolean } } = {};
        const sourceOrder: string[] = [];

        const callbackPtr = mod.addFunction((_kind: any, _data: any, contents: any, error: any) => {
            const kind: string = copyFromCString(mod, _kind);
            const data: string = copyFromCString(mod, _data);
            if (kind === 'realpath') {
                const path = normalize(data);
                allocatedPointers.push(copyToCStringPtr(mod, path, contents));
            } else if (kind === 'source') {
                const path = normalize(data);
                try {
                    const source = resolver(path);
                    sourceMap[path] = { content: source, included: false };
                    sourceOrder.push(path);
                    allocatedPointers.push(copyToCStringPtr(mod, source, contents));
                } catch (err) {
                    const e = err as any;
                    allocatedPointers.push(copyToCStringPtr(mod, 'message' in e ? e.message : e.toString(), error));
                }
            } else {
                allocatedPointers.push(copyToCStringPtr(mod, 'Unknown callback kind ' + kind, error));
            }
        }, 'viiii');

        const configStr = JSON.stringify({
            sources: targets,
            optLevel: compileConfig.optLevel || 2,
        });

        const configStrPointer = copyToCString(mod, configStr);
        allocatedPointers.push(configStrPointer);

        const resultPointer = mod._func_compile(configStrPointer, callbackPtr);
        allocatedPointers.push(resultPointer);
        const retJson = copyFromCString(mod, resultPointer);

        // Cleanup
        allocatedPointers.forEach(ptr => mod._free(ptr));
        mod.removeFunction(callbackPtr);

        const snapshot: SourcesArray = [];
        for (let i = sourceOrder.length - 1; i >= 0; i--) {
            const path = sourceOrder[i];
            if (sourceMap[path].included) continue;
            snapshot.push({
                filename: path,
                content: sourceMap[path].content,
            });
        }

        const ret = JSON.parse(retJson);

        return {
            ...ret,
            snapshot,
        };
    }
}

export const latestCompiler = new FuncCompiler(latestObject);

export const compilerVersion = latestCompiler.compilerVersion;

export const compileFunc = latestCompiler.compileFunc;