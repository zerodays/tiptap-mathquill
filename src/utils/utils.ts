import { EditorState } from 'prosemirror-state';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { MathField } from 'react-mathquill';
import { EXTENSION_NAME } from '../extension/extension';

// Used to generate a random id for each MathQuill instance
export function getRandomInt() {
  return Math.floor(Math.random() * 100000);
}

// MathQuill direction enum rewriten here because react-mathquill doesn't export it
export enum Direction {
  left = -1,
  right = 1,
}

// Helper to find the nearest MathQuill instance to the current position of the caret
export const findNearestMathQuillBlockInstance = (
  state: EditorState,
  mathInstances: Map<number, MathField>,
) => {
  // Get position of caret
  const { from } = state.selection;

  let nearestMathBlock = null;
  let minDistance = Infinity;

  // Recursively go over the tree and determine, which eqBlock is nearest to the caret
  state.doc.descendants((node, pos) => {
    if (node.type.name === EXTENSION_NAME) {
      const distance = Math.abs(from - pos);
      if (distance < minDistance) {
        minDistance = distance;
        nearestMathBlock = node;
      }
    }
  });

  // If no nearest eqBlock was found, return false
  if (!nearestMathBlock) {
    return null;
  }

  // Find the math field instance
  return mathInstances.get((nearestMathBlock as ProsemirrorNode).attrs.id);
};

export const extractAttributesFromMatch = (match: RegExpMatchArray) => {
  return {
    id: getRandomInt(),
    latex: match[2],
  };
};

export const waitForMathQuillInstance = async (
  mathInstances: Map<number, MathField>,
  id: number,
) => {
  return new Promise<MathField | undefined>((resolve) => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      // Try to get the instance
      const instance = mathInstances.get(id);

      if (instance) {
        // The instance was found, resolve with the instance
        clearInterval(interval);
        resolve(instance);
      } else if (Date.now() - startTime > 1000) {
        // The timeout was reached, resolve with undefined
        clearInterval(interval);
        resolve(undefined);
      }
    }, 10);
  });
};
