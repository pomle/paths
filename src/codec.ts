import { ParamCodec } from './path';

export function createCodec<T>(
  encode: (source: T) => string,
  decode: (source: string) => T,
): ParamCodec<T> {
  return {
    encode,
    decode,
  };
}
