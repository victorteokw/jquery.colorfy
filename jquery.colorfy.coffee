# simple markdown parser rules
# /^\s*#.*$/g -> title
# /^\s*[=-]+\s*$/g -> title separator
# /^\s*>.*$/g -> block
# /([\*_]).+?\1/gm -> italic
# /[\*_]{2}.+?\1/gm -> bold
# /~~.+?~~/gm -> strikethrough
# NONE -> underscore
# /^\s[1-9]+\. .+$/g -> ordered list
# /^\s*[*+-] .+$/g -> unordered list
# /[.+](.+)/g -> inline link
# /[.+][.+]/g -> reference link
# /[.+]/g -> abbr link !BUG
# /[.+]: .+/g -> link or image reference
# //g -> inline image
# //g -> reference image
# /`.+?`/gm -> inline code
# /```.+```/gm -> code block
# table border
# horizontal rule
# inline html



dataTextToFormattedText = (dataText) ->
  dataText = dataText.replace(/&/g, '&amp;')   # & -> &amp;
  dataText = dataText.replace(/</g, '&lt;')   # < -> &lt;
  dataText = dataText.replace(/>/g, '&gt;')   # > -> &gt;
  dataText = dataText.replace(/"/g, '&quot;')   # " -> &quot;
  dataText = dataText.replace(/'/g, '&apos;')   # ' -> &apos;
  dataText = dataText.replace(/\//g, '&#x2F;')   # / -> &#x2F;
  dataText = dataText.replace(/\n/g, '<br>')   # \n -> <br>
  dataText = dataText.replace(/ /g, '&nbsp;') # ' ' -> &nbsp;
  # add span tag
  return dataText

formattedTextToDataText = (formattedText) ->
  formattedText = formattedText.replace(/<(?!br|\/br).+?>/gm, '') # strip tags
  formattedText = formattedText.replace(/<br>/g, '\n')   # <br> -> \n
  formattedText = formattedText.replace(/&lt;/g, '<')   # &lt; -> <
  formattedText = formattedText.replace(/&gt;/g, '>')   # &gt; -> >
  formattedText = formattedText.replace(/&amp;/g, '&')   # &amp; -> &
  formattedText = formattedText.replace(/&quot;/g, '"')   # &quot -> "
  formattedText = formattedText.replace(/&apos;/g, "'")   # &apos -> '
  formattedText = formattedText.replace(/&#x2F/g, "/")   # &#x2F -> /
  formattedText = formattedText.replace(/&nbsp;/g, ' ') # &nbsp; -> ' '
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
  div.css("display", 'inline-block')
  # Insert the fake text area
  this.after(div)

  # Event Binding
  # to keep form and fake div in sync
  area = this
  area.on "keyup paste", ->
    div.data("content", area.val()).trigger("receive-content")

  div.on "receive-content", ->
    div.html(dataTextToFormattedText(div.data("content")))
  div.on "send-content", ->
    area.val(div.data("content"))

  div.on "keyup paste", ->
    div.data("content", formattedTextToDataText(div.html())).trigger("send-content")


  # Initialize content
  div.data("content", this.val()).trigger("receive-content")
