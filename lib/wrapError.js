const { SESSION_MAGIC_ID } = require('../constants');

module.exports = (error, additional = {}) => {
    if (error instanceof Error) {
        let result = Object.assign({ [SESSION_MAGIC_ID]: 1 }, additional);

        let { name, message, detail } = error;
        result.error = { name, message, detail };

        return result;
    }

    return {};
};