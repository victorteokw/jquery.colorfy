# simple markdown parser rules
# /[.+](.+)/g -> inline link
# /[.+][.+]/g -> reference link
# /[.+]/g -> abbr link !BUG
# /[.+]: .+/g -> link or image reference
# //g -> inline image
# //g -> reference image
$.fn.colorfy.markdown =
#  "title":         [/^\s{0,3}\#{1,6}.*$/m, /^.+?\n[=-]{2,}\s*$/m]
  "title":         /^\s{0,3}\#{1,6}.*$/m
  "block":         /^\s{0,3}>\s+.*$/m
  "orderedlist":   /^\s*[0-9]+\. .+$/m
  "unorderedlist": /^\s*[*+-] .+$/m
  "strong":        /([\*_]{2})[^\*_]+?\1/m
  "emphasis":      /([\*_])[^\*_]+?\1(?![\*_])/m
  "strikethrough": /~~.+?~~/m
  "codeblock":     /```[a-z\s]*\n[\s\S]*?\n```/m
  "inlinecode":    /`[^`\n]+?`/
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
