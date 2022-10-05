export function createParser<Key extends string | number | symbol>(
  pathName: string,
  keys: Key[],
) {
  const components = pathName.split('/');
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
    matchPath(pathName: string) {
      const parts = pathName.split('/');
      if (parts.length < components.length) {
        return false;
      }
      return components.every((word, index) => {
        return word[0] === ':' || word === parts[index];
      });
    },

    parsePath(pathName: string) {
      const parts = pathName.split('/');
      const values = {} as Record<Key, string>;
      for (const key of keys) {
        const index = positions[key];
        values[key] = parts[index];
      }
      return values;
    },
  };
}
