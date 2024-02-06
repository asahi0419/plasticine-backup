'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var getRandomId = function (prefix) {
    if (prefix === void 0) { prefix = ''; }
    var randomId = Math.random().toString(36).substr(2, 9);
    return prefix + randomId;
};

var canvasToImage = function (_a) {
    var text = _a.text, style = _a.style, position = _a.position, multiple = _a.multiple;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var width = style.width, height = style.height, _b = style.color, color = _b === void 0 ? '#000' : _b, _c = style.fontSize, fontSize = _c === void 0 ? 16 : _c, _d = style.fontFamily, fontFamily = _d === void 0 ? 'sans-serif' : _d, _e = style.opacity, opacity = _e === void 0 ? 0.13 : _e, _f = style.rotate, rotate = _f === void 0 ? 25 : _f, _g = style.space, space = _g === void 0 ? 0 : _g, _h = style.h_space, h_space = _h === void 0 ? 0 : _h;
    canvas.width = width;
    canvas.height = height;
    ctx.font = fontSize + "px " + fontFamily;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    if (multiple) {
        var textWidth = ctx.measureText(text).width;
        var horizontalSpace = h_space ? Math.floor(textWidth + h_space) : Math.floor(textWidth * 1.5);
        var verticalSpace = space || Math.floor(fontSize * 2.5);
        var centerX = Math.floor(width / 2);
        var centerY = Math.floor(height / 2);
        // Reference: https://riptutorial.com/html5-canvas/example/19532/rotate-an-image-or-path-around-it-s-centerpoint?fbclid=IwAR0D-71k4SVAG4B8swwGkJecCqenDSOnO78ScLhoJYsoYqE5BWutAfXnoIo
        ctx.translate(centerX, centerY);
        ctx.rotate((Math.PI / 180) * rotate);
        ctx.translate(-centerX, -centerY);
        for (var posX = -centerX; posX <= width + textWidth + centerX; posX += horizontalSpace) {
            for (var posY = -centerY; posY <= height + verticalSpace + centerY; posY += verticalSpace) {
                ctx.fillText(text, posX, posY);
            }
        }
    }
    else {
        var _h = position, x = _h.x, y = _h.y;
        ctx.rotate((Math.PI / 180) * rotate);
        ctx.fillText(text, x, y);
    }
    return canvas.toDataURL();
};

var $id = document.getElementById.bind(document);

var SecurityDefense = /** @class */ (function () {
    function SecurityDefense(_a) {
        var watermarkWrapperId = _a.watermarkWrapperId, watermarkId = _a.watermarkId;
        this.watermarkWrapperId = watermarkWrapperId;
        this.watermarkId = watermarkId;
    }
    SecurityDefense.prototype.getWatermarkWrapperObserver = function () {
        var _this = this;
        var watermarkWrapper = $id(this.watermarkWrapperId);
        return new MutationObserver(function (mutations) {
            var removedWatermarkNode;
            mutations.forEach(function (mutation) {
                var removedNodes = Array.from(mutation.removedNodes);
                removedWatermarkNode = removedNodes.find(function (node) { return node.id === _this.watermarkId; });
            });
            if (removedWatermarkNode) {
                watermarkWrapper.prepend(removedWatermarkNode);
            }
        });
    };
    SecurityDefense.prototype.getWatermarkObserver = function () {
        var watermark = $id(this.watermarkId);
        var attributes = watermark.attributes;
        var initialAttributes = {};
        Object.values(attributes).forEach(function (_a) {
            var name = _a.name, value = _a.value;
            initialAttributes[name] = value;
        });
        return new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                var target = mutation.target;
                var attributeName = mutation.attributeName;
                if (attributeName in initialAttributes) {
                    if (target.getAttribute(attributeName) !==
                        initialAttributes[attributeName]) {
                        target.setAttribute(attributeName, initialAttributes[attributeName]);
                    }
                }
                else {
                    target.removeAttribute(attributeName);
                }
            });
        });
    };
    return SecurityDefense;
}());

var WATERMARK_WRAPPER_DEFAULT_STYLE = {
    position: 'relative',
    'WebkitPrintColorAdjust': 'exact'
};
var WATERMARK_DEFAULT_STYLE = {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    overflow: 'hidden',
    pointerEvents: 'none'
};
var WATERMARK_DEFAULT_POSITION = {
    x: 50,
    y: 50
};
var Watermark = function (_a) {
    var text = _a.text, style = _a.style, _b = _a.position, position = _b === void 0 ? WATERMARK_DEFAULT_POSITION : _b, multiple = _a.multiple, _c = _a.className, className = _c === void 0 ? '' : _c, children = _a.children;
    var _d = React.useState(''), imageSrc = _d[0], setImageSrc = _d[1];
    var watermarkWrapperId = React.useRef({
        id: getRandomId('watermark-wrapper')
    }).current.id;
    var watermarkId = React.useRef({
        id: getRandomId('watermark')
    }).current.id;
    var watermarkWrapperRef = React.useRef(null);
    var watermarkRef = React.useRef(null);
    React.useEffect(function () {
        var renderedImageSrc = canvasToImage({
            text: text,
            style: style,
            position: position,
            multiple: multiple
        });
        setImageSrc(renderedImageSrc);
    }, [text, style, position, multiple]);
    React.useLayoutEffect(function () {
        if (!imageSrc) {
            return;
        }
        var securityDefense = new SecurityDefense({
            watermarkWrapperId: watermarkWrapperId,
            watermarkId: watermarkId
        });
        var watermarkWrapper = $id(watermarkWrapperId);
        var watermark = $id(watermarkId);
        if (watermarkWrapper && watermarkWrapperRef.current === null) {
            watermarkWrapperRef.current = securityDefense.getWatermarkWrapperObserver();
            watermarkWrapperRef.current.observe(watermarkWrapper, {
                childList: true
            });
        }
        if (watermark && watermarkRef.current === null) {
            watermarkRef.current = securityDefense.getWatermarkObserver();
            watermarkRef.current.observe(watermark, {
                attributes: true,
                attributeOldValue: true
            });
        }
        return function () {
            var _a, _b;
            (_a = watermarkWrapperRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
            (_b = watermarkRef.current) === null || _b === void 0 ? void 0 : _b.disconnect();
        };
    }, [imageSrc]);
    var width = style.width, height = style.height;
    var watermarkWrapperStyle = __assign(__assign({}, WATERMARK_WRAPPER_DEFAULT_STYLE), { width: width,
        height: height });
    var watermarkStyle = __assign(__assign({}, WATERMARK_DEFAULT_STYLE), { width: width,
        height: height, backgroundImage: "url(\"" + imageSrc + "\")" });
    return (React__default['default'].createElement("div", { id: watermarkWrapperId, className: className, style: watermarkWrapperStyle },
        imageSrc && (React__default['default'].createElement("div", { id: watermarkId, style: watermarkStyle })),
        children));
};

exports.default = Watermark;
