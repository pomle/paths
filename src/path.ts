import { createParser } from './parser';
import { Codec } from './codec';

export type PathCodec = Record<string, Codec<any>>;

type Values<Codec extends PathCodec> = {
  [key in keyof Codec]: ReturnType<Codec[key]['decode']>;
};

type Params<Codec extends PathCodec> = {
  [key in keyof Codec]: string;
};

export interface Path<Codec extends PathCodec> {
  path: string;
  codec: Codec;
  url(params: Values<Codec>): string;
  build(params: Values<Codec>): string;
  parse(path: string): Values<Codec> | null;
  encode(params: Values<Codec>): Params<Codec>;
  decode(params: Params<Codec>): Values<Codec>;
  append<AdditionalCodec extends PathCodec>(
    pathName: string,
    codec: AdditionalCodec,
  ): Path<Codec & AdditionalCodec>;
}

export function createPath<Codec extends PathCodec>(
  pathName: string,
  codec: Codec,
): Path<Codec> {
  const keys = Object.keys(codec);

  const parser = createParser<keyof Codec>(pathName, keys);

  function encode(values: Values<Codec>) {
    const encoded: Record<string, string> = {};
    for (const key of keys) {
      encoded[key] = encodeURIComponent(codec[key].encode(values[key]));
    }
    return encoded as Params<Codec>;
  }

  function decode(params: Params<Codec>) {
    const decoded: Record<string, unknown> = {};
    for (const key of keys) {
      decoded[key] = codec[key].decode(decodeURIComponent(params[key]));
    }
    return decoded as Values<Codec>;
  }

  function parse(path: string) {
    if (parser.matchPath(path) < 0) {
      return null;
    }
    const params = parser.parsePath(path);
    return decode(params);
  }

  function build(params: Values<Codec>) {
    const encoded = encode(params);
    return Object.entries(encoded).reduce((pathName, [key, value]) => {
      return pathName.replace(':' + key, value);
    }, pathName);
  }

  function append<AdditionalCodec extends PathCodec>(
    appendixPathName: string,
    addCodec: AdditionalCodec,
  ) {
    return createPath(pathName + appendixPathName, { ...codec, ...addCodec });
  }

  return {
    path: pathName,
    codec,
    encode,
    decode,
    parse,
    build,
    url: build,
    append,
  };
}
