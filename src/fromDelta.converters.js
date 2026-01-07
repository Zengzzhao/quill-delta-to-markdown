const Node = require('./utils/Node');
const { encodeLink } = require('./utils/URL');

// 转换规则表
// 将Delta的各种类型映射到对应的Markdown语法
module.exports = {
  // 嵌入类型
  embed: {
    image: function(src) {
      this.append('![](' + encodeLink(src) + ')');
    },
    // 不是Quill的默认功能,转换自定义的分割线嵌入块,见https://quilljs.com/guides/cloning-medium-with-parchment/#dividers
    thematic_break: function() {
      this.open = '\n---\n' + this.open;
    },
  },
  // 行内类型
  inline: {
    italic: function() {
      return ['_', '_'];
    },
    bold: function() {
      return ['**', '**'];
    },
    link: function(url) {
      return ['[', '](' + url + ')'];
    },
  },
  // 块级类型
  block: {
    'header': function({header}) {
      this.open = '#'.repeat(header) + ' ' + this.open;
    },
    blockquote: function() {
      this.open = '> ' + this.open;
    },
    'list': {
      group: function() {
        return new Node(['', '\n']);
      },
      line: function(attrs, group) {
        if (attrs.list === 'bullet') {
          this.open = '- ' + this.open;
        } else if (attrs.list === "checked") {
          this.open = '- [x] ' + this.open;
        } else if (attrs.list === "unchecked") {
          this.open = '- [ ] ' + this.open;
        } else if (attrs.list === 'ordered') {
          group.count = group.count || 0;
          var count = ++group.count;
          this.open = count + '. ' + this.open;
        }
      },
    },
    'code-block': function(attrs, group, inCodeBlock) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        this.open = '```\n';
      }
      return inCodeBlock;
    }
  },
}
