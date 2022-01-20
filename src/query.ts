import { Codec } from './codec';

export function parseQuery(search: string) {
  const params = new URLSearchParams(search);
  const data: Record<string, string[]> = {};
  for (const key of params.keys()) {
    data[key] = params.getAll(key);
  }
  return data;
}

export function buildQuery(data: Record<string, string[]>) {
  const params = new URLSearchParams();
  for (const key of Object.keys(data)) {
    for (const value of data[key]) {
      params.append(key, value);
    }
  }
  return params.toString();
}

export type QueryCodec = Record<string, Codec<any>>;

export type Values<Codec extends QueryCodec> = {
  [key in keyof Codec]: ReturnType<Codec[key]['decode']>[];
};

export type Params<Codec extends QueryCodec> = {
  [key in keyof Codec]: string[];
};

export interface Query<Codec extends QueryCodec> {
  encode(values: Values<Codec>): Params<Codec>;
  decode(params: Params<Codec>): Values<Codec>;
  parse(search: string): Values<Codec>;
  build(source: Values<Codec>): string;
}

export function createQuery<T extends QueryCodec>(codecs: T): Query<T> {
  const keys = Object.keys(codecs);

  function encode(values: Values<T>) {
    const params: Record<string, string[]> = {};
    for (const key of keys) {
      params[key] = values[key].map(codecs[key].encode);
    }
    return params as Params<T>;
  }

  function decode(params: Params<T>) {
    const values: Record<string, unknown[]> = {};
    for (const key of keys) {
      values[key] = params[key].map(codecs[key].decode);
    }
    return values as Values<T>;
  }

  function parse(search: string) {
    const params = parseQuery(search) as Params<T>;
    return decode(params);
  }

  function build(source: Values<T>) {
    const params = encode(source);
    return buildQuery(params);
  }

  return {
    encode,
    decode,
    parse,
    build,
  };
}
