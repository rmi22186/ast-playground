// / <reference types="vscode"" />
import returnValidations from '../src/validator';

// import * as vscode from 'vscode';

// let documents: TextDocuments = new TextDocuments();

describe('Parser', () => {
    it('should be valid', () => {
        // workspace.openTextDocument('../test-ast').then(document => {
        //     let text = document.getText();
        //     console.log(text);
        // });
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

        console.log(returnValidations);
    });
});
