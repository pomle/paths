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
  name: string;
  codec: Codec;
  url(params: Values<Codec>): string;
  build(params: Values<Codec>): string;
  parse(path: string): Values<Codec> | null;
  match(path: string): number;
  encode(params: Values<Codec>): Params<Codec>;
  decode(params: Params<Codec>): Values<Codec>;
  append<AdditionalCodec extends PathCodec>(
    pathName: string,
    codec: AdditionalCodec,
  ): Path<Codec & AdditionalCodec>;
}

export function createParts(pathName: string) {
  return pathName
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function createPath<Codec extends PathCodec>(
  pathName: string,
  codec: Codec,
): Path<Codec> {
  const components = createParts(pathName);
  pathName = '/' + components.join('/');

  const keys = Object.keys(codec);

  const parser = createParser<keyof Codec>(components, keys);

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

  function match(pathName: string) {
    const parts = createParts(pathName);
    return parser.matchPath(parts);
  }

  function parse(pathName: string) {
    const parts = createParts(pathName);
    if (parser.matchPath(parts) < 0) {
      return null;
    }
    const params = parser.parsePath(parts);
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
    for (const key of keys) {
      if (addCodec[key]) {
        throw new Error(`Appended codec collides on :${key}`);
      }
    }

    return createPath(pathName + '/' + appendixPathName, {
      ...codec,
      ...addCodec,
    });
  }

  return {
    name: pathName,
    codec,
    encode,
    decode,
    match,
    parse,
    build,
    url: build,
    append,
  };
}
