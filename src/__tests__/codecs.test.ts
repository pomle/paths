import * as codecs from '../codecs';

describe('Codecs', () => {
  describe('string codec', () => {
    const plain = 'a string with "some"/"a few" non url-safe characters';
    const encoded = 'a string with "some"/"a few" non url-safe characters';

    it('encodes', () => {
      const result = codecs.string.encode(plain);
      expect(result).toStrictEqual(encoded);
    });

    it('decodes', () => {
      const result = codecs.string.decode(encoded);
      expect(result).toStrictEqual(plain);
    });
  });

  describe('number codec', () => {
    const plain = 124.125126512651;
    const encoded = '124.125126512651';

    it('encodes', () => {
      const result = codecs.number.encode(plain);
      expect(result).toStrictEqual(encoded);
    });

    it('decodes', () => {
      const result = codecs.number.decode(encoded);
      expect(result).toStrictEqual(plain);
    });
  });

  describe('bool codec', () => {
    it('encodes', () => {
      expect(codecs.boolean.encode(true)).toStrictEqual('1');
      expect(codecs.boolean.encode(false)).toStrictEqual('0');
    });

    it('decodes', () => {
      expect(codecs.boolean.decode('1')).toStrictEqual(true);
      expect(codecs.boolean.decode('0')).toStrictEqual(false);
    });
  });
});
