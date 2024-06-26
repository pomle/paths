import { createPath, createParts } from '../path';
import * as codec from '../codecs';

describe('#createParts', () => {
  it('removes heading slash', () => {
    const path = createParts('/my/path');
    expect(path).toStrictEqual(['my', 'path']);
  });

  it('removes trailing slash', () => {
    const path = createParts('my/path/');
    expect(path).toStrictEqual(['my', 'path']);
  });

  it('removes empty segments', () => {
    const path = createParts('///my/// //path////');
    expect(path).toStrictEqual(['my', 'path']);
  });

  it('removes heading white-space', () => {
    const path = createParts(' my/ first/path');
    expect(path).toStrictEqual(['my', 'first', 'path']);
  });

  it('removes trailing white-space', () => {
    const path = createParts('my/second /path ');
    expect(path).toStrictEqual(['my', 'second', 'path']);
  });

  it('keeps white-space in segments', () => {
    const path = createParts('my/ segmented awesome /path ');
    expect(path).toStrictEqual(['my', 'segmented awesome', 'path']);
  });
});

describe('#createPath', () => {
  describe('normalization', () => {
    it('automatically prepends missing slash', () => {
      const path = createPath('should/have/heading/slash', {});
      expect(path.name).toBe('/should/have/heading/slash');
    });

    it('automatically removes trailing slash', () => {
      const path = createPath('should/not/have/trainling/slash/', {});
      expect(path.name).toBe('/should/not/have/trainling/slash');
    });

    it('automatically injects missing slash on append', () => {
      const first = createPath('first', {});
      const second = first.append('second', {});
      expect(second.name).toBe('/first/second');
    });
  });

  describe('#path', () => {
    const params = { text: 'fo o', number: 2, boolean: false };

    const path = createPath('/text/:text/:number/:boolean', {
      text: codec.string,
      number: codec.number,
      boolean: codec.boolean,
    });

    it('builds path from params', () => {
      expect(path.build(params)).toStrictEqual('/text/fo%20o/2/0');
    });

    it('provides URL alias', () => {
      expect(path.url(params)).toStrictEqual('/text/fo%20o/2/0');
    });

    describe('#match', () => {
      it('returns positive integer if overmatch', () => {
        expect(path.match('/text/fo%20o/2/0/extra/parts')).toBe(2);
      });

      it('returns 0 if exact match', () => {
        expect(path.match('/text/fo%20o/2/0')).toBe(0);
      });

      it('returns negative integer if undermatch', () => {
        expect(path.match('/text')).toBe(-3);
      });
    });

    describe('#parse', () => {
      it('parses path string', () => {
        expect(path.parse('/text/fo%20o/2/0')).toStrictEqual(params);
      });

      it('parses overmatching path string', () => {
        expect(path.parse('/text/fo%20o/2/0/and/more/parts')).toStrictEqual(
          params,
        );
      });

      it('returns null on non-matching paths', () => {
        expect(path.parse('/not/correct/path')).toStrictEqual(null);
      });

      it('returns null on under-matching paths', () => {
        expect(path.parse('/text/fo%20o/2')).toStrictEqual(null);
      });
    });

    describe('#append', () => {
      it('throws if codec has overlapping keys', () => {
        const part1 = createPath('/:foo', {
          foo: codec.string,
        });

        expect(() => {
          part1.append('/:foo', {
            foo: codec.string,
          });
        }).toThrow(new Error('Appended codec collides on :foo'));

        const part2 = part1.append('/:bar', {
          bar: codec.string,
        });

        expect(() => {
          part2.append('/:foo', {
            foo: codec.string,
          });
        }).toThrow(new Error('Appended codec collides on :foo'));
      });
    });

    it('creates typed params from URL', () => {
      expect(
        path.decode({ text: 'fo%20o', number: '2', boolean: '0' }),
      ).toStrictEqual(params);
    });

    it('typed string params from typed params', () => {
      expect(path.encode(params)).toStrictEqual({
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
        expect(appendedPath.url(appendedParams)).toStrictEqual(
          '/text/fo%20o/2/0/extra/22bbee',
        );
      });

      it('matches path', () => {
        expect(appendedPath.match('/text/fo%20o/2/0/extra/22bbee')).toBe(0);
      });

      it('matches sub path', () => {
        expect(
          appendedPath.match('/text/fo%20o/2/0/extra/22bbee/and/more/extra'),
        ).toBe(3);
      });

      it('parses  sub', () => {
        expect(
          appendedPath.match('/text/fo%20o/2/0/extra/22bbee/and/more/extra'),
        ).toBe(3);
      });

      it('creates typed params from URL', () => {
        expect(
          appendedPath.decode({
            text: 'fo%20o',
            number: '2',
            boolean: '0',
            extra: '22bbee',
          }),
        ).toStrictEqual(appendedParams);
      });
    });
  });

  describe('throws if param not in path string', () => {
    expect(() => {
      createPath('/:foo/', { bar: codec.string });
    }).toThrowError(new Error(`Param :bar not in path name`));
  });
});
