const ghPages = process.env.DEPLOY_TARGET === "gh-pages";
const withNextOptimizedImages = require("next-optimized-images");

module.exports = withNextOptimizedImages({
  target: "serverless",
});
