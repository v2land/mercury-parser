// A small patch to solve the problem of non-latin characters being encoded to entities
// https://github.com/cheeriojs/cheerio/issues/866#issuecomment-482730997

const cheerio = require('cheerio');

const { load } = cheerio;

function decode(string) {
  return string.replace(/&#x([0-9a-f]{1,6});/gi, (entity, code) => {
    code = parseInt(code, 16);

    // Don't unescape ASCII characters, assuming they're encoded for a good reason
    if (code < 0x80) return entity;

    return String.fromCodePoint(code);
  });
}

function wrapHtml(fn) {
  return function(...args) {
    const result = fn.apply(this, args);
    return typeof result === 'string' ? decode(result) : result;
  };
}

cheerio.load = function(...args) {
  const instance = load.apply(this, args);

  instance.html = wrapHtml(instance.html);
  instance.prototype.html = wrapHtml(instance.prototype.html);

  return instance;
};

export default cheerio;
