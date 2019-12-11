"use strict";
exports.__esModule = true;
var globalAny = global;
var Parser = require('acorn').Parser;
var fs = require('fs');
var walk = require('acorn-walk');
var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;
var window = new JSDOM().window;
var documentPlan = require('./dataplan');
globalAny.window = window;
var mParticle = require('@mparticle/web-sdk');
window.mParticle = mParticle;
// const DataPlanService = require('./node_modules/data-planning/src/services/data_plan_service');
var data_plan_service_1 = require("./node_modules/data-planning/src/services/data_plan_service");
// import * as dataPlan from '.';
var dataPlanService = new data_plan_service_1.DataPlanService();
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
function returnValidations(contents) {
    console.log(contents);
    walk.simple(Parser.parse(contents), {
        ExpressionStatement: function (node) {
            if (node.expression.callee.object.name === 'mParticle') {
                if (node.expression.callee.property.name === 'logEvent') {
                    //build args
                    var args = [];
                    var event = { messageType: MessageType.PageEvent };
                    node.expression.arguments.forEach(function (arg, i) {
                        switch (arg.type) {
                            case 'Literal':
                                args.push(arg.raw);
                                event.name = arg.value;
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
                                }
                                if (i === 3) {
                                    event.customFlags = attrs;
                                }
                                return;
                        }
                    });
                    var batch = mParticle._BatchValidator.returnBatch(event);
                    var model = {};
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
        }
    });
    return 'hi there';
}
exports["default"] = returnValidations;
fs.readFile('./test-ast.js', function (err, contents) {
    var validations = returnValidations(contents);
    console.log(validations);
});
