"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatRelativeTime = formatRelativeTime;
exports.sanitizeInput = sanitizeInput;
exports.truncate = truncate;
exports.capitalize = capitalize;
exports.toKebabCase = toKebabCase;
exports.toCamelCase = toCamelCase;
exports.maskSensitiveData = maskSensitiveData;
function formatDate(date) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
}
function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffSec < 60)
        return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    if (diffMin < 60)
        return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24)
        return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 30)
        return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    return formatDate(date);
}
function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
}
function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
}
function capitalize(str) {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
function toCamelCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}
function maskSensitiveData(value, visibleChars = 3) {
    if (value.length <= visibleChars * 2)
        return value;
    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    const masked = '*'.repeat(value.length - visibleChars * 2);
    return `${start}${masked}${end}`;
}
//# sourceMappingURL=formatters.js.map