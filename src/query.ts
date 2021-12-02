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

export interface Query<Codec extends QueryCodec> {
  parse(search: string): Values<Codec>;
  build(source: Values<Codec>): string;
}

export function createQuery<T extends QueryCodec>(codecs: T): Query<T> {
  const keys = Object.keys(codecs);

  return {
    parse(search: string) {
      const source = parseSearch(keys, search);
      const drain: Record<string, unknown[]> = {};
      for (const key of keys) {
        drain[key] = source[key].map(codecs[key].decode);
      }
      return drain as Values<T>;
    },

    build(source: Values<T>) {
      const data: Record<string, string[]> = {};
      for (const key of keys) {
        data[key] = source[key].map(codecs[key].encode);
      }
      return buildSearch(data);
    },
  };
}
