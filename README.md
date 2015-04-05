# jquery.colorfy
jQuery plugin that colorfies your textarea

It's available on npm and bower.

## Usage
``` javaScript
$("#your_text_area").colorfy(optionalDescriptor);
```
The descriptor is an object like this
```
descriptor = {
  "keyword": /function|typeof|instanceof|var/,
  "operator": /[+-*/%]/,
  "string": /(["']).*+\1/m
}
```
Left hand side, aka key, is css classname.
Right hand side, aka value, is regexp to match.

## Known Bugs
* It only works well in Safari.
* In Chrome when user is press enter/return.
* Due to system input method, Chinese and Japanese are not supported.

