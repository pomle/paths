import { createParser } from '../parser';

describe('#createParser', () => {
  it('throws if keys not defined', () => {
    expect(() => {
      createParser<'name' | 'notavailable'>(
        ['my', ':name', 'parsable', 'url', ':number'],
        ['name', 'notavailable'],
      );
    }).toThrow(new Error('Param :notavailable not in path name'));
  });

  describe('#parser', () => {
    const parser = createParser<'name' | 'number'>(
      ['my', ':name', 'parsable', 'url', ':number'],
      ['name', 'number'],
    );

    describe('#matchPath', () => {
      it('returns 0 if path is compatible as exact match', () => {
        expect(
          parser.matchPath(['my', 'pontus', 'parsable', 'url', '1234']),
        ).toBe(0);

        expect(
          parser.matchPath(['my', 'burger', 'parsable', 'url', 'fm83']),
        ).toBe(0);
      });

      it('returns positive integer if path starts with parser', () => {
        expect(
          parser.matchPath(['my', 'foo', 'parsable', 'url', 'bar', 'a']),
        ).toBe(1);

        expect(
          parser.matchPath(['my', 'foo', 'parsable', 'url', 'bar', 'a', 'b']),
        ).toBe(2);

        expect(
          parser.matchPath([
            'my',
            'foo',
            'parsable',
            'url',
            'bar',
            'a',
            'b',
            'c',
          ]),
        ).toBe(3);

        expect(
          parser.matchPath([
            'my',
            'foo',
            'parsable',
            'url',
            'bar',
            'and',
            'four',
            'more',
            'parts',
          ]),
        ).toBe(4);
      });

      it('returns count of missing parts when static part is mismatching', () => {
        expect(
          parser.matchPath(['your', 'foo', 'parsable', 'url', 'bar']),
        ).toBe(-5);
        expect(
          parser.matchPath(['my', 'foo', 'nonparsable', 'url', 'bar']),
        ).toBe(-3);
      });

      it('returns negative integer if part is under-matching', () => {
        expect(parser.matchPath(['my'])).toBe(-4);

        expect(parser.matchPath(['my', 'foo'])).toBe(-3);

        expect(parser.matchPath(['my', 'foo', 'parsable'])).toBe(-2);

        expect(parser.matchPath(['my', 'foo', 'parsable', 'url'])).toBe(-1);

        expect(parser.matchPath(['my', 'foo', 'parsable', 'url', 'bar'])).toBe(
          0,
        );
      });
    });

    describe('#parsePath', () => {
      it('parses arguments frivolously if it can based on position', () => {
        expect(
          parser.parsePath(['a', 'pontus', 'b', 'c', '1234']),
        ).toStrictEqual({
          name: 'pontus',
          number: '1234',
        });

        expect(
          parser.parsePath(['quack', 'pontus', 'pluck', 'truck', '1234']),
        ).toStrictEqual({
          name: 'pontus',
          number: '1234',
        });

        expect(parser.parsePath([])).toStrictEqual({
          name: undefined,
          number: undefined,
        });

        expect(
          parser.parsePath(['quack', 'pontus', 'pluck', 'truck']),
        ).toStrictEqual({
          name: 'pontus',
          number: undefined,
        });
      });
    });
  });
});
