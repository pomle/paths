import { createCodec } from './codec';

export const string = createCodec(encodeURIComponent, decodeURIComponent);

export const number = createCodec(
  (value: number) => encodeURIComponent(value.toString()),
  (text: string) => parseFloat(decodeURIComponent(text)),
);

export const boolean = createCodec(
  (value: boolean) => (value ? '1' : '0'),
  (text: string) => text === '1',
);
