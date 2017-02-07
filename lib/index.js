'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isType = isType;
exports.default = actionCreatorFactory;
function isType(action, actionCreator) {
    return action.type === actionCreator.type;
}
function actionCreatorFactory(prefix) {
    var defaultIsError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (p) {
        return p instanceof Error;
    };

    var actionTypes = {};
    var base = prefix ? prefix + '/' : "";
    function actionCreator(type, commonMeta) {
        var isError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultIsError;

        var fullType = base + type;
        if (process.env.NODE_ENV !== 'production') {
            if (actionTypes[fullType]) throw new Error('Duplicate action type: ' + fullType);
            actionTypes[fullType] = true;
        }
        return Object.assign(function (payload, meta) {
            var action = {
                type: fullType,
                payload: payload
            };
            if (commonMeta || meta) {
                action.meta = Object.assign({}, commonMeta, meta);
            }
            if (isError && (typeof isError === 'boolean' || isError(payload))) {
                action.error = true;
            }
            return action;
        }, { type: fullType });
    }
    function asyncActionCreators(type, commonMeta) {
        return {
            type: base + type,
            started: actionCreator(type + '_STARTED', commonMeta, false),
            done: actionCreator(type + '_DONE', commonMeta, false),
            failed: actionCreator(type + '_FAILED', commonMeta, true)
        };
    }
    return Object.assign(actionCreator, { async: asyncActionCreators });
}