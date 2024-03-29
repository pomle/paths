export function createParser<Key extends string | number | symbol>(
  components: string[],
  keys: Key[],
) {
  const positions = {} as Record<Key, number>;

  for (const key of keys) {
    const placeholder = `:${String(key)}`;

    const pos = components.indexOf(placeholder);
    if (pos === -1) {
      throw new Error(`Param ${placeholder} not in path name`);
    }

    positions[key] = pos;
  }

  return {
    matchPath(parts: string[]) {
      const diff = parts.length - components.length;

      if (diff < 0) {
        return diff;
      }

      for (const [index, word] of components.entries()) {
        if (word[0] !== ':' && word !== parts[index]) {
          return index - components.length;
        }
      }

      return diff;
    },

    parsePath(parts: string[]) {
      const values = {} as Record<Key, string>;
      for (const key of keys) {
        const index = positions[key];
        values[key] = parts[index];
      }
      return values;
    },
  };
}
