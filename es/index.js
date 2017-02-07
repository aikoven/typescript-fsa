export function isType(action, actionCreator) {
    return action.type === actionCreator.type;
}
export default function actionCreatorFactory(prefix, defaultIsError = p => p instanceof Error) {
    const actionTypes = {};
    const base = prefix ? `${prefix}/` : "";
    function actionCreator(type, commonMeta, isError = defaultIsError) {
        const fullType = base + type;
        if (process.env.NODE_ENV !== 'production') {
            if (actionTypes[fullType])
                throw new Error(`Duplicate action type: ${fullType}`);
            actionTypes[fullType] = true;
        }
        return Object.assign((payload, meta) => {
            const action = {
                type: fullType,
                payload,
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
            started: actionCreator(`${type}_STARTED`, commonMeta, false),
            done: actionCreator(`${type}_DONE`, commonMeta, false),
            failed: actionCreator(`${type}_FAILED`, commonMeta, true),
        };
    }
    return Object.assign(actionCreator, { async: asyncActionCreators });
}
