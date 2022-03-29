import { createParser } from '../parser';

describe('#createParser', () => {
  it('throws if keys not defined', () => {
    expect(() => {
      createParser<'name' | 'notavailable'>('/my/:name/parsable/url/:number', [
        'name',
        'notavailable',
      ]);
    }).toThrow(new Error('Param :notavailable not in path name'));
  });

  describe('#parser', () => {
    const parser = createParser<'name' | 'number'>(
      '/my/:name/parsable/url/:number',
      ['name', 'number'],
    );

    describe('#matchPath', () => {
      it('returns true if path is compatible', () => {
        expect(parser.matchPath('/my/pontus/parsable/url/1234')).toBe(true);
        expect(parser.matchPath('/my/burger/parsable/url/fm83')).toBe(true);
      });

      it('returns true if path starts with parser', () => {
        expect(parser.matchPath('/my/foo/parsable/url/bar/a')).toBe(true);
        expect(parser.matchPath('/my/foo/parsable/url/bar/a/b')).toBe(true);
        expect(parser.matchPath('/my/foo/parsable/url/bar/a/b/c')).toBe(true);
        expect(
          parser.matchPath('/my/foo/parsable/url/bar/and/more/parts'),
        ).toBe(true);
      });

      it('returns false if any static part is mismatching', () => {
        expect(parser.matchPath('/your/foo/parsable/url/bar')).toBe(false);
        expect(parser.matchPath('/your/foo/parsable/url/bar')).toBe(false);
        expect(parser.matchPath('/my/foo/nonparsable/url/bar')).toBe(false);
      });

      it('returns false if part is matching', () => {
        expect(parser.matchPath('/my')).toBe(false);
        expect(parser.matchPath('/my/foo')).toBe(false);
        expect(parser.matchPath('/my/foo/parsable')).toBe(false);
        expect(parser.matchPath('/my/foo/parsable/url')).toBe(false);
        expect(parser.matchPath('/my/foo/parsable/url/bar')).toBe(true);
      });
    });

    describe('#parsePath', () => {
      it('parses arguments frivolously if it can based on position', () => {
        expect(parser.parsePath('/a/pontus/b/c/1234')).toEqual({
          name: 'pontus',
          number: '1234',
        });

        expect(parser.parsePath('/quack/pontus/pluck/truck/1234')).toEqual({
          name: 'pontus',
          number: '1234',
        });

        expect(parser.parsePath('/')).toEqual({
          name: undefined,
          number: undefined,
        });

        expect(parser.parsePath('/quack/pontus/pluck/truck')).toEqual({
          name: 'pontus',
          number: undefined,
        });
      });
    });
  });
});
