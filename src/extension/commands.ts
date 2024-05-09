import { Transaction, EditorState } from 'prosemirror-state';
import {
  Direction,
  getRandomInt,
  findNearestMathQuillBlockInstance,
  waitForMathQuillInstance,
} from '../utils/utils';
import { MathField } from 'react-mathquill';

// Creates a new math block inside the editor
export function handleSetMathBlock({
  tr,
  state,
  callback,
  mathInstances,
}: {
  tr: Transaction;
  state: EditorState;
  callback: (() => void) | undefined;
  mathInstances: Map<number, MathField>;
}) {
  // If there is some text selected, setting the math block will
  // replace the selection with the math block containing that text
  const { from, to } = state.selection;
  const equationContent = state.doc.textBetween(from, to, '');

  // Create new node
  const node = state.schema.nodes.TiptapMathquill.create({
    id: getRandomInt(),
    latex: equationContent.toString(),
  });

  // Replace selection with new node
  tr.replaceSelectionWith(node);

  // Create a space before and after the node
  tr.insertText(' ', tr.selection.from - 2);
  tr.insertText(' ', tr.selection.to);

  // Focus the math field in the new node (must be called by parent, see the docs)
  return (async () => {
    // Wait until the math instance registers in the store
    const mathInstance = await waitForMathQuillInstance(
      mathInstances,
      node.attrs.id,
    );

    // Math instance should be present
    if (!mathInstance) {
      throw new Error('Math instance not found');
    }

    // Focus the math instance
    mathInstance?.focus();

    // Call callback if present
    if (callback) {
      callback();
    }
    // Match the Tiptap return type, even though it isn't actually right
  }) as unknown as boolean;
}

// Forwards a latex command to the MathQuill instance
// Docs for MathQuill the method are available athttps://docs.mathquill.com/en/latest/Api_Methods/#latexlatex_string
// Accepts latex commands defined here: https://fourferries.com/wp-content/uploads/2016/10/Mathquill_commands.pdf
export function handleLatexCommand({
  latex,
  state,
  mathInstances,
}: {
  latex: string;
  state: EditorState;
  mathInstances: Map<number, MathField>;
}) {
  // Determine which mathBlock is nearest to the caret
  const mathInstance = findNearestMathQuillBlockInstance(state, mathInstances);

  if (!mathInstance) {
    return false;
  }

  // Focus the field
  mathInstance?.focus();

  // Return the function that will actually set the latex
  // TODO: try to move this to microtask
  return (() => {
    mathInstance?.cmd(latex);
    // Match the Tiptap return type, even though it isn't actually right
  }) as unknown as boolean;
}

// Find the nearest MathQuill instance to the caret and focuses it, removing focus from the editor
export function moveCursorInsideMathBlock({
  direction,
  state,
  mathInstances,
}: {
  direction: Direction;
  state: EditorState;
  mathInstances: Map<number, MathField>;
}) {
  // Determine which mathBlock is nearest to the caret
  const mathInstance = findNearestMathQuillBlockInstance(state, mathInstances);

  if (!mathInstance) {
    return false;
  }

  // Return the function to move the cursor
  // TODO: try to move this to microtask
  return (() => {
    mathInstance?.keystroke(direction === Direction.left ? 'Left' : 'Right');
  }) as unknown as boolean;
}

export function symulateBackSpace({
  state,
  mathInstances,
}: {
  state: EditorState;
  mathInstances: Map<number, MathField>;
}) {
  // Determine which mathBlock is nearest to the caret
  const mathInstance = findNearestMathQuillBlockInstance(state, mathInstances);

  if (!mathInstance) {
    return false;
  }

  return (() => {
    mathInstance?.keystroke('Backspace');
  }) as unknown as boolean;
}
