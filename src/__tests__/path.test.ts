import { createPath } from '../path';
import * as codec from '../codecs';

describe('#createPath', () => {
  describe('#path', () => {
    const params = { text: 'fo o', number: 2, boolean: false };

    const path = createPath('/text/:text/:number/:boolean', {
      text: codec.string,
      number: codec.number,
      boolean: codec.boolean,
    });

    it('builds path from params', () => {
      expect(path.build(params)).toEqual('/text/fo%20o/2/0');
    });

    it('provides URL alias', () => {
      expect(path.url(params)).toEqual('/text/fo%20o/2/0');
    });

    it('parses path string', () => {
      expect(path.parse('/text/fo%20o/2/0')).toEqual(params);
    });

    it('creates typed params from URL', () => {
      expect(
        path.decode({ text: 'fo%20o', number: '2', boolean: '0' }),
      ).toEqual(params);
    });

    it('typed string params from typed params', () => {
      expect(path.encode(params)).toEqual({
        text: 'fo%20o',
        number: '2',
        boolean: '0',
      });
    });

    describe('appended path', () => {
      const appendedPath = path.append('/extra/:extra', {
        extra: codec.string,
      });

      const appendedParams = { ...params, extra: '22bbee' };

      it('encodes URL from params', () => {
        expect(appendedPath.url(appendedParams)).toEqual(
          '/text/fo%20o/2/0/extra/22bbee',
        );
      });

      it('creates typed params from URL', () => {
        expect(
          appendedPath.decode({
            text: 'fo%20o',
            number: '2',
            boolean: '0',
            extra: '22bbee',
          }),
        ).toEqual(appendedParams);
      });
    });
  });

  describe('throws if param not in path string', () => {
    expect(() => {
      createPath('/:foo/', { bar: codec.string });
    }).toThrowError(new Error(`Param :bar not in path name`));
  });
});
