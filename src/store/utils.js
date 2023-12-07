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
          animated: false,
          type: "smoothstep",
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
    animated: false,
    type: "smoothstep",
  };

  return {
    nodes: [...nodes, newNode],
    edges: [...edges, newEdge],
  };
}
