const rx = require("rxjs");
const { toArray } = require("rxjs/operators");
const { broadcastEventsInOrder } = require("./broadcast-reactive");

it("should handle all passed events", async () => {
  const order = ["a", "b", "c"];
  const eventSource = new rx.Subject();

  const messagesToPublish = broadcastEventsInOrder(order, eventSource);

  const publishedMessages = [];

  const sub = messagesToPublish.subscribe((message) => {
    publishedMessages.push(message);
  });

  eventSource.next("a");
  eventSource.next("b");
  eventSource.next("c");

  expect(publishedMessages).toEqual(["a", "b", "c"]);

  sub.unsubscribe();
});

it("should ignore duplicates", async () => {
  const order = ["a", "b", "c"];
  const eventSource = new rx.Subject();

  const messagesToPublish = broadcastEventsInOrder(order, eventSource);

  const publishedMessages = [];

  messagesToPublish.subscribe((message) => {
    publishedMessages.push(message);
  });

  eventSource.next("a");
  eventSource.next("b");
  eventSource.next("b");
  eventSource.next("b");
  eventSource.next("c");
  eventSource.next("c");
  eventSource.complete();

  expect(publishedMessages).toEqual(["a", "b", "c"]);
});

it("should include only the whitelisted events", async () => {
  const order = ["a", "b", "c"];
  const eventSource = new rx.Subject();

  const messagesToPublish = broadcastEventsInOrder(order, eventSource);

  const publishedMessages = [];

  messagesToPublish.subscribe((message) => {
    publishedMessages.push(message);
  });

  eventSource.next("a");
  eventSource.next("b");
  eventSource.next("b");
  eventSource.next("b");
  eventSource.next("x");
  eventSource.next(null);
  eventSource.next("c");
  eventSource.next("c");
  eventSource.complete();

  expect(publishedMessages).toEqual(["a", "b", "c"]);
});

it("should preserve the whitelist order", async () => {
  const whitelist = ["a", "b", "c", "d"];
  const eventSource = new rx.Subject();

  const messagesToPublish = broadcastEventsInOrder(whitelist, eventSource);

  const publishedMessages = [];

  messagesToPublish.subscribe((message) => {
    publishedMessages.push(message);
  });

  eventSource.next("a");
  eventSource.next("b");
  eventSource.next("b");
  eventSource.next("d");
  eventSource.next("b");
  eventSource.next("c");
  eventSource.next("c");
  eventSource.next("d");
  eventSource.next("a");
  eventSource.complete();

  expect(publishedMessages).toEqual(["a", "b", "d"]);
});

it("should support generators", async () => {
  function* gen() {
    const items = ["a", "b", "xxxx", "b", "d", "b", "c", "c", "d", "a"];
    while (items.length) {
      yield items.shift();
    }
  }

  const order = ["a", "b", "c"];
  const iterator = gen();
  const eventSource = rx.from(iterator);

  const messagesToPublish = broadcastEventsInOrder(order, eventSource);

  const publishedMessages = await messagesToPublish.pipe(toArray()).toPromise();

  expect(publishedMessages).toEqual(["a", "b", "c"]);
});
