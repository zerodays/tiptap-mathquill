import { Editor } from '@tiptap/core';
import { Direction } from '../utils/utils';
import { MathField } from 'react-mathquill';

// Whenever cursor (selection) moves, update the caret position and focus the math instance if needed
export const handleSelectionUpdate = (
  editor: Editor,
  storage: Record<string, any>,
) => {
  // Determine the direction caret is moving from its previous position
  const currentPosition = editor.state.selection.from;
  const prevPosition = storage.caretPosition;
  const direction =
    currentPosition > prevPosition ? Direction.right : Direction.left;

  // Update the stored caret position
  storage.caretPosition = currentPosition;

  // Determine which node is focused
  const { from } = editor.state.selection;
  const resolvedPos = editor.state.doc.resolve(from);
  const focusedNode = resolvedPos.node();

  // If a math instance is focused, set focus and update the caret position
  if (focusedNode.type.name === 'mathBlock') {
    // Get the actual math field instance
    const mathInstances: Map<number, MathField> = storage.mathQuillInstances;
    const mathInstance = mathInstances.get(focusedNode.attrs.id);

    // Focus the right instance, blur the rest
    Array.from(mathInstances.entries()).forEach(([id, mf]) => {
      if (id !== focusedNode.attrs.id) {
        mf.blur();
      } else {
        mf.focus();
      }
    });

    // Set caret position inside that math instance
    if (direction === Direction.right) {
      mathInstance?.moveToLeftEnd();
    } else {
      mathInstance?.moveToRightEnd();
    }
  }
};
