const globalAny: any = global;
const { Parser } = require('acorn');
const fs = require('fs');
const walk = require('acorn-walk');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const documentPlan = require('./dataplan');
globalAny.window = window;
const mParticle = require('@mparticle/web-sdk');
window.mParticle = mParticle;
// const DataPlanService = require('./node_modules/data-planning/src/services/data_plan_service');
import { DataPlanService } from './node_modules/data-planning/src/services/data_plan_service';
// import * as dataPlan from '.';
const dataPlanService = new DataPlanService();

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

export default function returnValidations(contents: any): string {
    console.log(contents);
    walk.simple(Parser.parse(contents), {
        ExpressionStatement(node) {
            if (node.expression.callee.object.name === 'mParticle') {
                if (node.expression.callee.property.name === 'logEvent') {
                    //build args
                    var args: any = [];
                    var event: any = { messageType: MessageType.PageEvent };

                    node.expression.arguments.forEach((arg, i) => {
                        switch (arg.type) {
                            case 'Literal':
                                args.push(arg.raw);
                                event.name = arg.value;
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
                                var attrs = {};
                                arg.properties.forEach(keyVal => {
                                    attrs[keyVal.key.name] = keyVal.value.value;
                                });
                                args.push(JSON.stringify(attrs));
                                if (i === 2) {
                                    event.data = attrs;
                                }
                                if (i === 3) {
                                    event.customFlags = attrs;
                                }

                                return;
                        }
                    });

                    var batch = mParticle._BatchValidator.returnBatch(event);

                    var model: any = {};
                    model.batch = batch;
                    model.document = documentPlan.version_document;

                    // console.log(model);
                    debugger;
                    console.log('hi');
                    // var valiationObject = dataPlanService.executeDataPlan(
                    //     123,
                    //     123,
                    //     123,
                    //     model
                    // );
                    // console.log('---valiationObject---');
                    // console.log(
                    //     valiationObject.results[0].data.validation_errors[0]
                    //         .validation_error_type
                    // );
                }
            }
        },
    });
    return 'hi there';
}
fs.readFile('./test-ast.js', function(err, contents) {
    var validations = returnValidations(contents);
    console.log(validations);
});
