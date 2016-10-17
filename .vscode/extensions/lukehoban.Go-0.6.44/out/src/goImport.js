/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var cp = require('child_process');
var goPath_1 = require('./goPath');
var util_1 = require('./util');
var goInstallTools_1 = require('./goInstallTools');
var goOutline_1 = require('./goOutline');
function listPackages(excludeImportedPkgs) {
    if (excludeImportedPkgs === void 0) { excludeImportedPkgs = false; }
    var importsPromise = excludeImportedPkgs && vscode.window.activeTextEditor ? getImports(vscode.window.activeTextEditor.document.fileName) : Promise.resolve([]);
    var pkgsPromise = new Promise(function (resolve, reject) {
        cp.execFile(goPath_1.getBinPath('gopkgs'), [], function (err, stdout, stderr) {
            if (err && err.code === 'ENOENT') {
                goInstallTools_1.promptForMissingTool('gopkgs');
                return reject();
            }
            var lines = stdout.toString().split('\n');
            var sortedlines = lines.sort().slice(1); // Drop the empty entry from the final '\n'
            return resolve(sortedlines);
        });
    });
    return Promise.all([importsPromise, pkgsPromise]).then(function (values) {
        var imports = values[0];
        var pkgs = values[1];
        if (imports.length === 0) {
            return pkgs;
        }
        return pkgs.filter(function (element) {
            return imports.indexOf(element) === -1;
        });
    });
}
exports.listPackages = listPackages;
/**
 * Returns the imported packages in the given file
 *
 * @param fileName File system path of the file whose imports need to be returned
 * @returns Array of imported package paths wrapped in a promise
 */
function getImports(fileName) {
    return goOutline_1.documentSymbols(fileName).then(function (symbols) {
        if (!symbols || !symbols[0] || !symbols[0].children) {
            return [];
        }
        // imports will be of the form { type: 'import', label: '"math"'}
        var imports = symbols[0].children.filter(function (x) { return x.type === 'import'; }).map(function (x) { return x.label.substr(1, x.label.length - 2); });
        return imports;
    });
}
exports.getImports = getImports;
function askUserForImport() {
    return listPackages(true).then(function (packages) {
        return vscode.window.showQuickPick(packages);
    });
}
function getTextEditForAddImport(arg) {
    // Import name wasn't provided
    if (arg === undefined) {
        return null;
    }
    var _a = util_1.parseFilePrelude(vscode.window.activeTextEditor.document.getText()), imports = _a.imports, pkg = _a.pkg;
    var multis = imports.filter(function (x) { return x.kind === 'multi'; });
    if (multis.length > 0) {
        // There is a multiple import declaration, add to the last one
        var closeParenLine = multis[multis.length - 1].end;
        return vscode.TextEdit.insert(new vscode.Position(closeParenLine, 0), '\t"' + arg + '"\n');
    }
    else if (imports.length > 0) {
        // There are only single import declarations, add after the last one
        var lastSingleImport = imports[imports.length - 1].end;
        return vscode.TextEdit.insert(new vscode.Position(lastSingleImport + 1, 0), 'import "' + arg + '"\n');
    }
    else if (pkg && pkg.start >= 0) {
        // There are no import declarations, but there is a package declaration
        return vscode.TextEdit.insert(new vscode.Position(pkg.start + 1, 0), '\nimport (\n\t"' + arg + '"\n)\n');
    }
    else {
        // There are no imports and no package declaration - give up
        return null;
    }
}
exports.getTextEditForAddImport = getTextEditForAddImport;
function addImport(arg) {
    var p = arg ? Promise.resolve(arg) : askUserForImport();
    p.then(function (imp) {
        var edit = getTextEditForAddImport(imp);
        if (edit) {
            vscode.window.activeTextEditor.edit(function (editBuilder) {
                editBuilder.insert(edit.range.start, edit.newText);
            });
        }
    });
}
exports.addImport = addImport;
//# sourceMappingURL=goImport.js.map