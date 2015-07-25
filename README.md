# jquery.colorfy
jQuery plugin that colorfies your textarea.

=> [Online demo and homepage](http://cheunghy.github.io/jquery.colorfy/)

It's available on npm and bower.

## Screencast
<a href="http://www.youtube.com/watch?feature=player_embedded&v=b1Lu_qKrLZ0
" target="_blank"><img src="http://img.youtube.com/vi/b1Lu_qKrLZ0/0.jpg"
alt="Screencast" width="240" height="180" border="10" /></a>

## Usage
``` javascript
$("#your_text_area").colorfy("yourDescriptor");
```
The descriptor can be registered like this
``` javascript
$.fn.colorfy.yourDescriptor = {
  "keyword": /function|typeof|instanceof|var/,
  "operator": /[+-*/%]/,
  "string": /(["']).*+\1/m
}
```
Left hand side, aka key, is css class name.
Right hand side, aka value, is regexp to match.

## Known Bugs
* It only works well in Safari and Chrome.
* In Firefox when user press enter/return, cursor jumps incorrectly.
* Due to system input method, Chinese and Japanese are not supported.
