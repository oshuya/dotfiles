/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/
"use strict";
var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');
var vscode = require('vscode');
var goExtraInfo_1 = require('../src/goExtraInfo');
var goSuggest_1 = require('../src/goSuggest');
var goSignature_1 = require('../src/goSignature');
var goCheck_1 = require('../src/goCheck');
var cp = require('child_process');
var diffUtils_1 = require('../src/diffUtils');
var goTest_1 = require('../src/goTest');
var goInstallTools_1 = require('../src/goInstallTools');
var goOutline_1 = require('../src/goOutline');
var goImport_1 = require('../src/goImport');
var goGenerateTests_1 = require('../src/goGenerateTests');
suite('Go Extension Tests', function () {
    var gopath = process.env['GOPATH'];
    var repoPath = path.join(gopath, 'src', '___testrepo');
    var fixturePath = path.join(repoPath, 'test', 'testfixture');
    var fixtureSourcePath = path.join(__dirname, '..', '..', 'test', 'fixtures');
    suiteSetup(function () {
        assert.ok(gopath !== null, 'GOPATH is not defined');
        fs.removeSync(repoPath);
        fs.mkdirsSync(fixturePath);
        fs.copySync(path.join(fixtureSourcePath, 'test.go'), path.join(fixturePath, 'test.go'));
        fs.copySync(path.join(fixtureSourcePath, 'errorsTest', 'errors.go'), path.join(fixturePath, 'errorsTest', 'errors.go'));
        fs.copySync(path.join(fixtureSourcePath, 'sample_test.go'), path.join(fixturePath, 'sample_test.go'));
    });
    suiteTeardown(function () {
        fs.removeSync(repoPath);
    });
    test('Test Hover Provider', function (done) {
        var provider = new goExtraInfo_1.GoHoverProvider();
        var printlnDoc = "Println formats using the default formats for its operands and writes to\nstandard output. Spaces are always added between operands and a newline\nis appended. It returns the number of bytes written and any write error\nencountered.\n";
        var testCases = [
            // [new vscode.Position(3,3), '/usr/local/go/src/fmt'],
            [new vscode.Position(9, 6), 'main func()', null],
            [new vscode.Position(7, 2), 'import (fmt "fmt")', null],
            [new vscode.Position(7, 6), 'Println func(a ...interface{}) (n int, err error)', printlnDoc],
            [new vscode.Position(10, 3), 'print func(txt string)', null]
        ];
        var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
        vscode.workspace.openTextDocument(uri).then(function (textDocument) {
            var promises = testCases.map(function (_a) {
                var position = _a[0], expectedSignature = _a[1], expectedDocumentation = _a[2];
                return provider.provideHover(textDocument, position, null).then(function (res) {
                    // TODO: Documentation appears to currently be broken on Go 1.7, so disabling these tests for now
                    // if (expectedDocumentation === null) {
                    //  assert.equal(res.contents.length, 1);
                    // } else {
                    // 	assert.equal(res.contents.length, 2);
                    // 	assert.equal(expectedDocumentation, <string>(res.contents[0]));
                    // }
                    assert.equal(expectedSignature, res.contents[res.contents.length - 1].value);
                });
            });
            return Promise.all(promises);
        }, function (err) {
            assert.ok(false, "error in OpenTextDocument " + err);
        }).then(function () { return done(); }, done);
    });
    test('Test Completion', function (done) {
        var provider = new goSuggest_1.GoCompletionItemProvider();
        var testCases = [
            [new vscode.Position(1, 0), []],
            [new vscode.Position(4, 1), ['main', 'print', 'fmt']],
            [new vscode.Position(7, 4), ['fmt']],
            [new vscode.Position(8, 0), ['main', 'print', 'fmt', 'txt']]
        ];
        var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
        vscode.workspace.openTextDocument(uri).then(function (textDocument) {
            var promises = testCases.map(function (_a) {
                var position = _a[0], expected = _a[1];
                return provider.provideCompletionItems(textDocument, position, null).then(function (items) {
                    var labels = items.map(function (x) { return x.label; });
                    for (var _i = 0, expected_1 = expected; _i < expected_1.length; _i++) {
                        var entry = expected_1[_i];
                        if (labels.indexOf(entry) < 0) {
                            assert.fail('', entry, 'missing expected item in competion list');
                        }
                    }
                });
            });
            return Promise.all(promises);
        }, function (err) {
            assert.ok(false, "error in OpenTextDocument " + err);
        }).then(function () { return done(); }, done);
    });
    test('Test Completion on unimported packages', function (done) {
        var config = Object.create(vscode.workspace.getConfiguration('go'), {
            'autocompleteUnimportedPackages': { value: true }
        });
        var provider = new goSuggest_1.GoCompletionItemProvider();
        var testCases = [
            [new vscode.Position(12, 2), ['bytes']],
            [new vscode.Position(13, 5), ['Abs', 'Acos', 'Asin']]
        ];
        var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
        vscode.workspace.openTextDocument(uri).then(function (textDocument) {
            return vscode.window.showTextDocument(textDocument).then((function (editor) {
                return editor.edit(function (editbuilder) {
                    editbuilder.insert(new vscode.Position(12, 0), 'by\n');
                    editbuilder.insert(new vscode.Position(13, 0), 'math.\n');
                }).then(function () {
                    var promises = testCases.map(function (_a) {
                        var position = _a[0], expected = _a[1];
                        return provider.provideCompletionItemsInternal(textDocument, position, null, config).then(function (items) {
                            var labels = items.map(function (x) { return x.label; });
                            for (var _i = 0, expected_2 = expected; _i < expected_2.length; _i++) {
                                var entry = expected_2[_i];
                                assert.equal(labels.indexOf(entry) > -1, true, "missing expected item in competion list: " + entry + " Actual: " + labels);
                            }
                        });
                    });
                    return Promise.all(promises);
                });
            })).then(function () {
                vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                return Promise.resolve();
            });
        }, function (err) {
            assert.ok(false, "error in OpenTextDocument " + err);
        }).then(function () { return done(); }, done);
    });
    test('Test Signature Help', function (done) {
        var provider = new goSignature_1.GoSignatureHelpProvider();
        var testCases = [
            [new vscode.Position(7, 13), 'Println(a ...interface{}) (n int, err error)'],
            [new vscode.Position(10, 7), 'print(txt string)']
        ];
        var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
        vscode.workspace.openTextDocument(uri).then(function (textDocument) {
            var promises = testCases.map(function (_a) {
                var position = _a[0], expected = _a[1];
                return provider.provideSignatureHelp(textDocument, position, null).then(function (sigHelp) {
                    assert.equal(sigHelp.signatures.length, 1, 'unexpected number of overloads');
                    assert.equal(sigHelp.signatures[0].label, expected);
                });
            });
            return Promise.all(promises);
        }, function (err) {
            assert.ok(false, "error in OpenTextDocument " + err);
        }).then(function () { return done(); }, done);
    });
    test('Error checking', function (done) {
        var config = vscode.workspace.getConfiguration('go');
        var expected = [
            { line: 7, severity: 'warning', msg: 'exported function Print2 should have comment or be unexported' },
            // { line: 7, severity: 'warning', msg: 'no formatting directive in Printf call' },
            { line: 11, severity: 'error', msg: 'undefined: prin' },
        ];
        goInstallTools_1.getGoVersion().then(function (version) {
            if (version.major === 1 && version.minor === 5) {
                // golint is not supported in Go 1.5, so skip the test
                return Promise.resolve();
            }
            return goCheck_1.check(path.join(fixturePath, 'errorsTest', 'errors.go'), config).then(function (diagnostics) {
                var sortedDiagnostics = diagnostics.sort(function (a, b) { return a.line - b.line; });
                for (var i in expected) {
                    assert.equal(sortedDiagnostics[i].line, expected[i].line);
                    assert.equal(sortedDiagnostics[i].severity, expected[i].severity);
                    assert.equal(sortedDiagnostics[i].msg, expected[i].msg);
                }
                assert.equal(sortedDiagnostics.length, expected.length, "too many errors " + JSON.stringify(sortedDiagnostics));
            });
        }).then(function () { return done(); }, done);
    });
    test('Test Generate unit tests squeleton for file', function (done) {
        goInstallTools_1.getGoVersion().then(function (version) {
            if (version.major === 1 && version.minor === 5) {
                // gotests is not supported in Go 1.5, so skip the test
                return Promise.resolve();
            }
            var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
            vscode.workspace.openTextDocument(uri).then(function (document) {
                return vscode.window.showTextDocument(document).then(function (editor) {
                    return goGenerateTests_1.generateTestCurrentFile().then(function (result) {
                        assert.equal(result, true);
                        return Promise.resolve();
                    });
                });
            });
        }).then(function () { return done(); }, done);
    });
    test('Test Generate unit tests squeleton for package', function (done) {
        goInstallTools_1.getGoVersion().then(function (version) {
            if (version.major === 1 && version.minor === 5) {
                // gotests is not supported in Go 1.5, so skip the test
                return Promise.resolve();
            }
            var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
            vscode.workspace.openTextDocument(uri).then(function (document) {
                return vscode.window.showTextDocument(document).then(function (editor) {
                    return goGenerateTests_1.generateTestCurrentPackage().then(function (result) {
                        assert.equal(result, true);
                        return Promise.resolve();
                    });
                });
            });
        }).then(function () { return done(); }, done);
    });
    test('Gometalinter error checking', function (done) {
        var config = Object.create(vscode.workspace.getConfiguration('go'), {
            'lintTool': { value: 'gometalinter' }
        });
        var expected = [
            { line: 7, severity: 'warning', msg: 'Print2 is unused (deadcode)' },
            { line: 11, severity: 'warning', msg: 'error return value not checked (undeclared name: prin) (errcheck)' },
            { line: 7, severity: 'warning', msg: 'exported function Print2 should have comment or be unexported (golint)' },
            { line: 10, severity: 'warning', msg: 'main2 is unused (deadcode)' },
            { line: 11, severity: 'warning', msg: 'undeclared name: prin (aligncheck)' },
            { line: 11, severity: 'warning', msg: 'undeclared name: prin (gotype)' },
            { line: 11, severity: 'warning', msg: 'undeclared name: prin (interfacer)' },
            { line: 11, severity: 'warning', msg: 'undeclared name: prin (unconvert)' },
            { line: 11, severity: 'error', msg: 'undefined: prin' },
            { line: 11, severity: 'warning', msg: 'unused global variable undeclared name: prin (varcheck)' },
            { line: 11, severity: 'warning', msg: 'unused struct field undeclared name: prin (structcheck)' },
        ];
        goCheck_1.check(path.join(fixturePath, 'errorsTest', 'errors.go'), config).then(function (diagnostics) {
            var sortedDiagnostics = diagnostics.sort(function (a, b) {
                if (a.msg < b.msg)
                    return -1;
                if (a.msg > b.msg)
                    return 1;
                return 0;
            });
            for (var i in expected) {
                assert.equal(sortedDiagnostics[i].line, expected[i].line, "Failed to match expected error #" + i + ": " + JSON.stringify(sortedDiagnostics));
                assert.equal(sortedDiagnostics[i].severity, expected[i].severity, "Failed to match expected error #" + i + ": " + JSON.stringify(sortedDiagnostics));
                assert.equal(sortedDiagnostics[i].msg, expected[i].msg, "Failed to match expected error #" + i + ": " + JSON.stringify(sortedDiagnostics));
            }
            assert.equal(sortedDiagnostics.length, expected.length, "too many errors " + JSON.stringify(sortedDiagnostics));
        }).then(function () { return done(); }, done);
    });
    test('Test diffUtils.getEditsFromUnifiedDiffStr', function (done) {
        var file1path = path.join(fixtureSourcePath, 'diffTestData', 'file1.go');
        var file2path = path.join(fixtureSourcePath, 'diffTestData', 'file2.go');
        var file1uri = vscode.Uri.file(file1path);
        var file2contents = fs.readFileSync(file2path, 'utf8');
        var diffPromise = new Promise(function (resolve, reject) {
            cp.exec("diff -u " + file1path + " " + file2path, function (err, stdout, stderr) {
                var filePatches = diffUtils_1.getEditsFromUnifiedDiffStr(stdout);
                if (!filePatches && filePatches.length !== 1) {
                    assert.fail(null, null, 'Failed to get patches for the test file');
                    return reject();
                }
                if (!filePatches[0].fileName) {
                    assert.fail(null, null, 'Failed to parse the file path from the diff output');
                    return reject();
                }
                if (!filePatches[0].edits) {
                    assert.fail(null, null, 'Failed to parse edits from the diff output');
                    return reject();
                }
                resolve(filePatches);
            });
        });
        diffPromise.then(function (filePatches) {
            return vscode.workspace.openTextDocument(file1uri).then(function (textDocument) {
                return vscode.window.showTextDocument(textDocument).then(function (editor) {
                    return editor.edit(function (editBuilder) {
                        filePatches[0].edits.forEach(function (edit) {
                            edit.applyUsingTextEditorEdit(editBuilder);
                        });
                    }).then(function () {
                        assert.equal(editor.document.getText(), file2contents);
                        return vscode.commands.executeCommand('workbench.action.files.revert');
                    });
                });
            });
        }).then(function () { return done(); }, done);
    });
    test('Test diffUtils.getEdits', function (done) {
        var file1path = path.join(fixtureSourcePath, 'diffTestData', 'file1.go');
        var file2path = path.join(fixtureSourcePath, 'diffTestData', 'file2.go');
        var file1uri = vscode.Uri.file(file1path);
        var file1contents = fs.readFileSync(file1path, 'utf8');
        var file2contents = fs.readFileSync(file2path, 'utf8');
        var fileEdits = diffUtils_1.getEdits(file1path, file1contents, file2contents);
        if (!fileEdits) {
            assert.fail(null, null, 'Failed to get patches for the test file');
            done();
            return;
        }
        if (!fileEdits.fileName) {
            assert.fail(null, null, 'Failed to parse the file path from the diff output');
            done();
            return;
        }
        if (!fileEdits.edits) {
            assert.fail(null, null, 'Failed to parse edits from the diff output');
            done();
            return;
        }
        vscode.workspace.openTextDocument(file1uri).then(function (textDocument) {
            return vscode.window.showTextDocument(textDocument).then(function (editor) {
                return editor.edit(function (editBuilder) {
                    fileEdits.edits.forEach(function (edit) {
                        edit.applyUsingTextEditorEdit(editBuilder);
                    });
                }).then(function () {
                    assert.equal(editor.document.getText(), file2contents);
                    return vscode.commands.executeCommand('workbench.action.files.revert');
                });
            }).then(function () { return done(); }, done);
        });
    });
    test('Test Env Variables are passed to Tests', function (done) {
        var config = Object.create(vscode.workspace.getConfiguration('go'), {
            'testEnvVars': { value: { 'dummyEnvVar': 'dummyEnvValue' } }
        });
        var uri = vscode.Uri.file(path.join(fixturePath, 'sample_test.go'));
        vscode.workspace.openTextDocument(uri).then(function (document) {
            return vscode.window.showTextDocument(document).then(function (editor) {
                return goTest_1.testCurrentFile(config).then(function (result) {
                    assert.equal(result, true);
                    return Promise.resolve();
                });
            });
        }).then(function () { return done(); }, done);
    });
    test('Test Outline', function (done) {
        var filePath = path.join(fixturePath, 'test.go');
        goOutline_1.documentSymbols(filePath).then(function (outlines) {
            var packageOutline = outlines[0];
            var symbols = packageOutline.children;
            var imports = symbols.filter(function (x) { return x.type === 'import'; });
            var functions = symbols.filter(function (x) { return x.type === 'function'; });
            assert.equal(packageOutline.type, 'package');
            assert.equal(packageOutline.label, 'main');
            assert.equal(imports[0].label, '"fmt"');
            assert.equal(functions[0].label, 'print');
            assert.equal(functions[1].label, 'main');
            done();
        }, done);
    });
    test('Test listPackages', function (done) {
        var uri = vscode.Uri.file(path.join(fixturePath, 'test.go'));
        vscode.workspace.openTextDocument(uri).then(function (document) {
            return vscode.window.showTextDocument(document).then(function (editor) {
                var includeImportedPkgs = goImport_1.listPackages(false);
                var excludeImportedPkgs = goImport_1.listPackages(true);
                includeImportedPkgs.then(function (pkgs) {
                    assert.equal(pkgs.indexOf('fmt') > -1, true);
                });
                excludeImportedPkgs.then(function (pkgs) {
                    assert.equal(pkgs.indexOf('fmt') > -1, false);
                });
                return Promise.all([includeImportedPkgs, excludeImportedPkgs]);
            });
        }).then(function () { return done(); }, done);
    });
});
//# sourceMappingURL=go.test.js.map