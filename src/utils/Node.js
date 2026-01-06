const isArray = require("lodash/isArray");
const isString = require("lodash/isString");
const pull = require("lodash/pull");

var id = 0;

// 小型AST节点类，用于构建和渲染Markdown文本
class Node {
  // 形态1：data是数组[open, close],open是渲染时的前缀,close是后缀
  // 形态2：data是字符串text
  constructor(data) {
    this.id = ++id;
    if (isArray(data)) {
      this.open = data[0];
      this.close = data[1];
    } else if (isString(data)) {
      this.text = data;
    }
    this.children = [];
  }

  // 将子节点e添加到当前节点的children数组中,用于组装成树
  append(e) {
    // 自动包装成Node节点
    if (!(e instanceof Node)) {
      e = new Node(e);
    }
    // 如果子节点已经有父节点，先从父节点的children中移除
    if (e._parent) {
      pull(e._parent.children, e);
    }
    e._parent = this;
    this.children = this.children.concat(e);
  }

  // 深度优先递归节点,拼接成Markdown字符串
  // 先输出open，再输出text，再输出子节点的render，最后输出close
  render() {
    var text = "";
    if (this.open) {
      text += this.open;
    }
    if (this.text) {
      text += this.text;
    }
    for (var i = 0; i < this.children.length; i++) {
      text += this.children[i].render();
    }
    if (this.close) {
      text += this.close;
    }
    return text;
  }

  parent() {
    return this._parent;
  }
}

module.exports = Node;
