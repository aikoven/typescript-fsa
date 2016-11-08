"use strict";
function isType(action, actionCreator) {
    return action.type === actionCreator.type;
}
exports.isType = isType;
var isDev = (process && process.env && process.env.NODE_ENV) !== 'production';
function wrapIsError(default_, isError) {
    if (isError === undefined) {
        return default_;
    }
    if (typeof isError === "boolean") {
        return function () { return isError; };
    }
    return isError;
}
function actionCreatorFactory(prefix, defaultIsError) {
    if (defaultIsError === void 0) { defaultIsError = function (p) { return p instanceof Error; }; }
    var actionTypes = {};
    var base = prefix ? prefix + "/" : "";
    function baseActionCreator(isError, type, commonMeta) {
        var fullType = "" + base + type;
        if (isDev) {
            if (actionTypes[fullType])
                throw new Error("Duplicate action type: " + fullType);
            actionTypes[fullType] = true;
        }
        return Object.assign(function (payload, meta) {
            var action = {
                type: fullType,
                payload: payload,
                meta: Object.assign({}, commonMeta, meta),
            };
            if (isError(payload)) {
                action.error = true;
            }
            return action;
        }, { type: fullType });
    }
    var actionCreator = function (type, commonMeta, isError) {
        return baseActionCreator(wrapIsError(defaultIsError, isError), type, commonMeta);
    };
    function asyncActionCreators(type, commonMeta) {
        return {
            type: prefix ? prefix + "/" + type : type,
            started: actionCreator(type + "_STARTED", commonMeta, false),
            done: actionCreator(type + "_DONE", commonMeta, false),
            failed: actionCreator(type + "_FAILED", commonMeta, true),
        };
    }
    return Object.assign(actionCreator, { async: asyncActionCreators });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = actionCreatorFactory;
