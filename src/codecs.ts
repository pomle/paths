import { createCodec } from './codec';

export const string = createCodec(
  (value: string) => value,
  (text: string) => text,
);

export const number = createCodec(
  (value: number) => value.toString(),
  (text: string) => parseFloat(text),
);

export const boolean = createCodec(
  (value: boolean) => (value ? '1' : '0'),
  (text: string) => text === '1',
);

export const oneOf = <T extends { toString: () => string }>(
  options: readonly [T, ...T[]],
) => {
  const valid = new Map<string, T>();
  for (const option of options) {
    const key = option.toString();
    if (valid.has(key)) {
      throw new Error(`Option to oneOf collision on key: ${key}`);
    }
    valid.set(key, option);
  }

  return createCodec<T>(
    (value: T) => value.toString(),
    (param: string) => {
      return valid.get(param) ?? options[0];
    },
  );
};

export const set = <T extends string>(valid: readonly T[]) => {
  const VALID = new Set(valid);

  return createCodec<T | undefined>(
    (source) => source ?? '',
    (source: string) => {
      if (VALID.has(source as T)) {
        return source as T;
      }

      return undefined;
    },
  );
};
