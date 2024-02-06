import operationVisitor from './operation.js';
import expressionVisitor from './expression.js';

export default async (node, context) => {
  const newNode = ['AND', 'OR'].includes(node.operator)
    ? await operationVisitor(node, context)
    : await expressionVisitor(node, context);

  if (node.parentheses) {
    newNode.group = true;
  }

  return newNode;
};
