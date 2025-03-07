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
      expect(codecs.boolean.decode('1')).toBe(true);
      expect(codecs.boolean.decode('0')).toBe(false);
    });
  });

  describe('oneOf codec', () => {
    it('throws if two options has the same string representation', () => {
      expect(() => {
        codecs.oneOf([1, 1] as const);
      }).toThrow(new Error('Option to oneOf collision on key: 1'));

      expect(() => {
        codecs.oneOf([
          {
            toString() {
              return 'foobar';
            },
          },
          {
            toString() {
              return 'foobar';
            },
          },
        ] as const);
      }).toThrow(new Error('Option to oneOf collision on key: foobar'));
    });

    describe('using number', () => {
      const states = [1, 2, 3] as const;
      const state = codecs.oneOf(states);

      it('encodes', () => {
        expect(state.encode(2)).toStrictEqual('2');
      });

      describe('decode', () => {
        it('decodes', () => {
          expect(state.decode('2')).toBe(2);
        });

        it('returns first option if no match', () => {
          expect(state.decode('miss')).toBe(1);
        });
      });
    });

    describe('using string', () => {
      const states = ['low 1', 'medium 2', 'high 3'] as const;
      const state = codecs.oneOf(states);

      it('encodes', () => {
        expect(state.encode('high 3')).toStrictEqual('high 3');
      });

      describe('decode', () => {
        it('decodes', () => {
          expect(state.decode('high 3')).toBe('high 3');
        });

        it('returns first option if no match', () => {
          expect(state.decode('miss')).toBe('low 1');
        });
      });
    });

    describe('using standard enum', () => {
      enum State {
        Low,
        Medium,
        High,
      }

      const states = [State.Low, State.Medium, State.High] as const;
      const state = codecs.oneOf(states);

      it('encodes', () => {
        expect(state.encode(State.High)).toStrictEqual('2');
      });

      describe('decode', () => {
        it('decodes', () => {
          expect(state.decode('2')).toBe(State.High);
        });

        it('returns first option if no match', () => {
          expect(state.decode('miss')).toBe(State.Low);
        });
      });
    });

    describe('using string enum', () => {
      enum State {
        Low = 'low',
        Medium = 'medium',
        High = 'high',
      }

      const states = [State.Low, State.Medium, State.High] as const;
      const state = codecs.oneOf(states);

      it('encodes', () => {
        expect(state.encode(State.High)).toStrictEqual('high');
      });

      describe('decode', () => {
        it('decodes', () => {
          expect(state.decode('high')).toBe(State.High);
        });

        it('returns first option if no match', () => {
          expect(state.decode('miss')).toBe(State.Low);
        });
      });
    });

    describe('using custom type', () => {
      type MyType = { toString(): string };

      const MyTypeOne: MyType = {
        toString() {
          return 'one';
        },
      };

      const MyTypeTwo: MyType = {
        toString() {
          return 'two';
        },
      };

      const states = [MyTypeOne, MyTypeTwo] as const;
      const state = codecs.oneOf(states);

      it('encodes', () => {
        expect(state.encode(MyTypeOne)).toStrictEqual('one');
      });

      describe('decode', () => {
        it('decodes', () => {
          expect(state.decode('two')).toBe(MyTypeTwo);
        });

        it('returns first option if no match', () => {
          expect(state.decode('miss')).toBe(MyTypeOne);
        });
      });
    });

    describe('using mixed', () => {
      const NONE = {
        toString() {
          return '--';
        },
      };

      const states = [NONE, 'a', 'b', 1, 2] as const;
      const state = codecs.oneOf(states);

      it('encodes', () => {
        expect(state.encode(2)).toStrictEqual('2');
      });

      describe('decode', () => {
        it('decodes', () => {
          expect(state.decode('a')).toBe('a');
          expect(state.decode('b')).toBe('b');
          expect(state.decode('1')).toBe(1);
          expect(state.decode('2')).toBe(2);
        });

        it('returns first option if no match', () => {
          expect(state.decode('miss')).toBe(NONE);
        });
      });
    });
  });
});
