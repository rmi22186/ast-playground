var Types = require('./types');

function createEventObject(event, Store) {
    var uploadObject = {};
    var eventObject = {};
    var optOut =
        event.messageType === Types.MessageType.OptOut
            ? !Store.isEnabled
            : null;

    if (
        Store.sessionId ||
        event.messageType == Types.MessageType.OptOut ||
        Store.webviewBridgeEnabled
    ) {
        if (event.hasOwnProperty('toEventAPIObject')) {
            eventObject = event.toEventAPIObject();
        } else {
            eventObject = {
                EventName: event.name || event.messageType,
                EventCategory: event.eventType,
                EventAttributes: event.data, // mpInstance._Helpers.sanitizeAttributes(event.data),
                EventDataType: event.messageType,
                CustomFlags: event.customFlags || {},
                UserAttributeChanges: event.userAttributeChanges,
                UserIdentityChanges: event.userIdentityChanges,
            };
        }

        if (event.messageType !== Types.MessageType.SessionEnd) {
            Store.dateLastEventSent = new Date();
        }

        uploadObject = {
            Store: Store.serverSettings,
            SDKVersion: '1.1.1', //Constants.sdkVersion,
            SessionId: Store.sessionId,
            SessionStartDate: Store.sessionStartDate
                ? Store.sessionStartDate.getTime()
                : null,
            Debug: Store.SDKConfig.isDevelopmentMode,
            Location: Store.currentPosition,
            OptOut: optOut,
            ExpandedEventCount: 0,
            AppVersion: Store.SDKConfig.appVersion,
            ClientGeneratedId: Store.clientId,
            DeviceId: Store.deviceId,
            IntegrationAttributes: Store.integrationAttributes,
            CurrencyCode: Store.currencyCode,
            DataPlan: Store.SDKConfig.dataPlan ? Store.SDKConfig.dataPlan : {},
        };

        eventObject.CurrencyCode = Store.currencyCode;
        // var currentUser = mpInstance.Identity.getCurrentUser();
        // self.appendUserInfo(currentUser, eventObject);

        if (event.messageType === Types.MessageType.SessionEnd) {
            eventObject.SessionLength =
                Store.dateLastEventSent.getTime() -
                Store.sessionStartDate.getTime();
            eventObject.currentSessionMPIDs = Store.currentSessionMPIDs;
            eventObject.EventAttributes = Store.sessionAttributes;

            Store.currentSessionMPIDs = [];
            Store.sessionStartDate = null;
        }

        uploadObject.Timestamp = Store.dateLastEventSent.getTime();

        return Object.assign({}, eventObject, uploadObject);
    }

    return null;
}

module.exports = {
    createEventObject: createEventObject,
};
