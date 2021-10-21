export type ParamCodec<SourceType> = {
  encode: (source: SourceType) => string;
  decode: (param: string) => SourceType;
};

export type PathCodec = {
  [key: string]: ParamCodec<any>;
};

type Params<Source extends {}> = {
  [key in keyof Source]: string;
};

type InputParams<CodecType extends PathCodec> = {
  [Prop in keyof CodecType]: Parameters<CodecType[Prop]['encode']>[0];
};

type OutputParams<CodecType extends PathCodec> = {
  [Prop in keyof CodecType]: ReturnType<CodecType[Prop]['decode']>;
};

export interface Path<PathCodecType extends PathCodec> {
  path: string;
  codec: PathCodecType;
  url(params: InputParams<PathCodecType>): string;
  encode(params: InputParams<PathCodecType>): Params<PathCodecType>;
  decode(params: Params<PathCodecType>): OutputParams<PathCodecType>;
  append<AdditionalPathCodecType extends PathCodec>(
    pathName: string,
    codec: AdditionalPathCodecType,
  ): Path<PathCodecType & AdditionalPathCodecType>;
}

export function createPath<PathCodecType extends PathCodec>(
  pathName: string,
  codec: PathCodecType,
): Path<PathCodecType> {
  return {
    path: pathName,
    codec,

    encode(params) {
      const encoded: any = {};
      for (const key of Object.keys(params)) {
        encoded[key] = codec[key].encode(params[key]);
      }
      return encoded;
    },

    decode(params) {
      const decoded: any = {};
      for (const key of Object.keys(params)) {
        decoded[key] = codec[key].decode(params[key]);
      }
      return decoded;
    },

    url(params) {
      const encoded = this.encode(params);
      return Object.entries(encoded).reduce((pathName, [key, value]) => {
        return pathName.replace(':' + key, value);
      }, pathName);
    },

    append<AdditionalPathCodecType extends PathCodec>(
      pathName: string,
      addCodec: AdditionalPathCodecType,
    ) {
      return createPath(this.path + pathName, { ...codec, ...addCodec });
    },
  };
}
