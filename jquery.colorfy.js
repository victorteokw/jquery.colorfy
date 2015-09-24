/*global jQuery */
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var thisBrowser = (function () {
  var _ieP = window.navigator.userAgent.indexOf("MSIE ") > 0;
  var _chromeP = window.navigator.userAgent.indexOf("Chrome") > 0;
  var _firefoxP = window.navigator.userAgent.indexOf("Firefox") > 0;
  var _safariP = window.navigator.userAgent.indexOf("Safari") > 0;
  if (_ieP) {
    return "IE";
  }
  if (_chromeP) {
    return "Chrome";
  }
  if (_firefoxP) {
    return "Firefox";
  }
  if (_safariP) {
    return "Safari";
  }
  return undefined;
})();

var assocArray = function assocArray() {
  var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (Array.isArray(obj)) return obj;
  var retArr = [];
  Object.keys(obj).forEach(function (k) {
    retArr.unshift([k, obj[k]]);
  });
  return retArr;
};

var htmlfy = function htmlfy(dataText) {
  return dataText.replace(/&/g, '&amp;') //       & -> &amp;
  .replace(/</g, '&lt;') //       < -> &lt;
  .replace(/>/g, '&gt;') //       > -> &gt;
  .replace(/"/g, '&quot;') //       " -> &quot;
  .replace(/'/g, '&apos;') //       ' -> &apos;
  .replace(/\//g, '&#x2F;') //       / -> &#x2F;
  .replace(/\n/g, '<br>') //      \n -> <br>
  .replace(/ /g, '&nbsp;'); //     ' ' -> &nbsp;
};

var datafy = function datafy(formattedText) {
  return formattedText.replace(/<(?!br|\/br).+?>/gm, '') //  strip tags
  .replace(/<br>/g, '\n') //  <br> -> \n
  .replace(/&lt;/g, '<') //  &lt; -> <
  .replace(/&gt;/g, '>') //  &gt; -> >
  .replace(/&amp;/g, '&') //  &amp; -> &
  .replace(/&quot;/g, '"') //  &quot -> "
  .replace(/&apos;/g, "'") //  &apos -> '
  .replace(/&#x2F/g, "/") //  &#x2F -> /
  .replace(/&nbsp;/g, ' '); //  &nbsp; -> ' '
};

var ColorNode = (function () {
  function ColorNode(content, htmlfier, descriptor, klass) {
    _classCallCheck(this, ColorNode);

    this.content = content;
    this.htmlfier = htmlfier;
    this.descriptor = assocArray(descriptor);
    this.klass = klass;
    this.subnodes = [];
    this.supernode = null; // Unused
    this.processed = false;
    this.terminate = false;
  }

  _createClass(ColorNode, [{
    key: "toHTML",
    value: function toHTML() {
      if (!this.processed) {
        this.process();
      }
      var openSpan = this.klass ? "<span class='" + this.klass + "'>" : '';
      var closeSpan = this.klass ? '</span>' : '';
      var content = [];
      if (this.terminate) {
        content.push(this.htmlfier(this.content));
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.subnodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var node = _step.value;

            content.push(node.toHTML());
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      return openSpan + content.join("") + closeSpan;
    }
  }, {
    key: "process",
    value: function process() {
      if (this.descriptor.length == 0) {
        this.terminate = true;
      } else {
        var rule = this.descriptor.pop();

        var _rule = _slicedToArray(rule, 2);

        var klass = _rule[0];
        var regexp = _rule[1];

        var currentIndex = 0;
        var remainder = this.content;
        var matchData = undefined;
        while (matchData = regexp.exec(remainder)) {
          var hasMatchData = true;
          var unmatched = remainder.substr(currentIndex, matchData.index);
          var matched = matchData[0];
          currentIndex = matched.length + matchData.index;
          remainder = remainder.substr(currentIndex);
          currentIndex = 0;
          if (unmatched.length > 0) {
            var unmatchedNewNode = new ColorNode(unmatched, this.htmlfier, this.descriptor.slice(0), null);
            this.subnodes.push(unmatchedNewNode);
          }
          var matchedNewNode = new ColorNode(matched, this.htmlfier, this.descriptor.slice(0), klass);
          this.subnodes.push(matchedNewNode);
        }
        var newNode = new ColorNode(remainder, this.htmlfier, this.descriptor.slice(0), null);
        this.subnodes.push(newNode);
      }
      this.processed = true;
    }
  }]);

  return ColorNode;
})();

// Unused currently, use $.fn.colorfy instead
var syntaxDescriptors = {};

var _colorfy = function _colorfy(text, descriptor, htmlfier, descriptorName) {
  htmlfier || (htmlfier = htmlfy);
  var node = new ColorNode(text, htmlfier, descriptor, descriptorName);
  return node.toHTML();
};

var _colorfy2 = function _colorfy2(text, descriptorName) {
  var descriptor = undefined;
  if (jQuery) {
    descriptor = jQuery.fn.colorfy[descriptorName];
  } else {
    descriptor = syntaxDescriptors[descriptorName];
  }
  return _colorfy(text, descriptor, htmlfy, descriptorName);
};

var parentsOfNode = function parentsOfNode(node) {
  var nodes = [node];
  while (node = node.parentNode) {
    nodes.unshift(node);
  }
  return nodes;
};

var commonAncestor = function commonAncestor(n1, n2) {
  var parents1 = parentsOfNode(n1);
  var parents2 = parentsOfNode(n2);
  if (parents1[0] != parents2[0]) return null;
  for (var i = 0, len = parents1.length; i < len; i++) {
    if (parents1[i] != parents2[i]) {
      return parents1[i - 1];
    }
  }
};

var lengthOfNode = function lengthOfNode(node) {
  if (node.nodeType == Node.TEXT_NODE) {
    return node.nodeValue.length;
  } else if (node.tagName == "BR") {
    return 1;
  } else if (node.tagName == "SPAN" || node.tagName == "DIV") {
    var len = 0;
    for (var i = 0, _len = node.childNodes.length; i < _len; i++) {
      len += lengthOfNode(node.childNodes[i]);
    }
    return len;
  }
  return 0;
};

var lengthOfNodeToOffset = function lengthOfNodeToOffset(node, offset) {
  if (node.nodeType == Node.TEXT_NODE) {
    return offset;
  } else if (node.tagName == "BR") {
    // not correct behavior.
    return offset;
  } else if (node.tagName == "SPAN" || node.tagName == "DIV") {
    var len = 0;
    for (var i = 0; i < offset; i++) {
      len += lengthOfNode(node.childNodes[i]);
    }
    return len;
  }
  return offset;
};

var cursorLocation = function cursorLocation(root, anchor, offset, cur) {
  if (!cur) cur = root;
  if (cur == anchor) {
    return lengthOfNodeToOffset(anchor, offset);
  } else if (!cur.contains(anchor) && // current node before anchor
  root.contains(commonAncestor(cur, anchor)) && cur.compareDocumentPosition(anchor) == Node.DOCUMENT_POSITION_FOLLOWING) {
    return lengthOfNode(cur);
  } else if (!cur.contains(anchor) && // current node after anchor
  root.contains(commonAncestor(cur, anchor)) && cur.compareDocumentPosition(anchor) == Node.DOCUMENT_POSITION_PRECEDING) {
    return 0;
  } else if (cur.contains(anchor)) {
    var _location = 0;
    for (var i = 0, len = cur.childNodes.length; i < len; i++) {
      _location += cursorLocation(root, anchor, offset, cur.childNodes[i]);
    }
    return _location;
  }
  return 0;
};

var nodeAndOffset = function nodeAndOffset(_x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var location = _x2,
        node = _x3;
    i = _len = child = undefined;
    _again = false;

    if (lengthOfNode(node) < location) return [];
    if (node.nodeType == Node.TEXT_NODE) {
      return [node, location];
    } else if (node.tagName == "BR") {
      switch (thisBrowser) {
        case "Chrome":
          return [node.nextSibling, 0];
          break;
        case "Firefox":
          if (node.nextSibling.tagname == "BR") {
            return [node.nextSibling, 0];
          } else {
            return [node, 0];
          }
        case "IE":
        case "Safari":
        default:
          return [node, location];
      }
    } else {
      for (var i = 0, _len = node.childNodes.length; i < _len; i++) {
        var child = node.childNodes[i];
        if (lengthOfNode(child) < location) {
          location -= lengthOfNode(child);
        } else {
          _x2 = location;
          _x3 = child;
          _again = true;
          continue _function;
        }
      }
    }
  }
};

var restoreCursor = function restoreCursor(root) {
  if (document.activeElement != root) return;
  var sel = window.getSelection();
  if (!sel.isCollapsed) return;

  var _nodeAndOffset = nodeAndOffset(root.getAttribute('data-cursor'), root);

  var _nodeAndOffset2 = _slicedToArray(_nodeAndOffset, 2);

  var anchor = _nodeAndOffset2[0];
  var offset = _nodeAndOffset2[1];

  if (anchor && offset >= 0) {
    sel.collapse(anchor, offset);
  }
};

var saveCursor = function saveCursor(root) {
  if (document.activeElement != root) return;
  var sel = window.getSelection();
  if (!sel.isCollapsed) return;
  var anchor = sel.anchorNode;
  var offset = sel.anchorOffset;
  if (!root.contains(anchor)) return;
  var loc = cursorLocation(root, anchor, offset);
  root.setAttribute('data-cursor', loc);
};

var Colorfy = (function () {
  function Colorfy(node) {
    _classCallCheck(this, Colorfy);

    this.node = node;
  }

  _createClass(Colorfy, [{
    key: "colorfy",
    value: function colorfy(syntaxDescriptor) {
      var _this = this;

      // Create fake text area
      // which is actually a 'contenteditable' div
      var fakeDiv = document.createElement('div');
      fakeDiv.setAttribute("contenteditable", true);

      // Copy style
      fakeDiv.setAttribute("class", this.node.getAttribute("class"));

      // Prevent content to overflow to the outside
      fakeDiv.style.maxHeight = this.node.clientHeight;
      fakeDiv.style.height = this.node.clientHeight;

      // Special for input
      if (this.node.tagName == "INPUT") {
        fakeDiv.style.overflow = "hidden";
      } else {
        fakeDiv.style.overflow = "scroll";
      }

      // after it
      this.node.parentNode.insertBefore(fakeDiv, this.node.nextSibling);

      // Hide the original one
      this.node.style.display = "none";

      // Tracking if current change event is triggered by colorfy
      this.colorfyTriggeredChange = false;

      // Events
      var sendToFakeDiv = function sendToFakeDiv() {
        if (!_this.colorfyTriggeredChange) {
          fakeDiv.dataText = _this.node.value;
          var _event = document.createEvent("CustomEvent");
          _event.initEvent("receive-content", true, true);
          fakeDiv.dispatchEvent(_event);
        }
      };
      if (jQuery) {
        // jQuery bug #2476
        jQuery(this.node).on("keyup paste change input", sendToFakeDiv);
      } else {
        this.node.addEventListener("keyup", sendToFakeDiv);
        this.node.addEventListener("paste", sendToFakeDiv);
        this.node.addEventListener("change", sendToFakeDiv);
        this.node.addEventListener("input", sendToFakeDiv);
      }

      var sendToArea = function sendToArea() {
        saveCursor(fakeDiv);
        fakeDiv.dataText = datafy(fakeDiv.innerHTML);
        var event = document.createEvent("CustomEvent");
        event.initEvent("send-content", true, true);
        fakeDiv.dispatchEvent(event);
        event = document.createEvent("CustomEvent");
        event.initEvent("receive-content", true, true);
        fakeDiv.dispatchEvent(event);
      };
      if (jQuery) {
        jQuery(fakeDiv).on("input paste", sendToArea);
      } else {
        fakeDiv.addEventListener("input", sendToArea);
        fakeDiv.addEventListener("paste", sendToArea);
      }

      fakeDiv.addEventListener("receive-content", function (e) {
        var innerText = "";
        if (thisBrowser == "Firefox") {
          innerText = fakeDiv.textContent;
        } else {
          innerText = fakeDiv.innerText;
        }
        if (innerText.length == 0) {
          fakeDiv.style.display = "block";
        } else {
          fakeDiv.style.display = "inline-block";
        }
        fakeDiv.innerHTML = _colorfy2(fakeDiv.dataText, syntaxDescriptor);
        restoreCursor(fakeDiv);
      });

      fakeDiv.addEventListener("send-content", function (e) {
        _this.colorfyTriggeredChange = true;
        _this.node.value = fakeDiv.dataText;
        _this.colorfyTriggeredChange = false;
        var evt = new Event("change");
        _this.node.dispatchEvent(evt);
      });

      // Init copy data
      fakeDiv.dataText = this.node.value;
      var event = document.createEvent("CustomEvent");
      event.initEvent("receive-content", true, true);
      fakeDiv.dispatchEvent(event);
    }
  }]);

  return Colorfy;
})();

jQuery.fn.colorfy = function (syntaxDescriptor) {
  this.each(function () {
    var colorfyObject = new Colorfy(this);
    colorfyObject.colorfy(syntaxDescriptor);
  });
};