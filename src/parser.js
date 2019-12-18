"use strict";
exports.__esModule = true;
var acorn_1 = require("acorn");
var walk = require("acorn-walk");
var jsdom = require("jsdom");
var vscode_languageserver_1 = require("vscode-languageserver");
var globalAny = global;
var JSDOM = jsdom.JSDOM;
var window = new JSDOM().window;
globalAny.window = window;
var mParticle = require("@mparticle/web-sdk");
window.mParticle = mParticle;
var MessageType = {
    SessionStart: 1,
    SessionEnd: 2,
    PageView: 3,
    PageEvent: 4,
    CrashReport: 5,
    OptOut: 6,
    AppStateTransition: 10,
    Profile: 14,
    Commerce: 16,
    Media: 20,
    UserAttributeChange: 17,
    UserIdentityChange: 18
};
function returnValidations(contents, textDocUri) {
    var diagnostics = [];
    var foundInvocations = {};
    walk.simple(acorn_1.Parser.parse(contents.getText()), {
        ExpressionStatement: function (node) {
            var currentNodeArguments = {};
            if (node.expression.callee.object.name === 'mParticle') {
                if (node.expression.callee.property.name === 'logEvent') {
                    var args = [];
                    var event = { messageType: MessageType.PageEvent };
                    //build args
                    node.expression.arguments.forEach(function (arg, i) {
                        switch (arg.type) {
                            case 'Literal':
                                args.push(arg.raw);
                                event.name = arg.value;
                                currentNodeArguments.event_name = {
                                    start: arg.start,
                                    end: arg.end
                                };
                                return;
                            case 'MemberExpression':
                                args.push(arg.object.object.name + "." + arg.object.property.name + "." + arg.property.name);
                                event.eventType = eval(arg.object.object.name + "." + arg.object.property.name + "." + arg.property.name);
                                return;
                            case 'ObjectExpression':
                                var attrs = {};
                                arg.properties.forEach(function (keyVal) {
                                    attrs[keyVal.key.name] = keyVal.value.value;
                                });
                                args.push(JSON.stringify(attrs));
                                if (i === 2) {
                                    event.data = attrs;
                                    currentNodeArguments.custom_attributes = attrs;
                                }
                                if (i === 3) {
                                    event.customFlags = attrs;
                                    currentNodeArguments.custom_flags = attrs;
                                }
                                return;
                        }
                    });
                    var batch = mParticle._BatchValidator.returnBatch(event);
                    var validationObject = {
                        results: [
                            {
                                data: {
                                    validation_errors: [
                                        {
                                            validation_error_type: 'unplanned',
                                            key: 'My Event Name is Wrong',
                                            error_pointer: '#/data/event_name',
                                            action_expected: 'unknown'
                                        },
                                    ]
                                }
                            },
                        ]
                    };
                    if (validationObject &&
                        Array.isArray(validationObject.results)) {
                        validationObject.results.forEach(function (result) {
                            if (result &&
                                result.data &&
                                Array.isArray(result.data.validation_errors)) {
                                result.data.validation_errors.forEach(function (error) {
                                    if ((error.error_pointer =
                                        '#/data/event_name')) {
                                        var diag = {
                                            severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                                            range: {
                                                start: currentNodeArguments.event_name
                                                    ? contents.positionAt(currentNodeArguments
                                                        .event_name.start)
                                                    : contents.positionAt(0),
                                                end: currentNodeArguments.event_name
                                                    ? contents.positionAt(currentNodeArguments
                                                        .event_name.end)
                                                    : contents.positionAt(0)
                                            },
                                            message: "that is messed up"
                                        };
                                        diagnostics.push(diag);
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
    });
    return diagnostics;
}
exports["default"] = returnValidations;
// fs.readFile('./test-ast.js', function(err: any, contents: string) {
//     var validations = returnValidations(contents);
//     console.log(validations);
// });
// var model: any = {};
// model.batch = batch;
// model.document = documentPlan.version_document;
// var validationObject = dataPlanService.validate...(
//     123,
//     123,
//     123,
//     model
// );
// console.log('---valiationObject---');
// console.log(
//     validationObject.results[0].data.validation_errors[0]
//         .validation_error_type
// );
