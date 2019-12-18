"use strict";
exports.__esModule = true;
// / <reference types="vscode"" />
var validator_1 = require("../src/validator");
var vscode = require("vscode");
// let documents: TextDocuments = new TextDocuments();
describe('Parser', function () {
    it('should be valid', function () {
        vscode.workspace.openTextDocument('../test-ast').then(function (document) {
            var text = document.getText();
            console.log(text);
        });
        // fs.readFile('../test-ast', function(err, contents) {
        //     var stringOfDocument = Parser.parse(contents.toString());
        //     var textDoc: TextDocument = {
        //         uri: 'hi',
        //         languageId: 'hi',
        //         version: 1,
        //         getText: function(range?) {
        //             if (!range) {
        //                 return stringOfDocument;
        //             }
        //         },
        //         positionAt:
        //     };
        //     var validations = returnValidations(textDoc, 'uri');
        //     console.log(validations);
        // });
        console.log(validator_1["default"]);
    });
});
