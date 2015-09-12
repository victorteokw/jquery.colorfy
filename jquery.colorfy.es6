const thisBrowser = function() {
  const _ieP = window.navigator.userAgent.indexOf("MSIE ") > 0;
  const _chromeP = window.navigator.userAgent.indexOf("Chrome") > 0;
  const _firefoxP = window.navigator.userAgent.indexOf("Firefox") > 0;
  const _safariP = window.navigator.userAgent.indexOf("Safari") > 0;
  if (_ieP)      { return "IE";      }
  if (_chromeP)  { return "Chrome";  }
  if (_firefoxP) { return "Firefox"; }
  if (_safariP)  { return "Safari";  }
  return undefined;
}();

const assocArray = function(obj = {}) {
  if (Array.isArray(obj)) return obj;
  let retArr = [];
  Object.keys(obj).forEach(function(k){
    retArr.unshift([k, obj[k]]);
  });
  return retArr;
};

const htmlfy = function(dataText) {
  return dataText
    .replace(/&/g, '&amp;')    //       & -> &amp;
    .replace(/</g, '&lt;')     //       < -> &lt;
    .replace(/>/g, '&gt;')     //       > -> &gt;
    .replace(/"/g, '&quot;')   //       " -> &quot;
    .replace(/'/g, '&apos;')   //       ' -> &apos;
    .replace(/\//g, '&#x2F;')  //       / -> &#x2F;
    .replace(/\n/g, '<br>')    //      \n -> <br>
    .replace( / /g, '&nbsp;'); //     ' ' -> &nbsp;
};

const datafy = function(formattedText) {
  debugger;
  return formattedText
    .replace(/<(?!br|\/br).+?>/gm, '')    //  strip tags
    .replace(/<br>/g, '\n')               //  <br> -> \n
    .replace(/&lt;/g, '<')                //  &lt; -> <
    .replace(/&gt;/g, '>')                //  &gt; -> >
    .replace(/&amp;/g, '&')               //  &amp; -> &
    .replace(/&quot;/g, '"')              //  &quot -> "
    .replace(/&apos;/g, "'")              //  &apos -> '
    .replace(/&#x2F/g, "/")               //  &#x2F -> /
    .replace(/&nbsp;/g, ' ');             //  &nbsp; -> ' '
};

const ColorNode = class {
  constructor(content, htmlfier, descriptor, klass) {
    this.content = content;
    this.htmlfier = htmlfier;
    this.descriptor = assocArray(descriptor);
    this.klass = klass;
    this.subnodes = [];
    this.supernode = null; // Unused
    this.processed = false;
    this.terminate = false;
  }

  toHTML() {
    if (!this.processed) {
      this.process();
    }
    let openSpan = this.klass ? `<span class='${this.klass}'>` : '';
    let closeSpan = this.klass ? '</span>' : '';
    let content = [];
    if (this.terminate) {
      content.push(this.htmlfier(this.content));
    } else {
      for (let node of this.subnodes) {
        content.push(node.toHTML());
      }
    }
    return openSpan + content.join("") + closeSpan;
  }

  process() {
    if (this.descriptor.length == 0) {
      this.terminate = true;
    } else {
      let rule = this.descriptor.pop();
      let [klass, regexp] = rule;
      let currentIndex = 0;
      let remainder = this.content;
      let matchData;
      while ((matchData = regexp.exec(remainder))) {
        let hasMatchData = true;
        let unmatched = remainder.substr(currentIndex, matchData.index);
        let matched = matchData[0];
        currentIndex = matched.length + matchData.index;
        remainder = remainder.substr(currentIndex);
        currentIndex = 0;
        if (unmatched.length > 0) {
          let unmatchedNewNode = new ColorNode(
            unmatched,
            this.htmlfier,
            this.descriptor.slice(0),
            null);
          this.subnodes.push(unmatchedNewNode);
        }
        let matchedNewNode = new ColorNode(
          matched,
          this.htmlfier,
          this.descriptor.slice(0),
          klass);
        this.subnodes.push(matchedNewNode);
      }
      let newNode = new ColorNode(
        remainder,
        this.htmlfier,
        this.descriptor.slice(0),
        null);
      this.subnodes.push(newNode);
    }
    this.processed = true;
  }
};

// Unused currently, use $.fn.colorfy instead
let syntaxDescriptors = {};

const _colorfy = function(text, descriptor, htmlfier, descriptorName) {
  htmlfier || (htmlfier = htmlfy);
  let node = new ColorNode(text, htmlfier, descriptor, descriptorName);
  return node.toHTML();
};

const colorfy = function(text, descriptorName) {
  return _colorfy(text,
                  $.fn.colorfy[descriptorName],
                  htmlfy,
                  descriptorName);
};

const parentsOfNode = function(node) {
  let nodes = [node];
  while ((node = node.parentNode)) {
    nodes.unshift(node);
  }
  return nodes;
};

const commonAncestor = function(n1, n2) {
  let parents1 = parentsOfNode(n1);
  let parents2 = parentsOfNode(n2);
  if (parents1[0] != parents2[0]) return null;
  for (let i = 0, len = parents1.length; i < len; i++) {
    if (parents1[i] != parents2[i]) {
      return parents1[i - 1];
    }
  }
};

const lengthOfNode = function(node) {
  if (node.nodeType == Node.TEXT_NODE) {
    return node.nodeValue.length;
  } else if (node.tagName == "BR") {
    return 1;
  } else if ((node.tagName == "SPAN") || (node.tagName == "DIV")) {
    let len = 0;
    for (let i = 0, _len = node.childNodes.length; i < _len; i++) {
      len += lengthOfNode(node.childNodes[i]);
    }
    return len;
  }
  return 0;
};

const lengthOfNodeToOffset = function(node, offset) {
  if (node.nodeType == Node.TEXT_NODE) {
    return offset;
  } else if (node.tagName == "BR") {
    // not correct behavior.
    return offset;
  } else if ((node.tagName == "SPAN") || (node.tagName == "DIV")) {
    let len = 0;
    for (let i = 0; i < offset; i++) {
      len += lengthOfNode(node.childNodes[i]);
    }
    return len;
  }
  return offset;
};

const cursorLocation = function(root, anchor, offset, cur) {
  if (!cur) cur = root;
  if (cur == anchor) {
    return lengthOfNodeToOffset(anchor, offset);
  } else if (!cur.contains(anchor) && // current node before anchor
             root.contains(commonAncestor(cur, anchor)) &&
             (cur.compareDocumentPosition(anchor) ==
              Node.DOCUMENT_POSITION_FOLLOWING)) {
    return lengthOfNode(cur);
  } else if (!cur.contains(anchor) && // current node after anchor
             root.contains(commonAncestor(cur, anchor)) &&
             (cur.compareDocumentPosition(anchor) ==
              Node.DOCUMENT_POSITION_PRECEDING)) {
    return 0;
  } else if (cur.contains(anchor)) {
    let location = 0;
    for (let i = 0, len = cur.childNodes.length; i < len; i++) {
      location += cursorLocation(root, anchor, offset, cur.childNodes[i]);
    }
    return location;
  }
  return 0;
};

const nodeAndOffset = function(location, node) {
  if (lengthOfNode(node) < location) return [];
  if (node.nodeType == Node.TEXT_NODE) {
    return [node, location];
  } else if (node.tagName == "BR") {
    switch(thisBrowser) {
    case "Chrome":
      return [node.nextSibling, 0];
      break;
    case "Firefox":
      if (node.nextSibling.tagname == "BR") {
        return [node, nextSibling, 0];
      } else {
        return [node, 0];
      }
    case "IE":
    case "Safari":
    default:
      return [node, location];
    }
  } else {
    for (let i = 0, _len = node.childNodes.length; i < _len; i++) {
      let child = node.childNodes[i];
      if (lengthOfNode(child) < location) {
        location -= lengthOfNode(child);
      } else {
        return nodeAndOffset(location, child);
      }
    }
  }
};

const restoreCursor = function(root) {
  if (document.activeElement != root) return;
  let sel = window.getSelection();
  if (!sel.isCollapsed) return;
  let [anchor, offset] = nodeAndOffset(root.getAttribute('data-cursor'), root);
  if (anchor && offset >= 0) {
    sel.collapse(anchor, offset);
  }
};

const saveCursor = function(root) {
  if (document.activeElement != root) return;
  let sel = window.getSelection();
  if (!sel.isCollapsed) return;
  let anchor = sel.anchorNode;
  let offset = sel.anchorOffset;
  if (!root.contains(anchor)) return;
  let loc = cursorLocation(root, anchor, offset);
  root.setAttribute('data-cursor', loc);
};

var colorfyTriggersChange = false;

$.fn.colorfy = function(syntaxDescriptor) {
  this.each(function(){
    let $this = $(this);

    // Create fake text area
    // which is actually a 'contenteditable' div
    let div = $("<div></div>");
    div.attr("contenteditable", "true");

    // Copy style
    div.attr("class", $this.attr("class"));

    // Prevent content to overflow to the outside
    div.css("max-height", $this.height());
    div.css("height", $this.height());

    if ($this.prop("tagName") == "input") {
      div.css("overflow", "hidden");
    } else {
      div.css("overflow", "scroll");
    }

    // append it
    $this.after(div);
    // Hide the original one
    $this.css("display", "none");

    let area = $this;
    area.on("keyup paste change input", function(e){
      if (!colorfyTriggersChange) {
        div.data("content", area.val()).trigger("receive-content");
      }
      colorfyTriggersChange = false;
    });

    div.on("receive-content", function(e){
      if (div.text().length == 0) {
        div.css("display", "block");
      } else {
        div.css("display", "inline-block");
      }
      div.html(colorfy(div.data("content"), syntaxDescriptor));
      restoreCursor(div[0]);
    });

    div.on("send-content", function(e) {
      colorfyTriggersChange = true;
      area.val(div.data("content")).trigger("change");
    });

    div.on("input paste", function(e) {
      saveCursor(div[0]);
      div.data("content", datafy(div.html()))
        .trigger("send-content")
        .trigger("receive-content");
    });

    // Initialize content
    div.data("content", $this.val()).trigger("receive-content");
  });
};
