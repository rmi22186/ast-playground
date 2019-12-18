"use strict";
exports.__esModule = true;
var documentPlan = {
    version: 2,
    data_plan_id: 'rob_test',
    version_description: null,
    activated_environment: 'none',
    created_on: '2019-11-18T21:39:22.85',
    created_by: 'ring@mparticle.com',
    last_modified_on: '2019-12-09T20:39:00.6',
    last_modified_by: 'ring@mparticle.com',
    version_document: {
        data_points: [
            {
                description: 'test description',
                match: {
                    type: 'custom_event',
                    criteria: {
                        event_name: 'test-nav',
                        custom_event_type: 'navigation'
                    }
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                additionalProperties: true,
                                properties: {
                                    custom_event_type: {
                                        "const": 'navigation'
                                    },
                                    event_name: {
                                        "const": 'test-nav'
                                    },
                                    custom_attributes: {
                                        additionalProperties: false,
                                        properties: {
                                            foo: {
                                                description: 'abc',
                                                type: 'string'
                                            }
                                        },
                                        required: []
                                    }
                                },
                                required: ['custom_event_type', 'event_name']
                            }
                        }
                    }
                }
            },
            {
                description: 'User Attributes',
                match: {
                    type: 'user_attributes',
                    criteria: {}
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        additionalProperties: false,
                        properties: {
                            height: {
                                description: '',
                                pattern: '^-?\\d+(\\.\\d+)?([eE][+\\-]?\\d+)?$',
                                type: 'string'
                            }
                        },
                        required: []
                    }
                }
            },
            {
                description: 'test',
                match: {
                    type: 'custom_event',
                    criteria: {
                        event_name: 'testEvent1',
                        custom_event_type: 'other'
                    }
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                additionalProperties: true,
                                properties: {
                                    custom_event_type: {
                                        "const": 'other'
                                    },
                                    event_name: {
                                        "const": 'testEvent1'
                                    },
                                    custom_attributes: {
                                        additionalProperties: false,
                                        properties: {
                                            attrKey1: {
                                                description: '',
                                                type: 'string'
                                            },
                                            requiredKey1: {
                                                description: '',
                                                type: 'string'
                                            }
                                        },
                                        required: []
                                    }
                                },
                                required: ['custom_event_type', 'event_name']
                            }
                        }
                    }
                }
            },
        ],
        settings: {
            validation_actions: {
                event: 'allow',
                event_attribute: 'allow',
                user_attribute: 'allow'
            }
        }
    }
};
exports.documentPlan = documentPlan;
