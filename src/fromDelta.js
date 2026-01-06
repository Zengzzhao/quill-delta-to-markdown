const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');
const trimEnd = require('lodash/trimEnd');
const defaultConverters = require('./fromDelta.converters');
const Node = require('./utils/Node');

exports = module.exports = function(ops, converters = defaultConverters) {
  // 将Delta的ops按规则转换成一棵Node树，然后渲染成Markdown字符串
  return trimEnd(convert(ops, converters, false).render()) + '\n';
};

// 核心转换函数，将Delta的ops转换成Node树
// 遍历ops，根据每个op的类型和属性，调用相应的转换器函数，构建Node树
function convert(ops, converters, inCodeBlock) {
  var group, line, el, activeInline, beginningOfLine;
  var root = new Node();

  function newLine() {
    el = line = new Node(['', '\n']);
    root.append(line);
    activeInline = {};
  }
  newLine();

  for (var i = 0; i < ops.length; i++) {
    var op = ops[i];

    if (isObject(op.insert)) {
      for (var k in op.insert) {
        if (converters.embed[k]) {
          applyInlineAttributes(op.attributes);
          converters.embed[k].call(el, op.insert[k], op.attributes);
        }
      }
    } else {
      var lines = op.insert.split('\n');

      // If the operation starts with a newline and follows a code-block line,
      // close the code block by appending the closing '```' to the current line
      // or creating a new line with the closing '```'
      if (op.insert.startsWith("\n")) {
        var prevNode = ops[i - 1];
        if (prevNode && prevNode.attributes && 'code-block' in prevNode.attributes) {
          if (el.children.length === 0 || (el.children.length === 1 && el.children[0].text === '')) {
            el.append('```\n');
          } else {
            el = new Node(['', '```\n']);
            root.append(el);
          }
          inCodeBlock = false; // Reset inCodeBlock after closing the code block
        }
      }

      // If the operation has block-level attributes
      if (hasBlockLevelAttribute(op.attributes, converters)) {
        // Some line-level styling (ie headings) is applied by inserting a \n
        // with the style; the style applies back to the previous \n.
        // There *should* only be one style in an insert operation.

        for (var j = 1; j < lines.length; j++) {
          for (var attr in op.attributes) {
            if (converters.block[attr]) {
              var fn = converters.block[attr];
              if (typeof fn === 'object') {
                if (group && group.type !== attr) {
                  group = null;
                }
                if (!group && fn.group) {
                  group = {
                    el: fn.group(),
                    type: attr,
                    value: op.attributes[attr],
                    distance: 0,
                  };
                  root.append(group.el);
                }

                if (group) {
                  group.el.append(line);
                  group.distance = 0;
                }
                fn = fn.line;
              }
              // Call the block converter function and update inCodeBlock
              inCodeBlock = fn.call(line, op.attributes, group, inCodeBlock);
              newLine();
              break
            }
          }
        }
        beginningOfLine = true;
      } else {
        for (var l = 0; l < lines.length; l++) {
          if ((l > 0 || beginningOfLine) && group && ++group.distance >= 2) {
            group = null;
          }
          applyInlineAttributes(op.attributes, ops[i + 1] && ops[i + 1].attributes);
          el.append(lines[l]);
          if (l < lines.length - 1) {
            newLine();
          }
        }
        beginningOfLine = false;
      }
    }
  }

  return root;

  function applyInlineAttributes(attrs, next) {
    var first = [],
      then = [];
    attrs = attrs || {};

    var tag = el,
      seen = {};
    while (tag._format) {
      seen[tag._format] = true;
      if (!attrs[tag._format]) {
        for (var k in seen) {
          delete activeInline[k]
        }
        el = tag.parent()
      }

      tag = tag.parent()
    }

    for (var attr in attrs) {
      if (converters.inline[attr]) {
        if (activeInline[attr]) {
          if (activeInline[attr] === attrs[attr]) {
            continue; // do nothing -- we should already be inside this style's tag
          }
        }

        if (next && attrs[attr] === next[attr]) {
          first.push(attr); // if the next operation has the same style, this should be the outermost tag
        } else {
          then.push(attr);
        }
        activeInline[attr] = attrs[attr];
      }
    }

    first.forEach(apply);
    then.forEach(apply);

    function apply(fmt) {
      var newEl = converters.inline[fmt].call(null, attrs[fmt]);
      if (isArray(newEl)) {
        newEl = new Node(newEl);
      }
      newEl._format = fmt;
      el.append(newEl);
      el = newEl;
    }
  }
}

function hasBlockLevelAttribute(attrs, converters) {
  for (var k in attrs) {
    if (Object.keys(converters.block).includes(k)) {
      return true
    }
  }
  return false
}
