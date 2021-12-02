import { createQuery } from '../query';
import * as codec from '../codecs';

describe('#createQuery', () => {
  describe('#query', () => {
    const params = {
      text: ['fo o'],
      number: [2],
      boolean: [false],
      many_numbers: [1, 2, 3],
    };

    const query = createQuery({
      text: codec.string,
      number: codec.number,
      boolean: codec.boolean,
      many_numbers: codec.number,
    });

    it('encodes search query from params', () => {
      expect(query.build(params)).toEqual(
        'text=fo+o&number=2&boolean=0&many_numbers=1&many_numbers=2&many_numbers=3',
      );
    });

    it('creates typed params from URL', () => {
      expect(
        query.parse(
          'text=fo+o&number=2&boolean=0&many_numbers=1&many_numbers=2&many_numbers=3',
        ),
      ).toEqual(params);
    });
  });
});
