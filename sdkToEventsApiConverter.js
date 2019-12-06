'use strict';
var __assign =
    (this && this.__assign) ||
    function() {
        __assign =
            Object.assign ||
            function(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
// import {
//     SDKEvent,
//     SDKConsentState,
//     SDKGDPRConsentState,
//     SDKProduct,
//     SDKPromotion,
//     SDKUserIdentity,
//     SDKProductActionType,
//     MParticleWebSDK,
// } from './sdkRuntimeModels';
// import * as EventsApi from './eventsApiModels';
var Types = require('./types');
var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;
var window = new JSDOM().window;
function convertEvents(mpid, sdkEvents, mpInstance) {
    if (!mpid) {
        return null;
    }
    if (!sdkEvents || sdkEvents.length < 1) {
        return null;
    }
    var uploadEvents = [];
    var lastEvent = null;
    for (var _i = 0, sdkEvents_1 = sdkEvents; _i < sdkEvents_1.length; _i++) {
        var sdkEvent = sdkEvents_1[_i];
        if (sdkEvent) {
            lastEvent = sdkEvent;
            var baseEvent = convertEvent(sdkEvent);
            if (baseEvent) {
                uploadEvents.push(baseEvent);
            }
        }
    }
    if (!lastEvent) {
        return null;
    }
    var upload = {
        source_request_id: mpInstance._Helpers.generateUniqueId(),
        mpid: mpid,
        timestamp_unixtime_ms: new Date().getTime(),
        environment: lastEvent.Debug ? 'development' : 'production',
        events: uploadEvents,
        mp_deviceid: lastEvent.DeviceId,
        sdk_version: lastEvent.SDKVersion,
        application_info: {
            application_version: lastEvent.AppVersion,
        },
        device_info: {
            platform: 'web',
            screen_width: window.screen.width,
            screen_height: window.screen.height,
        },
        user_attributes: lastEvent.UserAttributes,
        user_identities: convertUserIdentities(lastEvent.UserIdentities),
        consent_state: convertConsentState(lastEvent.ConsentState),
        integration_attributes: lastEvent.IntegrationAttributes,
        context: {
            data_plan: {
                plan_version: lastEvent.DataPlan
                    ? lastEvent.DataPlan.PlanVersion
                    : null,
                plan_id: lastEvent.DataPlan ? lastEvent.DataPlan.PlanId : null,
            },
        },
    };
    return upload;
}
exports.convertEvents = convertEvents;
function convertConsentState(sdkConsentState) {
    if (!sdkConsentState) {
        return null;
    }
    var consentState = {
        gdpr: convertGdprConsentState(sdkConsentState.getGDPRConsentState()),
    };
    return consentState;
}
exports.convertConsentState = convertConsentState;
function convertGdprConsentState(sdkGdprConsentState) {
    if (!sdkGdprConsentState) {
        return null;
    }
    var state = {};
    for (var purpose in sdkGdprConsentState) {
        if (sdkGdprConsentState.hasOwnProperty(purpose)) {
            state[purpose] = {
                consented: sdkGdprConsentState[purpose].Consented,
                hardware_id: sdkGdprConsentState[purpose].HardwareId,
                document: sdkGdprConsentState[purpose].ConsentDocument,
                timestamp_unixtime_ms: sdkGdprConsentState[purpose].Timestamp,
                location: sdkGdprConsentState[purpose].Location,
            };
        }
    }
    return state;
}
exports.convertGdprConsentState = convertGdprConsentState;
function convertUserIdentities(sdkUserIdentities) {
    if (!sdkUserIdentities || !sdkUserIdentities.length) {
        return null;
    }
    var batchIdentities = {};
    for (
        var _i = 0, sdkUserIdentities_1 = sdkUserIdentities;
        _i < sdkUserIdentities_1.length;
        _i++
    ) {
        var identity = sdkUserIdentities_1[_i];
        switch (identity.Type) {
            case Types.IdentityType.CustomerId:
                batchIdentities.customer_id = identity.Identity;
                break;
            case Types.IdentityType.Email:
                batchIdentities.email = identity.Identity;
                break;
            case Types.IdentityType.Facebook:
                batchIdentities.facebook = identity.Identity;
                break;
            case Types.IdentityType.FacebookCustomAudienceId:
                batchIdentities.facebook_custom_audience_id = identity.Identity;
                break;
            case Types.IdentityType.Google:
                batchIdentities.google = identity.Identity;
                break;
            case Types.IdentityType.Microsoft:
                batchIdentities.microsoft = identity.Identity;
                break;
            case Types.IdentityType.Other:
                batchIdentities.other = identity.Identity;
                break;
            case Types.IdentityType.Other2:
                batchIdentities.other_id_2 = identity.Identity;
                break;
            case Types.IdentityType.Other3:
                batchIdentities.other_id_3 = identity.Identity;
                break;
            case Types.IdentityType.Other4:
                batchIdentities.other_id_4 = identity.Identity;
                break;
            default:
                break;
        }
    }
    return batchIdentities;
}
exports.convertUserIdentities = convertUserIdentities;
function convertEvent(sdkEvent) {
    if (!sdkEvent) {
        return null;
    }
    switch (sdkEvent.EventDataType) {
        case Types.MessageType.AppStateTransition:
            return convertAST(sdkEvent);
        case Types.MessageType.Commerce:
            return convertCommerceEvent(sdkEvent);
        case Types.MessageType.CrashReport:
            return convertCrashReportEvent(sdkEvent);
        case Types.MessageType.OptOut:
            return convertOptOutEvent(sdkEvent);
        case Types.MessageType.PageEvent:
            return convertCustomEvent(sdkEvent);
        case Types.MessageType.PageView:
            return convertPageViewEvent(sdkEvent);
        case Types.MessageType.Profile:
            //deprecated and not supported by the web SDK
            return null;
        case Types.MessageType.SessionEnd:
            return convertSessionEndEvent(sdkEvent);
        case Types.MessageType.SessionStart:
            return convertSessionStartEvent(sdkEvent);
        case Types.MessageType.UserAttributeChange:
            return convertUserAttributeChangeEvent(sdkEvent);
        case Types.MessageType.UserIdentityChange:
            return convertUserIdentityChangeEvent(sdkEvent);
        default:
            break;
    }
    return null;
}
exports.convertEvent = convertEvent;
function convertProductActionType(actionType) {
    if (!actionType) {
        return 'unknown';
    }
    switch (actionType) {
        case SDKProductActionType.AddToCart:
            return 'add_to_cart';
        case SDKProductActionType.AddToWishlist:
            return 'add_to_wishlist';
        case SDKProductActionType.Checkout:
            return 'checkout';
        case SDKProductActionType.CheckoutOption:
            return 'checkout_option';
        case SDKProductActionType.Click:
            return 'click';
        case SDKProductActionType.Purchase:
            return 'purchase';
        case SDKProductActionType.Refund:
            return 'refund';
        case SDKProductActionType.RemoveFromCart:
            return 'remove_from_cart';
        case SDKProductActionType.RemoveFromWishlist:
            return 'remove_from_wish_list';
        case SDKProductActionType.ViewDetail:
            return 'view_detail';
        default:
            return 'unknown';
    }
}
exports.convertProductActionType = convertProductActionType;
function convertProductAction(sdkEvent) {
    if (!sdkEvent.ProductAction) {
        return null;
    }
    var productAction = {
        action: convertProductActionType(
            sdkEvent.ProductAction.ProductActionType
        ),
        checkout_step: sdkEvent.ProductAction.CheckoutStep,
        checkout_options: sdkEvent.ProductAction.CheckoutOptions,
        transaction_id: sdkEvent.ProductAction.TransactionId,
        affiliation: sdkEvent.ProductAction.Affiliation,
        total_amount: sdkEvent.ProductAction.TotalAmount,
        tax_amount: sdkEvent.ProductAction.TaxAmount,
        shipping_amount: sdkEvent.ProductAction.ShippingAmount,
        coupon_code: sdkEvent.ProductAction.CouponCode,
        products: convertProducts(sdkEvent.ProductAction.ProductList),
    };
    return productAction;
}
exports.convertProductAction = convertProductAction;
function convertProducts(sdkProducts) {
    if (!sdkProducts || !sdkProducts.length) {
        return null;
    }
    var products = [];
    for (
        var _i = 0, sdkProducts_1 = sdkProducts;
        _i < sdkProducts_1.length;
        _i++
    ) {
        var sdkProduct = sdkProducts_1[_i];
        var product = {
            id: sdkProduct.Sku,
            name: sdkProduct.Name,
            brand: sdkProduct.Brand,
            category: sdkProduct.Category,
            variant: sdkProduct.Variant,
            total_product_amount: sdkProduct.TotalAmount,
            position: sdkProduct.Position,
            price: sdkProduct.Price,
            quantity: sdkProduct.Quantity,
            coupon_code: sdkProduct.CouponCode,
            custom_attributes: sdkProduct.Attributes,
        };
        products.push(product);
    }
    return products;
}
exports.convertProducts = convertProducts;
function convertPromotionAction(sdkEvent) {
    if (!sdkEvent.PromotionAction) {
        return null;
    }
    var promotionAction = {
        action: sdkEvent.PromotionAction.PromotionActionType,
        promotions: convertPromotions(sdkEvent.PromotionAction.PromotionList),
    };
    return promotionAction;
}
exports.convertPromotionAction = convertPromotionAction;
function convertPromotions(sdkPromotions) {
    if (!sdkPromotions || !sdkPromotions.length) {
        return null;
    }
    var promotions = [];
    for (
        var _i = 0, sdkPromotions_1 = sdkPromotions;
        _i < sdkPromotions_1.length;
        _i++
    ) {
        var sdkPromotion = sdkPromotions_1[_i];
        var promotion = {
            id: sdkPromotion.Id,
            name: sdkPromotion.Name,
            creative: sdkPromotion.Creative,
            position: sdkPromotion.Position,
        };
        promotions.push(promotion);
    }
    return promotions;
}
exports.convertPromotions = convertPromotions;
function convertImpressions(sdkEvent) {
    if (!sdkEvent.ProductImpressions) {
        return null;
    }
    var impressions = [];
    for (var _i = 0, _a = sdkEvent.ProductImpressions; _i < _a.length; _i++) {
        var sdkImpression = _a[_i];
        var impression = {
            product_impression_list: sdkImpression.ProductImpressionList,
            products: convertProducts(sdkImpression.ProductList),
        };
        impressions.push(impression);
    }
    return impressions;
}
exports.convertImpressions = convertImpressions;
function convertShoppingCart(sdkEvent) {
    if (
        !sdkEvent.ShoppingCart ||
        !sdkEvent.ShoppingCart.ProductList ||
        !sdkEvent.ShoppingCart.ProductList.length
    ) {
        return null;
    }
    var shoppingCart = {
        products: convertProducts(sdkEvent.ShoppingCart.ProductList),
    };
    return shoppingCart;
}
exports.convertShoppingCart = convertShoppingCart;
function convertCommerceEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var commerceEventData = {
        custom_flags: sdkEvent.CustomFlags,
        product_action: convertProductAction(sdkEvent),
        promotion_action: convertPromotionAction(sdkEvent),
        product_impressions: convertImpressions(sdkEvent),
        shopping_cart: convertShoppingCart(sdkEvent),
        currency_code: sdkEvent.CurrencyCode,
    };
    commerceEventData = Object.assign(commerceEventData, commonEventData);
    return {
        event_type: 'commerce_event',
        data: commerceEventData,
    };
}
exports.convertCommerceEvent = convertCommerceEvent;
function convertCrashReportEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var crashReportEventData = {
        message: sdkEvent.EventName,
    };
    crashReportEventData = Object.assign(crashReportEventData, commonEventData);
    return {
        event_type: 'crash_report',
        data: crashReportEventData,
    };
}
exports.convertCrashReportEvent = convertCrashReportEvent;
function convertAST(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var astEventData = {
        application_transition_type: 'application_initialized',
        is_first_run: sdkEvent.IsFirstRun,
        is_upgrade: false,
    };
    astEventData = Object.assign(astEventData, commonEventData);
    return {
        event_type: 'application_state_transition',
        data: astEventData,
    };
}
exports.convertAST = convertAST;
function convertSessionEndEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var sessionEndEventData = {
        session_duration_ms: sdkEvent.SessionLength,
    };
    sessionEndEventData = Object.assign(sessionEndEventData, commonEventData);
    return {
        event_type: 'session_end',
        data: sessionEndEventData,
    };
}
exports.convertSessionEndEvent = convertSessionEndEvent;
function convertSessionStartEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var sessionStartEventData = {};
    sessionStartEventData = Object.assign(
        sessionStartEventData,
        commonEventData
    );
    return {
        event_type: 'session_start',
        data: sessionStartEventData,
    };
}
exports.convertSessionStartEvent = convertSessionStartEvent;
function convertPageViewEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var screenViewEventData = {
        custom_flags: sdkEvent.CustomFlags,
        screen_name: sdkEvent.EventName,
    };
    screenViewEventData = Object.assign(screenViewEventData, commonEventData);
    return {
        event_type: 'screen_view',
        data: screenViewEventData,
    };
}
exports.convertPageViewEvent = convertPageViewEvent;
function convertOptOutEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var optOutEventData = {
        is_opted_out: sdkEvent.OptOut,
    };
    optOutEventData = Object.assign(optOutEventData, commonEventData);
    return {
        event_type: 'opt_out',
        data: optOutEventData,
    };
}
exports.convertOptOutEvent = convertOptOutEvent;
function convertCustomEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var customEventData = {
        custom_event_type: convertSdkEventType(sdkEvent.EventCategory),
        custom_flags: sdkEvent.CustomFlags,
        event_name: sdkEvent.EventName,
    };
    customEventData = Object.assign(customEventData, commonEventData);
    return {
        event_type: 'custom_event',
        data: customEventData,
    };
}
exports.convertCustomEvent = convertCustomEvent;
function convertSdkEventType(sdkEventType) {
    switch (sdkEventType) {
        case Types.EventType.Other:
            return 'other';
        case Types.EventType.Location:
            return 'location';
        case Types.EventType.Navigation:
            return 'navigation';
        case Types.EventType.Search:
            return 'search';
        case Types.EventType.Social:
            return 'social';
        case Types.EventType.Transaction:
            return 'transaction';
        case Types.EventType.UserContent:
            return 'user_content';
        case Types.EventType.UserPreference:
            return 'user_preference';
        case Types.CommerceEventType.ProductAddToCart:
            return 'add_to_cart';
        case Types.CommerceEventType.ProductAddToWishlist:
            return 'add_to_wishlist';
        case Types.CommerceEventType.ProductCheckout:
            return 'checkout';
        case Types.CommerceEventType.ProductCheckoutOption:
            return 'checkout_option';
        case Types.CommerceEventType.ProductClick:
            return 'click';
        case Types.CommerceEventType.ProductImpression:
            return 'impression';
        case Types.CommerceEventType.ProductPurchase:
            return 'purchase';
        case Types.CommerceEventType.ProductRefund:
            return 'refund';
        case Types.CommerceEventType.ProductRemoveFromCart:
            return 'remove_from_cart';
        case Types.CommerceEventType.ProductRemoveFromWishlist:
            return 'remove_from_wishlist';
        case Types.CommerceEventType.ProductViewDetail:
            return 'view_detail';
        case Types.CommerceEventType.PromotionClick:
            return 'promotion_click';
        case Types.CommerceEventType.PromotionView:
            return 'promotion_view';
        default:
            return 'unknown';
    }
}
exports.convertSdkEventType = convertSdkEventType;
function convertBaseEventData(sdkEvent) {
    var commonEventData = {
        timestamp_unixtime_ms: sdkEvent.Timestamp,
        session_uuid: sdkEvent.SessionId,
        session_start_unixtime_ms: sdkEvent.SessionStartDate,
        custom_attributes: sdkEvent.EventAttributes,
        location: sdkEvent.Location,
    };
    return commonEventData;
}
exports.convertBaseEventData = convertBaseEventData;
function convertUserAttributeChangeEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var userAttributeChangeEvent = {
        user_attribute_name: sdkEvent.UserAttributeChanges.UserAttributeName,
        new: sdkEvent.UserAttributeChanges.New,
        old: sdkEvent.UserAttributeChanges.Old,
        deleted: sdkEvent.UserAttributeChanges.Deleted,
        is_new_attribute: sdkEvent.UserAttributeChanges.IsNewAttribute,
    };
    userAttributeChangeEvent = __assign(
        {},
        userAttributeChangeEvent,
        commonEventData
    );
    return {
        event_type: 'user_attribute_change',
        data: userAttributeChangeEvent,
    };
}
exports.convertUserAttributeChangeEvent = convertUserAttributeChangeEvent;
function convertUserIdentityChangeEvent(sdkEvent) {
    var commonEventData = convertBaseEventData(sdkEvent);
    var userIdentityChangeEvent = {
        new: {
            identity_type: sdkEvent.UserIdentityChanges.New.IdentityType,
            identity: sdkEvent.UserIdentityChanges.New.Identity || null,
            timestamp_unixtime_ms: sdkEvent.Timestamp,
            created_this_batch:
                sdkEvent.UserIdentityChanges.New.CreatedThisBatch,
        },
        old: {
            identity_type: sdkEvent.UserIdentityChanges.Old.IdentityType,
            identity: sdkEvent.UserIdentityChanges.Old.Identity || null,
            timestamp_unixtime_ms: sdkEvent.Timestamp,
            created_this_batch:
                sdkEvent.UserIdentityChanges.Old.CreatedThisBatch,
        },
    };
    userIdentityChangeEvent = Object.assign(
        userIdentityChangeEvent,
        commonEventData
    );
    return {
        event_type: 'user_identity_change',
        data: userIdentityChangeEvent,
    };
}
exports.convertUserIdentityChangeEvent = convertUserIdentityChangeEvent;
