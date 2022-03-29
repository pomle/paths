export function createParser<Key extends string | number | symbol>(
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

  return {
    matchPath(pathName: string) {
      const parts = pathName.split('/');

      const matches = components.filter((word, index) => {
        return word[0] === ':' || word === parts[index];
      });

      if (matches.length < components.length) {
        return matches.length - components.length;
      }

      return parts.length - components.length;
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
