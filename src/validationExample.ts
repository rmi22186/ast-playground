const validationExample = {
    results: [
        {
            data: {
                validated_event_id: '0',
                match: {
                    type: 'custom_event',
                    criteria: {
                        event_name: 'My Event Name is Wrong',
                        custom_event_type: 'navigation',
                    },
                },
                validation_errors: [
                    {
                        validation_error_type: 'unplanned',
                        key: 'My Event Name is Wrong',
                        error_pointer: '#',
                        action_expected: 'unknown',
                    },
                ],
                timestamp_unixtime_ms: '0',
                session_start_unixtime_ms: '0',
                event_start_unixtime_ms: '0',
                is_goal_defined: false,
                lifetime_value_change: 0.0,
                event_num: 0,
            },
            event_type: 'validation_result',
        },
    ],
};

export { validationExample };
