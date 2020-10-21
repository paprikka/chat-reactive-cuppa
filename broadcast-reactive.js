const { of, empty } = require("rxjs");
const {
  distinct,
  filter,
  mergeScan,
  map,
  tap,
  catchError,
} = require("rxjs/operators");

const broadcastEventsInOrder = (whitelist, eventSource) => {
  const whitelistUnique = new Set(whitelist);

  return eventSource.pipe(
    distinct(),
    filter((event) => whitelistUnique.has(event)),
    mergeScan(
      ({ rest }, currentEvent) => {
        const currentEventIndex = rest.findIndex(
          (whitelistItem) => whitelistItem == currentEvent
        );

        if (currentEventIndex === -1) return empty();

        return of({
          rest: rest.slice(currentEventIndex),
          event: currentEvent,
        });
      },
      { rest: whitelist, currentEvent: null }
    ),
    catchError((err) => {
      console.error(err);
    }),
    map(({ event }) => event)
  );
};

module.exports = { broadcastEventsInOrder };
