export type Codec<SourceType> = {
  encode: (source: SourceType) => string;
  decode: (param: string) => SourceType;
};

export function createCodec<T>(
  encode: (source: T) => string,
  decode: (source: string) => T,
): Codec<T> {
  return {
    encode,
    decode,
  };
}
