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

    describe('#match', () => {
      it('returns params if path matches', () => {
        expect(path.match('/text/fo%20o/2/0')?.values).toEqual(params);
      });

      it('sets exact flag to true on perfactly matching', () => {
        expect(path.match('/text/fo%20o/2/0')?.exact).toBe(true);
      });

      it('parses overmatching path string', () => {
        expect(path.match('/text/fo%20o/2/0/and/more/parts')?.values).toEqual(
          params,
        );
      });

      it('sets exact flag to false on overmatching', () => {
        expect(path.match('/text/fo%20o/2/0/and/more/parts')?.exact).toBe(
          false,
        );
      });

      it('returns null on non-matching paths', () => {
        expect(path.match('/not/correct/path')).toEqual(null);
      });

      it('returns null on under-matching paths', () => {
        expect(path.match('/text/fo%20o/2')).toEqual(null);
      });
    });

    describe('#parse', () => {
      it('parses path string', () => {
        expect(path.parse('/text/fo%20o/2/0')).toEqual(params);
      });

      it('parses overmatching path string', () => {
        expect(path.parse('/text/fo%20o/2/0/and/more/parts')).toEqual(params);
      });

      it('returns null on non-matching paths', () => {
        expect(path.parse('/not/correct/path')).toEqual(null);
      });

      it('returns null on under-matching paths', () => {
        expect(path.parse('/text/fo%20o/2')).toEqual(null);
      });
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
