// Chars that need to be escaped in the compiled regex below
const REGEX_SPECIAL_CHARS = /[.*+?^{}()$|[\]\\]/g;
// How to escape the special characters
const REGEX_ESCAPE = '\\$&';

// Escape special characters in a string to be used in a regex
export function escapeRegExp(str: string) {
  return str.replace(REGEX_SPECIAL_CHARS, REGEX_ESCAPE);
}

// Compiles the input regex for Tiptap using the desired delimiter
// https://tiptap.dev/docs/editor/guide/custom-extensions#input-rules
export function compileInputRegexForDelimiter(delimiter: string) {
  // Escape the delimiter if needed
  const escapedDelimiter = escapeRegExp(delimiter);
  // Compile the regex
  return new RegExp(
    `(?:^|\\s)((?:${escapedDelimiter})((?:[^${escapedDelimiter}]+))(?:${escapedDelimiter}))$`,
    'u',
  );
}

// Compiles the paste regex for Tiptap using the desired delimiter
// https://tiptap.dev/docs/editor/guide/custom-extensions#paste-rules
export function compilePasteRegexForDelimiter(delimiter: string) {
  //
  const escapedDelimiter = escapeRegExp(delimiter);
  return new RegExp(
    `(?:^|\\s)((?:${escapedDelimiter})((?:[^${escapedDelimiter}]+))(?:${escapedDelimiter}))`,
    'gu',
  );
}
