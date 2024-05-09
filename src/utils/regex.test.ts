import {
  compileInputRegexForDelimiter,
  compilePasteRegexForDelimiter,
  escapeRegExp,
} from './regex';

describe('Regex Utilities', () => {
  describe('escapeRegExp', () => {
    it('should escape all special regex characters', () => {
      const specialChars = `.*+?^$\{}()|[]\\`;
      const escapedSpecialChars = escapeRegExp(specialChars);
      const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';

      expect(escapedSpecialChars).toBe(expected);
    });

    it('should return the same string if no special characters are present', () => {
      const normalString = 'helloWorld123';
      const escapedString = escapeRegExp(normalString);

      expect(escapedString).toBe(normalString);
    });

    it('should correctly escape mixed strings', () => {
      const mixedString = 'hello$.|*world';
      const escapedMixedString = escapeRegExp(mixedString);
      const expected = 'hello\\$\\.\\|\\*world';

      expect(escapedMixedString).toBe(expected);
    });
  });

  describe('compileInputRegexForDelimiter', () => {
    it('should compile a regex using regular chars', () => {
      const regex = compileInputRegexForDelimiter('$');
      const expected = /(?:^|\s)((?:\$)((?:[^\$]+))(?:\$))$/u;

      expect(regex).toStrictEqual(expected);
    });

    it('should support emojis', () => {
      const regex = compileInputRegexForDelimiter('🧮');
      const expected = /(?:^|\s)((?:🧮)((?:[^🧮]+))(?:🧮))$/u;

      expect(regex).toStrictEqual(expected);
    });
  });

  describe('compilePasteRegexForDelimiter', () => {
    it('should compile a regex using regular chars', () => {
      const regex = compilePasteRegexForDelimiter('$');
      const expected = /(?:^|\s)((?:\$)((?:[^\$]+))(?:\$))/gu;

      expect(regex).toStrictEqual(expected);
    });

    it('should support emojis', () => {
      const regex = compilePasteRegexForDelimiter('🧮');
      const expected = /(?:^|\s)((?:🧮)((?:[^🧮]+))(?:🧮))/gu;

      expect(regex).toStrictEqual(expected);
    });
  });
});
