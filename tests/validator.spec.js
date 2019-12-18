var Validator = require('../src/validator');

var vscode = require('vscode');

describe('Parser', function() {
    it('should be valid', function() {
        vscode.workspace
            .openTextDocument('../test-ast')
            .then(function(document) {
                var text = document.getText();
                window.console.log(text);
                Validator.returnValidations(document);
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
        //     var validations = retParserurnValidations(textDoc, 'uri');
        //     console.log(validations);
        // });
        window.console.log(Validator);
    });
});
