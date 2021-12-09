# Paths

A JavaScript and TypeScript lib for handling type rich URLs in web apps.

## Usage

### Paths

Define paths

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

Create custom codecs. Do not encode and decode with `encodeURIComponent` or `decodeURIComponent` manually. It will be handled by the library.

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
