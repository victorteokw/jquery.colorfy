# simple markdown parser rules
# /[.+](.+)/g -> inline link
# /[.+][.+]/g -> reference link
# /[.+]/g -> abbr link !BUG
# /[.+]: .+/g -> link or image reference
# //g -> inline image
# //g -> reference image
markdownSyntaxDescriptor =
  "title":         [/^\s{0,3}\#{1,6}.*$/m, /^.+?\n[=-]{2,}\s*$/m]
  "block":         /^\s{0,3}>\s+.*$/m
  "emphasis":      /([\*_]).+?\1/m
  "strong":        /([\*_]{2}).+?\1/m
  "strikethrough": /~~.+?~~/m
  "orderedlist":   /^\s*[0-9]+\. .+$/m
  "unorderedlist": /^\s*[*+-] .+$/m
  "inlinecode":    /`.+?`/m
  "codeblock":     [/```.+?```/m, /^(?: {4}|\t).+$/m]
  "rule":          /^[-\*]{3,}/m
  # "table":
  # "inlinehtml"
  # inline link
  # reference link
  # abbr link
  # link or image reference
  # inline image
  # reference image



createNode = (content, htmlfier, descriptor, klass) ->
  node = {}
  node.content = content
  node.htmlfier = htmlfier
  node.descriptor = descriptor
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
  return htmlfier(dataText)

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

  # Event Binding
  # to keep form and fake div in sync
  area = this
  area.on "keyup paste", ->
    div.data("content", area.val()).trigger("receive-content")

  div.on "receive-content", ->
    if div.text().length == 0
      div.css("display", "block")
    else
      div.css("display", "inline-block")
    div.html(dataTextToFormattedText(div.data("content")))
  div.on "send-content", ->
    if div.text().length == 0
      div.css("display", "block")
    else
      div.css("display", "inline-block")
    area.val(div.data("content"))

  div.on "keyup paste", ->
    div.data("content", formattedTextToDataText(div.html())).trigger("send-content")


  # Initialize content
  div.data("content", this.val()).trigger("receive-content")
