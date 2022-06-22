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

There are 3 codecs bundled

```ts
import { createQuery, codecs } from '@pomle/paths';

codecs.boolean; // Encodes true and false as 1 and 0
codecs.string; // Encodes strings safely for URLs
codecs.number; // Encodes numbers safely for URLs
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

Create a one-of-guard to ensure a value is in a set of acceptable values.
```ts
function oneOf<T extends unknown>(values: T[]) {
  return function ensureOneOf(value: unknown): T {
    if (!values.includes(value as T)) {
      throw new Error(`Value not one of ${values.join(', ')}`);
    }
    return value as T;
  };
}
```

Mapping string union to params via codec.
```ts
import { createCodec } from '@pomle/paths';
import { oneOf } from "./one-of";

type DoorState = 'open' | 'closed';
const DOOR_STATES: DoorState[] = ['open', 'closed'];

// String unions and URL values are always strings - no conversion of value needed.
const doorCodec = createCodec<DoorState>(
  (source: DoorState) => source.toString(),
  oneOf(DOOR_STATES),
);
```

Mapping string union or enums to params via codec.
```ts
import { createCodec } from '@pomle/paths';
import { oneOf } from "./one-of";

enum MessageStatus {
  Sent,
  Received,
  Read,
}

const MESSAGE_STATUSES = [
  MessageStatus.Sent,
  MessageStatus.Received,
  MessageStatus.Read,
];

const ensureMessageStatus = oneOf(MESSAGE_STATUSES);

// Enums are numbers by default - convert URL value to number and then check.
const messageStatusCodec = createCodec<MessageStatus>(
  (source: MessageStatus) => source.toString(),
  (source: string) => {
    const number = parseFloat(source);
    return ensureMessageStatus(number);
  },
);
```
