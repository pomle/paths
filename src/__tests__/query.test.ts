import { buildQuery, createQuery, parseQuery } from '../query';
import * as codec from '../codecs';

describe('#buildQuery', () => {
  it('builds a query string from object', () => {
    const text = buildQuery({
      a: ['1'],
      b: ['2', '4'],
    });

    expect(text).toEqual('a=1&b=2&b=4');
  });
});

describe('#parseQuery', () => {
  it('parses a query string to object', () => {
    const value = parseQuery('a=1&b=2&b=4');

    expect(value).toEqual({
      a: ['1'],
      b: ['2', '4'],
    });
  });
});

describe('#createQuery', () => {
  describe('#query', () => {
    const values = {
      text: ['fo o'],
      number: [2],
      boolean: [false],
      many_numbers: [1, 2, 3],
    };

    const params = {
      text: ['fo o'],
      number: ['2'],
      boolean: ['0'],
      many_numbers: ['1', '2', '3'],
    };

    const query = createQuery({
      text: codec.string,
      number: codec.number,
      boolean: codec.boolean,
      many_numbers: codec.number,
    });

    it('decodes text to values', () => {
      expect(query.decode(params)).toEqual(values);
    });

    it('encodes values to text', () => {
      expect(query.encode(values)).toEqual(params);
    });

    it('encodes search query from params', () => {
      expect(query.build(values)).toEqual(
        'text=fo+o&number=2&boolean=0&many_numbers=1&many_numbers=2&many_numbers=3',
      );
    });

    it('creates typed params from URL', () => {
      expect(
        query.parse(
          'text=fo+o&number=2&boolean=0&many_numbers=1&many_numbers=2&many_numbers=3',
        ),
      ).toEqual(values);
    });

    it('provides keys for missing params', () => {
      expect(query.parse('text=fo+o&number=2&boolean=0')).toEqual({
        text: ['fo o'],
        number: [2],
        boolean: [false],
        many_numbers: [],
      });
    });

    it('builds URL from partial params', () => {
      expect(
        query.build({
          text: ['fo o'],
          boolean: [false],
        }),
      ).toEqual('text=fo+o&boolean=0');

      expect(
        query.build({
          number: [],
          many_numbers: [1, 2, 3, 4],
        }),
      ).toEqual('many_numbers=1&many_numbers=2&many_numbers=3&many_numbers=4');
    });
  });
});
