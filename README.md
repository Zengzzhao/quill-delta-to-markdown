[![NPM](https://nodei.co/npm/quill-delta-to-markdown.png)](https://nodei.co/npm/quill-delta-to-markdown/)  
[![Build Status](https://travis-ci.org/frysztak/quill-delta-to-markdown.svg?branch=master)](https://travis-ci.org/frysztak/quill-delta-to-markdown)  


## Quill delta to Markdown converter
Converter from the [Delta](https://quilljs.com/docs/delta/) document format used by the [Quill](https://quilljs.com/) 
text editor to Markdown.

## Usage

```javascript
const { deltaToMarkdown } = require('quill-delta-to-markdown')
const markdown = deltaToMarkdown(deltaFromElseWhere)
```

## Test

```
npm install
npm test
```

## About

This lib was forked from [rdesmartin's fork](https://github.com/rdesmartin/quill-delta-markdown) of [the Slite Team's fork](https://github.com/sliteteam/quill-delta-markdown) of 
[Bart Visscher (bartv2) 's lib](https://github.com/bartv2/quill-delta-markdown). Open source!

## Future

I will refactor the entire codebase using the latest technology stack with TypeScript.
