(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.uiPaginateSrc = mod.exports;
  }
})(this, function (module) {
  'use strict';

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  /*!
   * Paginate.js v0.1.0
   * (c) 2016 Jason Tavarez
   * Released under the MIT License.
   */

  // All of these are used in constructing our uiPaginate instance
  // and can be overriden by the user
  var defaultOptions = {

    // Accepts selector, nodeList (useful for combining with other plugins/logic) or array or integer
    items: null,
    itemsPerPage: 10,
    startingPage: 0,
    // Where our pagination links will go. Can be false if user just wants to work with data object
    paginateContainer: false,
    // Applied to all links in addition to specific ones (first, last, disabled, middle)
    className: 'page-link',
    prefix: 'page-', // prepended before secondary classes (button, disabled, first, last)
    skipLabels: ['First', 'Last'], // Can be set to false to hide
    skipLabelsInclusive: true, // If first and last label showing, still show '1' and 'n' buttons
    incrementLabels: ['Prev', 'Next'], // Can be set to false to hide
    incrementCounter: 1,
    divider: "...", // // Can be set to false to hide (though you shouldn't!)
    displaySinglePage: false, // by default, links will only show if there is more than one page
    marginPages: 2, // can also be false/0
    centerPages: 5, // Minimum of 3 should be enforced
    element: "span",

    // hooks
    onPagesCreated: null,
    onPageSelected: null
  };

  function setConfig(config) {
    // If string
    if (isString(config.items)) {

      config.items = document.querySelectorAll(config.items);
      config.totalItems = config.items.length;

      // If nodelist
    } else if (isNodeList(config.items)) {

        config.totalItems = config.items.length;
        // If array
      } else if (Array.isArray(config.items)) {

          config.totalItems = config.items.length;

          // If integer
        } else if (isInteger(config.items)) {

            config.totalItems = config.items;
          } else {
            console.error('Nothing to show for items attribute :(');
            // return false
          }

    // Ensure user supplied tag is one from our list
    config.element = validateTagType(config.element);
  }

  // --------------------------------------------------------
  // Private methods (helper functions)
  // --------------------------------------------------------

  // Validate user input for tag type during initialization
  function validateTagType(tag) {
    return ['div', 'span', 'a', 'li', 'th', 'td'].indexOf(tag) > -1 ? tag : defaultOptions.element;
  }

  // Used across plugin to validate user input or calculations
  // (i.e. ensure totalPages is always at least 1)
  function ensureNumberInBounds(num, min, max) {

    if (num < min) return min;
    if (num > max) return max;

    return num;
  }

  // Creates simple array of integers used in creating
  // pagination elements
  // example output : [22,23,24,25,26,27]
  function createPageArray() {
    var startingIndex = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var len = arguments[1];

    var arr = [];
    for (var i = startingIndex; i < len + startingIndex; i++) {
      arr.push(i);
    }
    return arr;
  }

  function getTotalNumPages(numItems, itemsPerPage) {
    return Math.ceil(numItems / itemsPerPage);
  }

  function isNodeList(value) {

    if (value[0] === undefined) return false;

    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.length === 'number' && value[0].nodeType > 0 && _typeof(value[0]) === "object";
  }

  function isString(value) {
    return toString.call(value) == '[object String]';
  }

  // Given our config object and desired page number,
  // we create a new instance of our info object, which
  // contains all pertinent pagination info that will be
  // returned to the user
  function setInfo(config) {
    var pageNum = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


    var i = {};

    i.itemsPerPage = config.itemsPerPage;
    i.totalItems = config.totalItems;

    // we apply 'ensureNumberInBounds()' to ensure we somehow don't end up with more pages than exist items
    // and also to avoid zero based calculations with numeer of pages (minimum is one as even for zero titak
    // items, that is technically still one page worth)
    i.totalPages = ensureNumberInBounds(getTotalNumPages(i.totalItems, config.itemsPerPage), 1, i.totalItems);

    // Our current page (bound to range of pagination no matter what)
    i.current = ensureNumberInBounds(pageNum, 0, i.totalPages - 1);

    i.firstItemIndex = i.current * i.itemsPerPage;
    i.lastItemIndex = i.current * i.itemsPerPage + i.itemsPerPage - 1;

    i.isFirst = i.current === 0 ? true : false;
    i.isLast = i.current === i.totalPages - 1 ? true : false;

    // To account for last page with partial lists
    if (i.isLast) i.lastItemIndex = i.totalItems > 0 ? i.totalItems - 1 : 0;

    // Should never be less than 0
    i.prev = ensureNumberInBounds(i.current - config.incrementCounter, 0, i.totalPages);
    // Should never be more than (totalPages-1) (which could also be zero if just one page)
    i.next = ensureNumberInBounds(i.current + config.incrementCounter, 0, i.totalPages - 1);

    // If it's a small number of pages, it will always be near both the start and end,
    // and so we avoid trying to divy up the pages with dividers and marginPages
    // (ie. funny behavior will occur if marginPages=1, centerPages=5, and there are ~8 total pages)
    if (i.totalPages <= config.centerPages + config.marginPages * 2 + config.dividerOffset * 2) {
      i.isNearStart = true;
      i.isNearEnd = true;
      // Else we calculate as normal
    } else {
        i.isNearStart = i.current - config.centerOffset < config.marginPages + config.dividerOffset;
        i.isNearEnd = i.current + config.centerOffset >= i.totalPages - config.marginPages - config.dividerOffset;
      }

    return i;
  }

  function isInteger(obj) {
    return !isNaN(parseInt(obj));
  }

  function emptyElement(div) {
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
  }

  function noResults(selectorType) {
    console.warn('No results given');
    return false;
  }

  // --------------------------------------------------------
  // uiPaginate constructor
  // --------------------------------------------------------
  // class uiPaginate {
  // No shorthand, need block scope to check for lack of 'new'
  var uiPaginate = function uiPaginate(options) {

    // combine default options with user inputs to create
    // our config object
    var config = _extends({}, defaultOptions, options);

    // Some last extra vars we need in our config
    _extends(config, {
      centerOffset: Math.floor(config.centerPages / 2),
      dividerOffset: 1,
      totalItems: 0
    });

    setConfig(config);
    // Information sent back to user, relevant pagination info
    // is contained here and updated whenever new page is selected
    // or when object is reconstructed
    var _info = setInfo(config, 0);

    // This is more useful data but as it relates to pagination and
    // creating buttons / labels.
    var pages = {
      leftMarginPages: [],
      centerPages: [],
      rightMarginPages: []
    };

    // Element where we will be inserting our pagination elements
    var el = {
      rowsParent: config.items.length > 0 ? config.items[0].parentNode : false,
      paginationParent: document.querySelector(config.paginateContainer) ? document.querySelector(config.paginateContainer) : false
    };

    if (el.paginationParent) {

      el.paginationParent.addEventListener("click", function (e) {
        // Exclude clicks inside pagination container that aren't actually
        // on a page
        var pageNum = e.srcElement.pageNumber;

        if (pageNum !== undefined) {

          api.setPage(pageNum);
        }
      });
    }

    // Function hook
    if (config.onCreated) {
      config.onCreated(_info.totalPages);
    }

    /**
     * Given a number and using info and config objects,
     * calculates what pages will be shown to user (margin pages,
     * centerPages, divider, etc) 
     * 
     * @param  {Number} Selected page number (usually what user)
     */
    var _setPages = function _setPages(number) {

      var centerStart = _info.current - config.centerOffset;
      var centerLength = config.centerPages;

      // If for some reason marginPage count is higher than centerPage, which will account for that
      var maxFromConfig = config.centerPages >= config.marginPages ? config.centerPages : config.marginPages;

      // We want to hide marginPages on either side if centerPages come close enough to overlap
      // ----------------------
      // If we're near the edge of the left side (start), we set centerPages starting index to zero
      // and length equal to selectedPage + centerOffset (usual) OR max that was defined earlier
      // This ensures pages that we put here are still never less than marginPages #
      if (_info.isNearStart) {
        centerStart = 0;
        var maxFromCurrentPage = _info.current + config.centerOffset + config.dividerOffset;
        centerLength = maxFromCurrentPage >= maxFromConfig ? maxFromCurrentPage : maxFromConfig;
      }

      // If selectedPage is near the end, then we ensure last number in centerRange is always the last page
      // from pagination
      if (_info.isNearEnd) {

        var startIndex = _info.current - config.centerOffset;
        var maxFromCurrentPage = _info.current - config.centerOffset - config.dividerOffset;

        // In case there is only one or a few pages, we don't reset centerStart (since both
        // isNearStart and isNearEnd will be true)
        if (!_info.isNearStart) centerStart = startIndex <= _info.totalPages - maxFromConfig ? startIndex : _info.totalPages - maxFromConfig;

        centerLength = _info.totalPages - centerStart;
      }

      // Create our arrays!
      pages.leftMarginPages = createPageArray(0, _info.isNearStart ? 0 : config.marginPages);
      pages.centerPages = createPageArray(centerStart, centerLength);
      pages.rightMarginPages = createPageArray(_info.totalPages - config.marginPages, _info.isNearEnd ? 0 : config.marginPages);
    };

    /**
     * Creates a single element used in pagination, given supplied inputs
     * @param  {Number}   Page number it represents (can be null, for divider elements, etc)
     * @param  {String}   Label to show to user (defaulting to index+1, since zero-based)
     * @param  {String}   Class or classes to add
     * @param  {Boolean}  Whether to add disabled class or not
     * @return {DOM Element}
     */
    var _createElement = function _createElement() {
      var index = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var label = arguments.length <= 1 || arguments[1] === undefined ? index + 1 : arguments[1];
      var classString = arguments[2];
      var isDisabled = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];


      var elem = document.createElement(config.element);
      elem.appendChild(document.createTextNode(label));

      if (index !== null) {
        elem.pageNumber = isDisabled ? undefined : index;
      }

      elem.classList.add(config.className);
      if (classString) elem.classList.add(classString.split(' '));

      if (isDisabled) elem.classList.add(config.prefix + 'disabled');else if (_info.current === index) elem.classList.add(config.prefix + 'active');

      return elem;
    };

    /**
     * Called whenever page changes, clears pagination element
     * and recreates page elements (using pages{} as reference)
     * @param  {Number} Selected page number
     */
    var _drawPageLinks = function _drawPageLinks(num) {

      // Clear children from node
      emptyElement(el.paginationParent);

      // No pagination elements drawn if one page
      // if (info.totalPages===1)
      // return

      // All page elements inserted into fragment,
      // fragment then inserted into DOM
      var paginationFragment = document.createDocumentFragment();

      // Created elements inserted here first and then added into fragment in one go
      var elemArr = [];

      // If set to false, we don't add these buttons, otherwise add supplied label
      // (FIRST)
      if (config.skipLabels) {
        elemArr.push(_createElement(0, config.skipLabels[0], config.prefix + 'skip', _info.isFirst));
      }

      // (PREV)
      if (config.incrementLabels) {
        elemArr.push(_createElement(_info.prev, config.incrementLabels[0], config.prefix + 'increment', _info.isFirst));
      }

      if (!_info.isNearStart) {
        pages.leftMarginPages.forEach(function (i) {
          elemArr.push(_createElement(i));
        });
        // (DIVIDER - LEFT SIDE)
        if (config.divider) {
          elemArr.push(_createElement(null, config.divider, config.prefix + 'divider'));
        }
      }

      pages.centerPages.forEach(function (i) {
        elemArr.push(_createElement(i));
      });

      if (!_info.isNearEnd) {
        // (DIVIDER - LEFT SIDE)
        if (config.divider) {
          elemArr.push(_createElement(null, config.divider, config.prefix + 'divider'));
        }

        pages.rightMarginPages.forEach(function (i) {
          elemArr.push(_createElement(i));
        });
      }

      // (NEXT)
      if (config.incrementLabels) {
        elemArr.push(_createElement(_info.next, config.incrementLabels[1], config.prefix + 'increment', _info.isLast));
      }

      // (LAST)
      if (config.skipLabels) {
        elemArr.push(_createElement(_info.totalPages - 1, config.skipLabels[1], config.prefix + 'skip', _info.isLast));
      }

      // Append into fragment, then append into DOM
      elemArr.forEach(function (elem) {
        return paginationFragment.appendChild(elem);
      });
      el.paginationParent.appendChild(paginationFragment);
    }; //_drawPageLinks

    // Returned to the user
    var api = {
      info: function info() {
        return _info;
      },
      setPage: function setPage() {
        var num = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];


        num = isInteger(num) ? parseInt(num) : 0;
        _info = setInfo(config, num);

        // IF we have paginationParent defined is when we
        // go through logic of creating page elements

        if (el.paginationParent && (_info.totalPages > 1 || config.displaySinglePage)) {
          _setPages(num);
          _drawPageLinks(num);
        }

        // Function hook
        if (config.onPageSelected) {
          config.onPageSelected(_info);
        }

        if (config.items.length > 0) {

          emptyElement(el.rowsParent);
          var fragment = document.createDocumentFragment();

          for (var i = _info.firstItemIndex; i <= _info.lastItemIndex; i++) {

            fragment.appendChild(config.items[i]);
          }
          el.rowsParent.appendChild(fragment);
        }
      },
      prev: function prev() {
        this.setPage(_info.current - 1);
      },
      next: function next() {
        this.setPage(_info.current + 1);
      },
      redo: function redo(newConfig) {
        config = _extends({}, config, newConfig);
        setConfig(config);
        this.setPage(0);
      }
    };

    api.setPage(config.startingPage);

    return api;
  }; // End of our uiPaginate class

  module.exports = uiPaginate;
});

//# sourceMappingURL=ui-paginate.js.map