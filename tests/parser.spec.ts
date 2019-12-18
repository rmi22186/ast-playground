import returnValidations from '../src/parser';
import { Parser } from 'acorn';
import * as fs from 'fs';
import {
    Diagnostic,
    DiagnosticSeverity,
    TextDocument,
} from 'vscode-languageserver';

describe('Parser', () => {
    it('should be valid', () => {
        fs.readFile('../test-ast', function(err, contents) {
            var textDocument = Parser.parse(contents);
            var validations = returnValidations(contents, 'uri');
            console.log(validations);
        });

        console.log(returnValidations);
    });
});
