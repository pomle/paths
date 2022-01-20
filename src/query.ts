import { Codec } from './codec';

function parseSearch(keys: string[], search: string) {
  const params = new URLSearchParams(search);
  const data: Record<string, string[]> = {};
  for (const key of keys) {
    data[key] = params.getAll(key);
  }
  return data;
}

function buildSearch(data: Record<string, string[]>) {
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

  return {
    encode(values: Values<T>) {
      const params: Record<string, string[]> = {};
      for (const key of keys) {
        params[key] = values[key].map(codecs[key].encode);
      }
      return params as Params<T>;
    },

    decode(params: Params<T>) {
      const values: Record<string, unknown[]> = {};
      for (const key of keys) {
        values[key] = params[key].map(codecs[key].decode);
      }
      return values as Values<T>;
    },

    parse(search: string) {
      const params = parseSearch(keys, search) as Params<T>;
      return this.decode(params);
    },

    build(source: Values<T>) {
      const params = this.encode(source);
      return buildSearch(params);
    },
  };
}
