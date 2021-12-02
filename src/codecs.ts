import { createCodec } from './codec';

export const string = createCodec(
  (value: string) => value,
  (text: string) => text,
);

export const number = createCodec(
  (value: number) => value.toString(),
  (text: string) => parseFloat(text),
);

export const boolean = createCodec(
  (value: boolean) => (value ? '1' : '0'),
  (text: string) => text === '1',
);
