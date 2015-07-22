/**
 * @fileoverview Utility modules for manipulate DOM elements.
 * @author NHN Ent. FE Development Team <e0242@nhnent.com>
 */
'use strict';

var domevent = require('./domevent');

var util = global.ne.util,
    posKey = '_pos',
    domutil;

function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

domutil = {
    /**
     * Create DOM element and return it.
     * @param {string} tagName Tag name to append.
     * @param {HTMLElement} [container] HTML element will be parent to created element. if not supplied, document.body will use.
     * @param {string} [className] Design class names to appling created element.
     * @returns {HTMLElement} HTML element created.
     */
    appendHTMLElement: function(tagName, container, className) {
        var el;

        className = className || '';

        el = document.createElement(tagName);
        el.className = className;

        if (container) {
            container.appendChild(el);
        } else {
            document.body.appendChild(el);
        }

        return el;
    },

    /**
     * Get element by id
     * @param {string} id element id attribute
     * @returns {HTMLElement} element
     */
    get: function(id) {
        return document.getElementById(id);
    },

    /**
     * Find DOM element by specific selectors.
     * below three selector only supported.
     *
     * 1. css selector
     * 2. id selector
     * 3. nodeName selector
     * @param {string} selector selector
     * @param {(HTMLElement|string)} [root] You can assign root element to find. if not supplied, document.body will use.
     * @returns {HTMLElement} HTML element finded.
     */
    find: function(selector, root) {
        var target = null,
            rootType,
            cssClassSelector = /^\./,
            idSelector = /^#/,
            matcher = (function() {
                if (cssClassSelector.test(selector)) {
                    return function(el, id) {
                        return domutil.hasClass(el, id.replace('.', ''));
                    };
                } else if (idSelector.test(selector)) {
                    return function(el, id) {
                        return el.id === id.replace('#', '');
                    };
                }

                return function(el, id) {
                    return el.nodeName.toLowerCase() === id.toLowerCase();
                };
            })();

        /**
         * Find element recursivly
         * @param {HTMLElement} el root element
         * @param {string} selector selector
         */
        function findRecursive(el, selector) {
            var childNodes = el.childNodes,
                i,
                len,
                child;

            for (i = 0, len = childNodes.length; i < len; i += 1) {
                child = childNodes[i];

                if (child.nodeName === '#text') {
                    continue;
                }

                if (matcher(child, selector)) {
                    target = child;
                    return;
                } else if (child.childNodes.length > 0) {
                    findRecursive(child, selector);
                }
            }
        }

        rootType = typeof root;

        if (rootType === 'undefined') {
            root = document.body;
        } else if (rootType === 'string') {
            root = domutil.get(root);
        }

        findRecursive(root, selector);

        return target;
    },

    /**
     * Return texts inside element.
     * @param {HTMLElement} el target element
     * @return {string} text inside node
     */
    text: function(el) {
        var ret = '',
            i = 0,
            nodeType = el.nodeType;

        if (nodeType) {
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                // nodes that available contain other nodes
                if (typeof el.textContent === 'string') {
                    return el.textContent;
                }

                for (el = el.firstChild; el; el = el.nextSibling) {
                    ret += domutil.text(el);
                }
            } else if (nodeType === 3 || nodeType === 4) {
                // TEXT, CDATA SECTION
                return el.nodeValue;
            }
        } else {
            for (; el[i]; i += 1) {
                ret += domutil.text(el[i]);
            }
        }
        return ret;
    },

    /**
     * Check element has specific design class name.
     * @param {HTMLElement} el target element
     * @param {string} name css class
     * @returns {boolean} return true when element has that css class name
     */
    hasClass: function(el, name) {
        var className;

        if (!util.isUndefined(el.classList)) {
            return el.classList.contains(name);
        }

        className = domutil.getClass(el);

        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
    },

    /**
     * Add design class to HTML element.
     * @param {HTMLElement} el target element
     * @param {string} name css class name
     */
    addClass: function(el, name) {
        var className;

        if (!util.isUndefined(el.classList)) {
            util.forEachArray(name.split(' '), function(value) {
                el.classList.add(value);
            });
        } else if (!domutil.hasClass(el, name)) {
            className = domutil.getClass(el);
            domutil.setClass(el, (className ? className + ' ' : '') + name);
        }
    },

    /**
     *
     * Overwrite design class to HTML element.
     * @param {HTMLElement} el target element
     * @param {string} name css class name
     */
    setClass: function(el, name) {
        if (util.isUndefined(el.className.baseVal)) {
            el.className = name;
        } else {
            el.className.baseVal = name;
        }
    },

    /**
     * Element에 cssClass속성을 제거하는 메서드
     * Remove specific design class from HTML element.
     * @param {HTMLElement} el target element
     * @param {string} name class name to remove
     */
    removeClass: function(el, name) {
        var removed = '';

        if (!util.isUndefined(el.classList)) {
            el.classList.remove(name);
        } else {
            removed = (' ' + domutil.getClass(el) + ' ').replace(' ' + name + ' ', ' ');
            domutil.setClass(el, trim(removed));
        }
    },

    /**
     * Get HTML element's design classes.
     * @param {HTMLElement} el target element
     * @returns {string} element css class name
     */
    getClass: function(el) {
        return util.isUndefined(el.className.baseVal) ? el.className : el.className.baseVal;
    },

    /**
     * Get specific CSS style value from HTML element.
     * @param {HTMLElement} el target element
     * @param {string} style css attribute name
     * @returns {(string|null)} css style value
     */
    getStyle: function(el, style) {
        var value = el.style[style] || (el.currentStyle && el.currentStyle[style]),
            css;

        if ((!value || value === 'auto') && document.defaultView) {
            css = document.defaultView.getComputedStyle(el, null);
            value = css ? css[style] : null;
        }

        return value === 'auto' ? null : value;
    },

    /**
     * Set position CSS style.
     * @param {HTMLElement} el target element
     * @param {number} [x=0] left pixel value.
     * @param {number} [y=0] top pixel value.
     */
    setPosition: function(el, x, y) {
        x = util.isUndefined(x) ? 0 : x;
        y = util.isUndefined(y) ? 0 : y;

        el[posKey] = [x, y];

        el.style.left = x + 'px';
        el.style.top = y + 'px';
    },

    /**
     * Get position from HTML element.
     * @param {HTMLElement} el target element
     * @param {boolean} [clear=false] clear cache before calculating position.
     * @returns {number[]} point
     */
    getPosition: function(el, clear) {
        var left,
            top,
            autoRegex,
            bound;

        if (clear) {
            el[posKey] = null;
        }

        if (el[posKey]) {
            return el[posKey];
        }

        left = 0;
        top = 0;
        autoRegex = /(^auto$|^$)/;

        if ((autoRegex.test(el.style.left) || autoRegex.test(el.style.top)) && 'getBoundingClientRect' in el) {
            // 엘리먼트의 left또는 top이 'auto'일 때 수단
            bound = el.getBoundingClientRect();

            left = bound.left;
            top = bound.top;
        } else {
            left = parseFloat(el.style.left || 0);
            top = parseFloat(el.style.top || 0);
        }

        return [left, top];
    },

    /**
     * Return element's size
     * @param {HTMLElement} el target element
     * @return {number[]} width, height
     */
    getSize: function(el) {
        var width = parseFloat(domutil.getStyle(el, 'width')),
            height = parseFloat(domutil.getStyle(el, 'height'));

        return [width, height];
    },

    /**
     * Check specific CSS style is available.
     * @param {array} props property name to testing
     * @return {(string|boolean)} return true when property is available
     * @example
     * var props = ['transform', '-webkit-transform'];
     * domutil.testProp(props);    // 'transform'
     */
    testProp: function(props) {
        var style = document.documentElement.style,
            i = 0,
            len = props.length;

        for (; i < len; i += 1) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    }
};

/*eslint-disable*/
var userSelectProperty = domutil.testProp([
    'userSelect', 
    'WebkitUserSelect', 
    'OUserSelect', 
    'MozUserSelect', 
    'msUserSelect'
]);
var supportSelectStart = 'onselectstart' in document;
var prevSelectStyle = '';
/*eslint-enable*/

/**
 * Disable browser's text selection behaviors.
 * @method
 */
domutil.disableTextSelection = (function() {
    if (supportSelectStart) {
        return function() {
            domevent.on(window, 'selectstart', domevent.preventDefault);
        };
    }

    return function() {
        var style = document.documentElement.style;
        prevSelectStyle = style[userSelectProperty];
        style[userSelectProperty] = 'none';
    };
})();

/**
 * Enable browser's text selection behaviors.
 * @method
 */
domutil.enableTextSelection = (function() {
    if (supportSelectStart) {
        return function() {
            domevent.off(window, 'selectstart', domevent.preventDefault);
        };
    }

    return function() {
        document.documentElement.style[userSelectProperty] = prevSelectStyle;
    };
})();

/**
 * Disable browser's image drag behaviors.
 */
domutil.disableImageDrag = function() {
    domevent.on(window, 'dragstart', domevent.preventDefault);
};

/**
 * Enable browser's image drag behaviors.
 */
domutil.enableImageDrag = function() {
    domevent.off(window, 'dragstart', domevent.preventDefault);
};

module.exports = domutil;
