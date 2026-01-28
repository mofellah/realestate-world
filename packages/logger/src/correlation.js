"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCorrelationId = generateCorrelationId;
exports.extractCorrelationId = extractCorrelationId;
exports.getOrGenerateCorrelationId = getOrGenerateCorrelationId;
exports.correlationIdMiddleware = correlationIdMiddleware;
const crypto_1 = require("crypto");
function generateCorrelationId() {
    const timestamp = Date.now().toString(36);
    const random = (0, crypto_1.randomBytes)(8).toString('hex');
    return `${timestamp}-${random}`;
}
function extractCorrelationId(headers, headerName = 'x-correlation-id') {
    const value = headers[headerName] || headers[headerName.toLowerCase()];
    if (!value)
        return null;
    if (Array.isArray(value)) {
        return value[0] || null;
    }
    return value;
}
function getOrGenerateCorrelationId(headers, headerName = 'x-correlation-id') {
    return extractCorrelationId(headers, headerName) || generateCorrelationId();
}
function correlationIdMiddleware(headerName = 'x-correlation-id') {
    return (req, res, next) => {
        const correlationId = getOrGenerateCorrelationId(req.headers, headerName);
        req.correlationId = correlationId;
        res.setHeader(headerName, correlationId);
        next();
    };
}
//# sourceMappingURL=correlation.js.map