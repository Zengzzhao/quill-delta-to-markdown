module.exports = {
  deltaToMarkdown: require("./src/fromDelta"),
};
const deltaToMarkdown = require("./src/fromDelta");
console.log(
  deltaToMarkdown([
    {
      insert: {
        image: "data:image/jpeg;base64,/9j",
      },
    },
    {
      insert: "\n",
    },
  ])
);
