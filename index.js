const { Parser } = require('acorn');
const fs = require('fs');
const walk = require('acorn-walk');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
global.window = window;
const mParticle = require('@mparticle/web-sdk');
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
    UserIdentityChange: 18,
};

fs.readFile('./test-ast.js', function(err, contents) {
    walk.simple(Parser.parse(contents), {
        ExpressionStatement(node) {
            if (node.expression.callee.object.name === 'mParticle') {
                if (node.expression.callee.property.name === 'logEvent') {
                    //build args
                    var args = [];
                    var event = { messageType: MessageType.PageEvent };

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

                    console.log('---batch---');
                    console.log(batch);

                    batch.events.forEach(x => {
                        console.log('---event---');
                        console.log(x);
                    });
                    // eval(
                    //     `${node.expression.callee.object.name}.${node.expression.callee.property.name}.apply(null, [${args}])`
                    // );
                }
            }
        },
    });
});
