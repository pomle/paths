# Paths

A TS lib for handling type rich URLs in web apps.

## Usage

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

const url = paths.userPost.url({
  userId: 'pomle',
  postId: 24,
});

console.log(url); // Prints "/user/pomle/posts/24"
```

Parse params from URLs

```ts
import { paths } from './paths';

const values = paths.userPost.decode({
  userId: 'pomle',
  postId: '24',
});

console.log(values); // Prints {userId: "pomle", postId: 24}
```

Create custom codecs

```ts
import { createPath, createCodec } from '@pomle/paths';
import { DateTime } from 'luxon';

const dateCodec = createCodec<DateTime>(
  (date) => {
    return encodeURIComponent(date.toISO());
  },
  (text: string) => {
    return DateTime.fromISO(decodeURIComponent(text));
  },
);

const bookings = createPath('/bookings/:dayOfArrival', {
  dayOfArrival: dateCodec,
});

const url = bookings.url({
  dayOfArrival: DateTime.now(),
});
```
