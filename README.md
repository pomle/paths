# Paths

A JavaScript and TypeScript lib for handling type rich URLs in web apps.

## Usage

### Paths

Start by defining paths. Paths are usually created once in a single module, then imported for usage.

```ts
import { createPath, codecs } from '@pomle/paths';

const user = createPath('/user/:userId', {
  userId: codecs.string,
});

const userPost = user.append('/posts/:postId', {
  postId: codecs.number,
});

export const paths = {
  user,
  userPost,
};
```

Create URLs

```ts
import { paths } from './paths';

const url = paths.userPost.build({
  userId: 'pomle',
  postId: 24,
});

console.log(url); // Prints "/user/pomle/posts/24"
```

Parse path params from URLs

```ts
import { paths } from './paths';

const values = paths.userPost.parse('/user/pomle/posts/24');

console.log(values); // Prints {userId: "pomle", postId: 24}
```

Non-matching or under-matching returns null

```ts
import { paths } from './paths';

// Returns null
paths.userPost.parse('/not/user/posts');

// Returns null
paths.userPost.parse('/user/pomle');
```

Decode params already parsed

```ts
import { paths } from './paths';

const values = paths.userPost.decode({
  userId: 'pomle',
  postId: '24',
});

console.log(values); // Prints {userId: "pomle", postId: 24}
```

### Query

Define query params

```ts
import { createQuery, codecs } from '@pomle/paths';

const searchFilter = createQuery({
  username: codecs.string,
  range: codecs.number,
});
```

Parse query string from URL

```ts
// Location ?username=Pontus+Alexander&range=3&range=5

const values = searchFilter.parse(window.location.search);

console.log(values);
/*
{
  username: ["Pontus Alexander"],
  range: [3, 5]
}
*/
```

Update query string

```ts
// Location ?username=Pontus+Alexander&range=3&range=5

const qs = searchFilter.build({
  username: ['Pontus Alexander'],
  range: [3, 5],
});

console.log(qs);
// ?username=Pontus+Alexander&range=3&range=5
```

### Codecs

There are 4 codecs bundled

```ts
import { codecs } from '@pomle/paths';
```

#### `codecs.string`

Encodes strings safely

```ts
import { createQuery, codecs } from '@pomle/paths';

const searchOptions = createQuery({
  query: codecs.string,
});
```

#### `codecs.boolean`

Encodes true/false as "0" and "1"

```ts
import { createQuery, codecs } from '@pomle/paths';

const viewOptions = createQuery({
  showAll: codecs.boolean,
});
```

#### `codecs.number`

Encodes number safely

```ts
import { createQuery, codecs } from '@pomle/paths';

const searchOptions = createQuery({
  pageSize: codecs.number,
  pageNo: codecs.number,
});
```

#### `codecs.oneOf`

Ensures values are in a list of known values. If no match is found, first is returned.

```ts
import { createQuery, codecs } from '@pomle/paths';

const CAR_TYPES = ['sedan', 'hatchback', 'truck'] as const;

const carType = codecs.oneOf(CAR_TYPES);

const carOptions = createQuery({
  type: carType,
});
```

#### Creating custom codecs

Do not encode and decode with `encodeURIComponent` or `decodeURIComponent` manually. It will be handled by the library.

```ts
import { createPath, createCodec } from '@pomle/paths';
import { DateTime } from 'luxon';

const dateCodec = createCodec<DateTime>(
  (date) => {
    return date.toISO();
  },
  (text: string) => {
    return DateTime.fromISO(text);
  },
);

const bookings = createPath('/bookings/:dayOfArrival', {
  dayOfArrival: dateCodec,
});

const url = bookings.url({
  dayOfArrival: DateTime.now(),
});
```

## Codec Tips!

The `oneOf` codec can take enums.

```ts
enum State {
  Low,
  Medium,
  High,
}

const states = [State.Low, State.Medium, State.High] as const;
const intensity = codecs.oneOf(states);

const options = createQuery({
  strength: intensity,
});
```

The `oneOf` codec can take any object that implements `.toString`.

```ts
const MyTypeOne = {
  toString() {
    return 'one';
  },
};

const MyTypeTwo = {
  toString() {
    return 'two';
  },
};

const states = [MyTypeOne, MyTypeTwo] as const;
const state = codecs.oneOf(states);
```
