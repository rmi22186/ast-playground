import { Parser } from 'acorn';
import * as walk from 'acorn-walk';
import * as jsdom from 'jsdom';
import { documentPlan } from './dataplan';
import { validationExample } from './validationExample';
import {
    Diagnostic,
    DiagnosticSeverity,
    TextDocument,
} from 'vscode-languageserver';

const globalAny: any = global;
const { JSDOM } = jsdom;
const { window } = new JSDOM();
globalAny.window = window;

import * as mParticle from '@mparticle/web-sdk';
window.mParticle = mParticle;

// const DataPlanService = require('./node_modules/data-planning/src/services/data_plan_service');
// import { DataPlanService } from './node_modules/data-planning/src/services/data_plan_service';
// import * as dataPlan from '.';
// const dataPlanService = new DataPlanService();

type Dictionary = {
    [key: string]: any;
};

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
    UserIdentityChange: 18,
};

var DataPlanService;

export default function returnValidations(
    contents: TextDocument,
    textDocUri: string
): Diagnostic[] {
    var diagnostics: Diagnostic[] = [];
    var foundInvocations = {};
    walk.simple(Parser.parse(contents.getText()), {
        ExpressionStatement(node: any) {
            var currentNodeArguments: {
                event_name?: Dictionary;
                custom_attributes?: Dictionary;
                custom_flags?: Dictionary;
            } = {};

            var nodeObject = node.expression.callee;
            // looking for mParticle.logEvent
            if (nodeObject.object.name === 'mParticle') {
                if (nodeObject.property.name === 'logEvent') {
                    var validationResult: any = {};
                    var batch = createLogEventBatch(node, currentNodeArguments);
                    var model: any = {
                        batch: batch,
                        document: documentPlan.version_document
                    };

                    if (DataPlanService) {
                        validationResult = DataPlanService.validate(
                            'workspaceid',
                            'workspacetoken',
                            'anothertoken',
                            model
                        );
                    } else {
                        validationResult = validationExample;
                    }
                    var completedDiagnostics = createDiagnostics(
                        diagnostics,
                        validationResult,
                        contents,
                        currentNodeArguments
                    );
                }
            }
        }
    });
    return diagnostics;
}

export function createLogEventBatch(node, currentNodeArguments) {
    var args: any = [];
    var event: any = { messageType: MessageType.PageEvent };

    //build args
    node.expression.arguments.forEach((arg: any, i: any) => {
        switch (arg.type) {
            case 'Literal':
                args.push(arg.raw);
                event.name = arg.value;
                currentNodeArguments.event_name = {
                    start: arg.start,
                    end: arg.end,
                };
                return;

            case 'MemberExpression':
                args.push(
                    `${arg.object.object.name}.${arg.object.property.name}.${arg.property.name}`
                );
                event.eventType = eval(
                    `${arg.object.object.name}.${arg.object.property.name}.${arg.property.name}`
                );
                return;
            case 'ObjectExpression':
                var attrs: Dictionary = {};
                arg.properties.forEach((keyVal: Dictionary) => {
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

function createDiagnostics(
    diagnostics,
    validationResult,
    contents,
    currentNodeArguments
): Diagnostic[] {
    var validationObject = {};
    if (
        validationResult &&
        validationResult &&
        Array.isArray(validationResult.results)
    ) {
        validationResult.results.forEach(result => {
            if (
                result &&
                result.data &&
                Array.isArray(result.data.validation_errors)
            ) {
                result.data.validation_errors.forEach(error => {
                    if ((error.error_pointer = '#')) {
                        var diag: Diagnostic = {
                            severity: DiagnosticSeverity.Warning,
                            range: {
                                start: currentNodeArguments.event_name
                                    ? contents.positionAt(
                                          currentNodeArguments.event_name.start
                                      )
                                    : contents.positionAt(0),
                                end: currentNodeArguments.event_name
                                    ? contents.positionAt(
                                          currentNodeArguments.event_name.end
                                      )
                                    : contents.positionAt(0),
                            },
                            message: `that is messed up`,
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