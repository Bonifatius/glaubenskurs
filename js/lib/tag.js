/*global define, window*/

(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.tag = factory();
  }
}(this, function () {
  'use strict';

  /**
   * forIn
   *
   * @param {Object}   object
   * @param {Function} next
   *
   * @return undefined
   */
  function forIn(object, next) {
    var key;

    for (key in object) {
      if (object.hasOwnProperty(key)) {
        next(object[key], key, object);
      }
    }
  }

  /**
   * isArray
   *
   * @param {*} value
   *
   * @return {Boolean}
   */
  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }

  /**
   * isElement
   *
   * @param {*} value
   *
   * @return {Boolean}
   */
  function isElement(value) {
    return !!(value && value.nodeType);
  }

  /**
   * isObject
   *
   * @param {*} value
   *
   * @return {Boolean}
   */
  function isObject(value) {
    return (value !== null) && (typeof (value) === 'object');
  }

  /**
   * isString
   *
   * @param {*} value
   *
   * @return {Boolean}
   */
  function isString(value) {
    return typeof (value) === 'string';
  }

  /**
   * append
   *
   * @param {Object} element
   * @param {*}      content
   *
   * @return {Object}
   */
  function append(element, content) {
    return (isElement(content))
      ? element.appendChild(content)
      : element.innerHTML = content || '';
  }

  /**
   * createElement
   *
   * @param {String} tag
   *
   * @return {Function}
   */
  function createElement(tag) {
    return function (attrs, content) {
      var i,
          len,
          isAttrs  = arguments.length === 2,
          element  = document.createElement(tag),
          _content = (isAttrs) ? content : attrs;

      if (isAttrs && isObject(attrs)) {
        forIn(attrs, function (value, name) {
          element.setAttribute(name, value);
        });
      }

      if (isArray(_content)) {
        for (i = 0, len = _content.length; i < len; i++) {
          append(element, _content[i]);
        }
      } else {
        append(element, _content);
      }

      return element;
    };
  }

  return function () {
    var args = Array.prototype.slice.call(arguments, 0),
        i,
        len,
        exports,
        elements,
        namespace;

    if (isString(args[0])) {
      return createElement(args[0]).apply(null, args.slice(1));
    } else if (isArray(args[0])) {
      elements  = args[0];
      exports   = args[1] ? window : {};
      namespace = args[2];

      if (args[1] && isString(args[2])) {
        exports = (exports[namespace] = {});
      }

      for (i = 0, len = elements.length; i < len; i++) {
        exports[elements[i]] = createElement(elements[i]);
      }
    } else {
      throw new Error('first argument must be Array or String and can not be empty');
    }

    return exports;
  };
}));
