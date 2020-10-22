console.log("Starting...");
const broadcastMessages = (messages, publish) => {
  messages.forEach((message) =>
    setTimeout(() => publish(message), Math.random() * 10)
  );
};

function* channel(expectedOrder, republish) {
  const buffer = [];
  let current = 0;
  let message;
  while (current < expectedOrder.length) {
    let bufferIndex = buffer.length - 1;
    while (bufferIndex >= 0) {
      if (buffer[bufferIndex] === expectedOrder[current]) {
        const nextMessage = buffer.splice(bufferIndex, 1);
        republish(nextMessage.pop());
        current++;
        bufferIndex = bufferIndex.length - 1;
      } else {
        bufferIndex--;
      }
    }
    buffer.push(yield);
    // console.log(buffer);
  }
}

const display = (message) => console.log(message);
const createPublisher = (channel) => (message) => channel.next(message);
const messages = ["A", "B", "C", "D", "E"];
const chan = channel(messages, display);

broadcastMessages(messages, createPublisher(chan));
