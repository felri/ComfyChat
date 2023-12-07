export const defaultEdgeOptions = {
  animated: false,
  type: "smoothstep",
};

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

export function createInputBelowOutputNode(nodes, edges, parentId, parentHeight) {
  const parentNode = nodes.find((node) => node.id === parentId);
  if (!parentNode) {
    throw new Error("Parent node not found");
  }

  const numberOfChildren = edges.filter((edge) => edge.source === parentId);
  const height = parentHeight || 560;

  const newNodePosition = {
    x: parentNode.position.x + 800 * numberOfChildren.length,
    y: parentNode.position.y + height + 25,
  };

  const newNodeId = `${parseInt(nodes[nodes.length - 1].id) + 1}`;
  const newNode = {
    id: newNodeId,
    type: "userInput",
    data: { text: "", id: newNodeId },
    position: newNodePosition,
  };

  const newEdge = {
    id: `e${parentId}-${newNodeId}`,
    source: parentId,
    target: newNodeId,
    ...defaultEdgeOptions
  };

  return {
    nodes: [...nodes, newNode],
    edges: [...edges, newEdge],
  };
}


export function getMessageHistory(id, systemMessage, nodes, edges) {
  console.log("getMessageHistory", nodes, edges);
  const history = [];

  let currentNodeId = id;
  while (currentNodeId !== null) {
    const currentNode = nodes.find((node) => node.id === currentNodeId);
    if (currentNode && currentNode.data?.text) {
      // Prepend system messages and user input to the history array.
      history.unshift({
        role: currentNode.type === "userInput" ? "user" : "assistant",
        content: currentNode.data.text,
      });
    }
    // Find the edge that points to the current node.
    const currentEdge = edges.find((edge) => edge.target === currentNodeId);
    // Update the currentNodeId to be the source of the current edge (to move to the previous node).
    currentNodeId = currentEdge ? currentEdge.source : null;
  }

  // Prepend the initial system message to the history array.
  history.unshift({
    role: "assistant",
    content: systemMessage,
  });

  return history;
}

export function calculateNewNodePosition(nodes, edges, parentId, parentHeight) {
  const horizontalOffset = 800; // Horizontal offset for each child
  const verticalSpacing = 150; // Vertical spacing from the parent node

  // Find the parent node
  const parentNode = nodes.find((node) => node.id === parentId);
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

export function createNewOutputNode(
  nodes,
  edges,
  parentId,
  parentHeight,
  type = "chatOutput"
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
    data: { text: "", id: newNodeId },
    position: newNodePosition,
  };

  const newEdge = {
    id: `e${parentId}-${newNodeId}`,
    source: parentId,
    target: newNodeId,
    ...defaultEdgeOptions
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
