import { Codec } from './codec';

export type PathCodec = Record<string, Codec<any>>;

type Params<Source extends Record<string, unknown>> = {
  [key in keyof Source]: string;
};

type InputParams<Codec extends PathCodec> = {
  [key in keyof Codec]: Parameters<Codec[key]['encode']>[0];
};

type OutputParams<Codec extends PathCodec> = {
  [key in keyof Codec]: ReturnType<Codec[key]['decode']>;
};

function createParser<Key extends string | number | symbol>(
  pathName: string,
  keys: Key[],
) {
  const components = pathName.split('/');
  const positions = {} as Record<Key, number>;

  for (const key of keys) {
    const placeholder = `:${key}`;

    const pos = components.indexOf(placeholder);
    if (pos === -1) {
      throw new Error(`Param ${placeholder} not in path name`);
    }

    positions[key] = pos;
  }

  return function parsePath(pathName: string) {
    const components = pathName.split('/');
    const values = {} as Record<Key, string>;
    for (const key of keys) {
      const index = positions[key];
      values[key] = components[index];
    }
    return values;
  };
}

export interface Path<Codec extends PathCodec> {
  path: string;
  codec: Codec;
  url(params: InputParams<Codec>): string;
  build(params: InputParams<Codec>): string;
  parse(path: string): OutputParams<Codec>;
  encode(params: InputParams<Codec>): Params<Codec>;
  decode(params: Params<Codec>): OutputParams<Codec>;
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

  const parsePath = createParser<keyof Codec>(pathName, keys);

  return {
    path: pathName,
    codec,

    encode(params) {
      const encoded: any = {};
      for (const key of keys) {
        encoded[key] = encodeURIComponent(codec[key].encode(params[key]));
      }
      return encoded;
    },

    decode(params) {
      const decoded: any = {};
      for (const key of keys) {
        decoded[key] = codec[key].decode(decodeURIComponent(params[key]));
      }
      return decoded;
    },

    parse(path) {
      const params = parsePath(path);
      return this.decode(params);
    },

    build(params) {
      const encoded = this.encode(params);
      return Object.entries(encoded).reduce((pathName, [key, value]) => {
        return pathName.replace(':' + key, value);
      }, pathName);
    },

    url(params) {
      return this.build(params);
    },

    append<AdditionalCodec extends PathCodec>(
      pathName: string,
      addCodec: AdditionalCodec,
    ) {
      return createPath(this.path + pathName, { ...codec, ...addCodec });
    },
  };
}
