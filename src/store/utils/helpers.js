import { defaultEdgeOptions } from "./constants";

export function deleteOneNode(nodes, edges, nodeId) {
  // Find the parent of the node
  const parentEdge = edges.find((edge) => edge.target === nodeId);
  const parentId = parentEdge ? parentEdge.source : null;

  // If there is no parent, just remove the current node
  if (!parentId) {
    return {
      nodes: nodes.filter((node) => node.id !== nodeId),
      edges: edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    };
  } else {
    // Find the children of the node
    const childrenEdges = edges.filter((edge) => edge.source === nodeId);
    const childrenIds = childrenEdges.map((edge) => edge.target);

    // Remove the current node and its edges
    const newNodes = nodes.filter((node) => node.id !== nodeId);
    const newEdges = edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    // Connect each child to the parent of the deleted node, if a parent exists
    if (parentId) {
      childrenIds.forEach((childId) => {
        newEdges.push({
          id: `e${parentId}-${childId}`,
          source: parentId,
          target: childId,
          ...defaultEdgeOptions,
        });
      });
    }

    return {
      nodes: newNodes,
      edges: newEdges,
    };
  }
}

export function getStoredStoreIds() {
  const storeIds = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("store-")) {
      const id = key.substring(6); // Extract ID part of the key
      storeIds.push(id);
    }
  }

  // Sort the storeIds based on the Unix timestamp
  storeIds.sort((a, b) => {
    const timestampA = parseInt(a.split("-")[0], 10); // Extract and parse timestamp from ID
    const timestampB = parseInt(b.split("-")[0], 10);
    return timestampB - timestampA;
  });

  return storeIds;
}

export function getMessageHistory(id, nodes, edges) {
  console.log("getMessageHistory", nodes, edges);
  const history = [];

  let currentNodeId = id;
  let systemMessage = null;

  while (currentNodeId !== null) {
    const currentNode = nodes.find((node) => node.id === currentNodeId);

    if (currentNode) {
      if (currentNode.type === "systemMessage" && currentNode.data?.text) {
        // If system message is found, store its content.
        systemMessage = currentNode.data.text;
      } else if (currentNode.data?.text) {
        // Prepend user or assistant messages to the history array.
        history.unshift({
          role: currentNode.type.toLowerCase().includes("output")
            ? "assistant"
            : "user",
          content: currentNode.data.text,
        });
      }
    }

    // Find the edge that points to the current node.
    const currentEdge = edges.find((edge) => edge.target === currentNodeId);
    // Update the currentNodeId to be the source of the current edge (to move to the previous node).
    currentNodeId = currentEdge ? currentEdge.source : null;
  }

  // Prepend the system message to the history array if it exists.
  if (systemMessage) {
    history.unshift({
      role: "system",
      content: systemMessage,
    });
  }

  return history;
}

export function calculateNewNodePosition(nodes, edges, parentId, parentHeight) {
  const horizontalOffset = 900; // Horizontal offset for each child
  const verticalSpacing = 150; // Vertical spacing from the parent node

  // Find the parent node
  let parentNode = nodes.find((node) => node.id === parentId);
  if (!parentNode) {
    throw new Error("Parent node not found");
  }

  // Count the number of child nodes for the given parent
  const childCount = edges.filter((edge) => edge.source === parentId).length;

  // Calculate the x position based on the number of child nodes
  const newXPosition = childCount * horizontalOffset + parentNode.position.x;

  // Calculate the y position based on the parent node's position and height
  // Add some additional spacing to avoid overlapping with the parent node
  const newYPosition = parentNode.position.y + parentHeight + verticalSpacing;

  return {
    x: newXPosition,
    y: newYPosition,
  };
}

export function createNewNode(
  nodes,
  edges,
  parentId,
  parentHeight,
  type = "chatOutput",
  data = {}
) {
  const newNodePosition = calculateNewNodePosition(
    nodes,
    edges,
    parentId,
    parentHeight
  );

  const newNodeId = `${parseInt(nodes[nodes.length - 1].id) + 1}`;
  const newNode = {
    id: newNodeId,
    type,
    data: { text: "", id: newNodeId, ...data },
    position: newNodePosition,
  };

  const newEdge = {
    id: `e${parentId}-${newNodeId}`,
    source: parentId,
    target: newNodeId,
    ...defaultEdgeOptions,
  };

  return {
    nodes: [...nodes, newNode],
    edges: [...edges, newEdge],
  };
}

export const generateStoreId = () => {
  const timestamp = Date.now(); // Unix timestamp in milliseconds
  const randomString = Math.random().toString(36).substring(2, 6); // Short random string for added uniqueness
  return `${timestamp}-${randomString}`;
};
