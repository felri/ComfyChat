export const defaultEdgeOptions = {
  animated: false,
  type: "smoothstep",
};

export const initialNodes = [
  {
    id: "1",
    type: "apiKey",
    position: { x: -350, y: 275 },
  },
  // {
  //   id: "2",
  //   type: "systemMessageInput",
  //   data: { text: "You are a chatbot. You are talking to a human.", id: "2" },
  //   position: { x: 0, y: 250 },
  // },
  // {
  //   id: "3",
  //   type: "userInput",
  //   data: { text: "", id: "3", quantity: 1 },
  //   position: { x: -100, y: 600 },
  // },
];

export const initialEdges = [
  // {
  //   id: "e1-2",
  //   source: "1",
  //   target: "2",
  //   ...defaultEdgeOptions,
  // },
  // {
  //   id: "e2-3",
  //   source: "2",
  //   target: "3",
  //   ...defaultEdgeOptions,
  // },
];

export const initialLayouted = {
  nodes: [...initialNodes],
  edges: [...initialEdges],
};
