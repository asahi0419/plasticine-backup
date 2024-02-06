import visitAndProcessNode from './index.js';

export default async (node, context) => {
  return {
    type: 'operation',
    operator: node.operator.toLowerCase(),
    left: await visitAndProcessNode(node.left, context),
    right: await visitAndProcessNode(node.right, context),
  };
};
