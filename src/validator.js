"use strict";
exports.__esModule = true;
var acorn_1 = require("acorn");
var walk = require("acorn-walk");
var jsdom = require("jsdom");
var dataplan_1 = require("./dataplan");
var validationExample_1 = require("./validationExample");
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
var DataPlanService;
function returnValidations(contents, textDocUri) {
    var diagnostics = [];
    var foundInvocations = {};
    walk.simple(acorn_1.Parser.parse(contents.getText()), {
        ExpressionStatement: function (node) {
            var currentNodeArguments = {};
            var nodeObject = node.expression.callee;
            // looking for mParticle.logEvent
            if (nodeObject.object.name === 'mParticle') {
                if (nodeObject.property.name === 'logEvent') {
                    var validationResult = {};
                    var batch = createLogEventBatch(node, currentNodeArguments);
                    var model = {
                        batch: batch,
                        document: dataplan_1.documentPlan.version_document
                    };
                    if (DataPlanService) {
                        validationResult = DataPlanService.validate('workspaceid', 'workspacetoken', 'anothertoken', model);
                    }
                    else {
                        validationResult = validationExample_1.validationExample;
                    }
                    var completedDiagnostics = createDiagnostics(diagnostics, validationResult, contents, currentNodeArguments);
                }
            }
        }
    });
    return diagnostics;
}
exports["default"] = returnValidations;
function createLogEventBatch(node, currentNodeArguments) {
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
    return mParticle._BatchValidator.returnBatch(event);
}
exports.createLogEventBatch = createLogEventBatch;
function createDiagnostics(diagnostics, validationResult, contents, currentNodeArguments) {
    var validationObject = {};
    if (validationResult &&
        validationResult &&
        Array.isArray(validationResult.results)) {
        validationResult.results.forEach(function (result) {
            if (result &&
                result.data &&
                Array.isArray(result.data.validation_errors)) {
                result.data.validation_errors.forEach(function (error) {
                    if ((error.error_pointer = '#')) {
                        var diag = {
                            severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                            range: {
                                start: currentNodeArguments.event_name
                                    ? contents.positionAt(currentNodeArguments.event_name.start)
                                    : contents.positionAt(0),
                                end: currentNodeArguments.event_name
                                    ? contents.positionAt(currentNodeArguments.event_name.end)
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
    return diagnostics;
}
// fs.readFile('./test-ast.js', function(err: any, contents: string) {
//     var validations = returnValidations(contents);
//     console.log(validations);
// });
