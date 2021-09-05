import * as codecs from './codecs';

describe('Codecs', () => {
  describe('string codec', () => {
    const plain = 'a string with "some"/"a few" non url-safe characters';
    const encoded =
      'a%20string%20with%20%22some%22%2F%22a%20few%22%20non%20url-safe%20characters';

    it('encodes', () => {
      const result = codecs.string.encode(plain);
      expect(result).toEqual(encoded);
    });

    it('decodes', () => {
      const result = codecs.string.decode(encoded);
      expect(result).toEqual(plain);
    });
  });

  describe('number codec', () => {
    const plain = 124.125126512651;
    const encoded = '124.125126512651';

    it('encodes', () => {
      const result = codecs.number.encode(plain);
      expect(result).toEqual(encoded);
    });

    it('decodes', () => {
      const result = codecs.number.decode(encoded);
      expect(result).toEqual(plain);
    });
  });

  describe('bool codec', () => {
    it('encodes', () => {
      expect(codecs.boolean.encode(true)).toEqual('1');
      expect(codecs.boolean.encode(false)).toEqual('0');
    });

    it('decodes', () => {
      expect(codecs.boolean.decode('1')).toEqual(true);
      expect(codecs.boolean.decode('0')).toEqual(false);
    });
  });
});
