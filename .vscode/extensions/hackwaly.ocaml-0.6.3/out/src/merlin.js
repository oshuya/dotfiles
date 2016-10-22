'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode = require('vscode');
const child_process = require('child_process');
const readline = require('readline');
const utils_1 = require('./utils');
class OCamlMerlinSession {
    constructor() {
        this._wait = Promise.resolve();
        this._protocolVersion = 1;
        let merlinPath = vscode.workspace.getConfiguration('ocaml').get('merlinPath');
        this._cp = child_process.spawn(merlinPath, []);
        this._cp.on('exit', (code, signal) => {
            utils_1.log(`OCamlmerlin exited with code ${code}, signal ${signal}`);
        });
        this._rl = readline.createInterface({
            input: this._cp.stdout,
            output: this._cp.stdin,
            terminal: false
        });
        this._wait = this.request(['protocol', 'version', 2]).then(([status, result]) => {
            if (status === 'return' && result.selected === 2) {
                this._protocolVersion = 2;
            }
        });
    }
    request(data) {
        let promise = this._wait.then(() => {
            return new Promise((resolve, reject) => {
                let cmd = JSON.stringify(data);
                utils_1.log(`command to merlin: ${cmd}`);
                this._rl.question(cmd + '\n', (answer) => {
                    utils_1.log(`response from merlin: ${answer}`);
                    resolve(JSON.parse(answer));
                });
            });
        });
        this._wait = promise.then(() => { });
        return promise;
    }
    syncBuffer(file, content, token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request(['checkout', 'auto', file]);
            if (token.isCancellationRequested)
                return null;
            if (this._protocolVersion === 2) {
                yield this.request(['tell', 'start', 'end', content]);
            }
            else {
                yield this.request(['seek', 'exact', { line: 1, col: 0 }]);
                if (token.isCancellationRequested)
                    return null;
                yield this.request(['tell', 'source-eof', content]);
            }
        });
    }
    dispose() {
        this._rl.close();
        this._cp.disconnect();
    }
}
exports.OCamlMerlinSession = OCamlMerlinSession;
//# sourceMappingURL=merlin.js.map