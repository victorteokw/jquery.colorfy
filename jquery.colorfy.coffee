# simple markdown parser rules
# /[.+](.+)/g -> inline link
# /[.+][.+]/g -> reference link
# /[.+]/g -> abbr link !BUG
# /[.+]: .+/g -> link or image reference
# //g -> inline image
# //g -> reference image
markdownSyntaxDescriptor =
#  "title":         [/^\s{0,3}\#{1,6}.*$/m, /^.+?\n[=-]{2,}\s*$/m]
  "title":         /^\s{0,3}\#{1,6}.*$/m
  "block":         /^\s{0,3}>\s+.*$/m
  "orderedlist":   /^\s*[0-9]+\. .+$/m
  "unorderedlist": /^\s*[*+-] .+$/m
  "strong":        /([\*_]{2})[^\*_]+?\1/m
  "emphasis":      /([\*_])[^\*_]+?\1(?![\*_])/m
  "strikethrough": /~~.+?~~/m
  "inlinecode":    /`[^`\n]+?`/
  "codeblock":     /```[.\n]+?```/m
#  "codeblock":     [/```.+?```/m, /^(?: {4}|\t).+$/m]
  "rule":          /^[-\*]{3,}/m
  # "table":
  # "inlinehtml"
  # inline link
  # reference link
  # abbr link
  # link or image reference
  # inline image
  # reference image

objectToAssociativeArray = (obj) ->
  return obj if Array.isArray(obj)
  retArr = []
  for key, value of obj
    assObj = {}
    assObj[key] = value
    retArr.unshift(assObj)
  retArr

createNode = (content, htmlfier, descriptor, klass) ->
  node = {}
  node.content = content
  node.htmlfier = htmlfier
  node.descriptor = objectToAssociativeArray(descriptor)
  node.klass = klass
  node.subnodes = []
  node.supernode = null # Unused
  node.processed = false
  node.terminate = false
  node.toHTML = ->
    node.process() unless node.processed
    openSpan = if @klass then "<span class='#{@klass}'>" else ''
    content = ''
    if @terminate
      content += @htmlfier(@content)
    else
      for node in @subnodes
        content += node.toHTML()
    closeSpan = if @klass then "</span>" else ''
    return openSpan + content + closeSpan

  node.process = ->
    if @descriptor.length == 0
      @terminate = true
    else
      rule = @descriptor.pop()
      # This is not a loop, only one key value pair for a rule
      for klass, regexp of rule
        currentIndex = 0
        remainder = @content
        while matchData = regexp.exec(remainder)
          hasMatchData = true
          unmatched = remainder.substr(currentIndex, matchData.index)
          matched = matchData[0]
          currentIndex = matched.length + matchData.index
          remainder = remainder.substr(currentIndex)
          currentIndex = 0
          if unmatched.length > 0
            unmatchedNewNode = createNode(unmatched, @htmlfier, @descriptor.slice(0), null)
            @subnodes.push(unmatchedNewNode)
          matchedNewNode = createNode(matched, @htmlfier, @descriptor.slice(0), klass)
          @subnodes.push(matchedNewNode)
        newNode = createNode(remainder, @htmlfier, @descriptor.slice(0), null)
        @subnodes.push(newNode)
    node.processed = true

  return node

htmlfy = (dataText) ->
  dataText = dataText.replace(/&/g, '&amp;')    # & -> &amp;
  dataText = dataText.replace(/</g, '&lt;')     # < -> &lt;
  dataText = dataText.replace(/>/g, '&gt;')     # > -> &gt;
  dataText = dataText.replace(/"/g, '&quot;')   # " -> &quot;
  dataText = dataText.replace(/'/g, '&apos;')   # ' -> &apos;
  dataText = dataText.replace(/\//g, '&#x2F;')  # / -> &#x2F;
  dataText = dataText.replace(/\n/g, '<br>')    # \n -> <br>
  dataText = dataText.replace(/ /g, '&nbsp;')   # ' ' -> &nbsp;
  return dataText

colorfy = (dataText, descriptor, htmlfier) ->
  htmlfier ||= htmlfy
  node = createNode(dataText, htmlfier, descriptor, 'markdown')
  return node.toHTML()


dataTextToFormattedText = (dataText) ->
  colorfy(dataText, markdownSyntaxDescriptor, htmlfy)

formattedTextToDataText = (formattedText) ->
  formattedText = formattedText.replace(/<(?!br|\/br).+?>/gm, '') # strip tags
  formattedText = formattedText.replace(/<br>/g, '\n')            # <br> -> \n
  formattedText = formattedText.replace(/&lt;/g, '<')             # &lt; -> <
  formattedText = formattedText.replace(/&gt;/g, '>')             # &gt; -> >
  formattedText = formattedText.replace(/&amp;/g, '&')            # &amp; -> &
  formattedText = formattedText.replace(/&quot;/g, '"')           # &quot -> "
  formattedText = formattedText.replace(/&apos;/g, "'")           # &apos -> '
  formattedText = formattedText.replace(/&#x2F/g, "/")            # &#x2F -> /
  formattedText = formattedText.replace(/&nbsp;/g, ' ')           # &nbsp; -> ' '
  return formattedText

cursorLocationFromNodeAndOffset = (rootNode, anchorNode, anchorOffset) ->
  location = 0
  if rootNode == anchorNode
    if rootNode.nodeType == Node.TEXT_NODE
      location += anchorOffset
    else if rootNode.tagName == "SPAN"
      for i in [0..anchorOffset] by 1
        location += cursorLocationFromNodeAndOffset(rootNode.childNodes[i], anchorNode, anchorOffset)
  else
    if rootNode.nodeType == Node.TEXT_NODE
      location += rootNode.nodeValue.length
    else if rootNode.tagName == "BR"
      location += 1
    else
      for childNode in rootNode.childNodes
        if childNode == anchorNode
          location += cursorLocationFromNodeAndOffset(childNode, anchorNode, anchorOffset)
          return location
        else
          location += cursorLocationFromNodeAndOffset(childNode, anchorNode, anchorOffset)
  return location

nodeAndOffsetFromCursorLocation = (cursorLocation, rootNode) ->
  if rootNode.nodeType == Node.TEXT_NODE
    if rootNode.nodeValue.length >= cursorLocation
      return [rootNode, cursorLocation]
    else
      return [null, rootNode.nodeValue.length]
  else if rootNode.tagName == "BR"
    if cursorLocation == 1
      return [rootNode, 0]
    return [null, 1]
#  else if rootNode.tagName == "SPAN"
  else
    toMinus = 0
    for childNode in rootNode.childNodes
      [retNod, retOff] = nodeAndOffsetFromCursorLocation(cursorLocation, childNode)
      if retOff and !retNod
        cursorLocation -= retOff
        toMinus += retOff
      else if retOff and retNod
        return [retNod, retOff]
  [null, toMinus]

saveCursorLocation = (jObject) ->
  plainObject = jObject[0]
  return if document.activeElement != plainObject
  sel = window.getSelection()
  return unless sel.isCollapsed
  anchorNode = sel.anchorNode
  anchorOffset = sel.anchorOffset
  return unless plainObject.contains(anchorNode)
  cursorLo = cursorLocationFromNodeAndOffset(plainObject, anchorNode, anchorOffset)
  console.log("CursorLo: #{cursorLo}")
  jObject.data("cursorlocation", cursorLo)


restoreCursorLocation = (jObject) ->
  plainObject = jObject[0]
  return if document.activeElement != plainObject
  sel = window.getSelection()
  return unless sel.isCollapsed
  # return unless plainObject.contains(sel.anchorNode)
  [anchorNode, anchorOffset] = nodeAndOffsetFromCursorLocation(jObject.data("cursorlocation"), plainObject)
  console.log(anchorNode)
  console.log(anchorOffset)
  if anchorNode && anchorOffset >= 0
    sel.collapse(anchorNode, anchorOffset)

$.fn.colorfy = (plainTextProcessor) ->

  # Create fake text area
  # which is actually a 'contenteditable' div
  div = $("<div></div>")
  div.attr("contenteditable", "true")
  # Copy style
  div.attr("class", this.attr("class"))
  # Prevent content to overflow to the outside
  div.css("max-height", this.height())
  div.css("height", this.height())
  div.css("overflow", "scroll")
  # Prevent enter to insert <div></div>
  # See http://stackoverflow.com/questions/18552336/prevent-contenteditable-adding-div-on-enter-chrome
  # div.css("display", 'inline-block')
  # Insert the fake text area
  this.after(div)
  # Hide the original and real one
  this.css("display", "none")

  # Event Binding
  # to keep form and fake div in sync
  area = this
  area.on "keyup paste", ->
    div.data("content", area.val()).trigger("receive-content")

  div.on "receive-content", ->
    # Fix big cursor issue
    if div.text().length == 0
      div.css("display", "block")
    else
      div.css("display", "inline-block")
    div.html(dataTextToFormattedText(div.data("content")))
    restoreCursorLocation(div)
    return

  div.on "send-content", ->
    # Fix big cursor issue
    if div.text().length == 0
      div.css("display", "block")
    else
      div.css("display", "inline-block")
    area.val(div.data("content"))

  div.on "keyup paste", ->
    saveCursorLocation(div)
    div.data("content", formattedTextToDataText(div.html())).trigger("send-content").trigger("receive-content")


  # Initialize content
  div.data("content", this.val()).trigger("receive-content")
