"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isType = isType;
exports.default = actionCreatorFactory;
function isType(action, actionCreator) {
    return action.type === actionCreator.type;
}
function actionCreatorFactory(prefix) {
    var actionTypes = {};
    function actionCreator(type, commonMeta, error) {
        if (actionTypes[type]) throw new Error("Duplicate action type: " + type);
        actionTypes[type] = true;
        var fullType = prefix ? prefix + "/" + type : type;
        return Object.assign(function (payload, meta) {
            var action = {
                type: fullType,
                payload: payload,
                meta: Object.assign({}, commonMeta, meta)
            };
            if (error) action.error = error;
            return action;
        }, { type: fullType });
    }
    function asyncActionCreators(type, commonMeta) {
        return {
            type: prefix ? prefix + "/" + type : type,
            started: actionCreator(type + "_STARTED", commonMeta),
            done: actionCreator(type + "_DONE", commonMeta),
            failed: actionCreator(type + "_FAILED", commonMeta, true)
        };
    }
    return Object.assign(actionCreator, { async: asyncActionCreators });
}