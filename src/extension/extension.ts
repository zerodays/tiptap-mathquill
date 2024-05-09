import {
  mergeAttributes,
  nodeInputRule,
  nodePasteRule,
  Node,
} from '@tiptap/core';
import {
  Direction,
  extractAttributesFromMatch,
  getRandomInt,
} from '../utils/utils';
import { HTMLAttributes } from 'react';
import EquationBlock, {
  MathFieldConfigWithoutHandlers,
} from '../components/equation-block/equation-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import {
  handleLatexCommand,
  handleSetMathBlock,
  moveCursorInsideMathBlock,
  symulateBackSpace,
} from './commands';
import { clipboardPlugin } from './prose-mirror-clipboard-plugin';
import {
  compileInputRegexForDelimiter,
  compilePasteRegexForDelimiter,
} from '../utils/regex';
import { handleSelectionUpdate } from './handlers';
import { MathField } from 'react-mathquill';

export const EXTENSION_NAME = 'TiptapMathquill';
export const MATH_BLOCK_TAG = 'math';
export const DEFAULT_DELIMITER = '$';

// TODO: describe what this file does
// TODO: handle $$ 1+1 $$ multiline expressions

// Declare the commands that this extension supports
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    TiptapMathquill: {
      setMathBlock: (callback?: () => void) => ReturnType;
      latexCommand: (latex: string) => ReturnType;
      moveCursorInsideMathBlock(direction: Direction): ReturnType;
      simulateBackSpace: () => ReturnType;
    };
  }
}

// Declare options for the extension
export interface TiptapMathquillProps {
  // Callback for whenever user enters any MathQuill field
  onMathBlockEnter?: () => void;
  // Callback for whenever user leaves any MathQuill field
  onMathBlockLeave?: () => void;
  // Callback for whenever enter is pressed
  onEnterPressed?: () => void;
  // Delimiter to be used for escaping Math expressions (default: '$', escapes like: $1+1$)
  delimiter?: string;
  // MathQuill config (without handlers)
  config?: MathFieldConfigWithoutHandlers;
  // Html attributes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: HTMLAttributes<HTMLSpanElement>;
}

const TiptapMathquill = Node.create<TiptapMathquillProps>({
  // Metadata for the extension
  name: EXTENSION_NAME,
  content: 'text*',
  group: 'inline', // TODO: maybe add block https://tiptap.dev/docs/editor/api/schema#group
  inline: true,
  // TODO: test selectable
  // TODO: whitespace

  // Mutable storage to save the previous caret position and MathQuill instances
  addStorage() {
    return {
      // caretPosition is used for determining the direction the caret is moving when the next move is detected
      caretPosition: 0,
      // mathInstances is a map of MathQuill instances, with the key being the id of the instance
      mathQuillInstances: new Map<number, MathField>(),
    };
  },

  /* Each math block has two atrributes:
    - latex: the latex expression it holds (and updates)
    - id: a unique identifier for the math block (used to destinguish between different math blocks)
  */
  addAttributes() {
    return {
      latex: {
        default: '',
      },
      id: {
        default: getRandomInt(),
      },
    };
  },

  // Tiptap should parse anything that matches this html tag
  parseHTML() {
    return [
      {
        tag: MATH_BLOCK_TAG,
      },
    ];
  },

  // HTML is rendered using the same tag
  renderHTML({ HTMLAttributes }) {
    return [
      MATH_BLOCK_TAG, // The HTML tag
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), // Merge our attributes and anything from html itself
    ];
  },

  // Rendering to text takes the delimiter and wraps the latex expression in it
  renderText({ node }) {
    return `${this.options.delimiter ?? DEFAULT_DELIMITER} ${
      node.attrs.latex
    } ${this.options.delimiter ?? DEFAULT_DELIMITER}`;
  },

  // When rendering in editor, use the MathQuill component
  addNodeView() {
    return ReactNodeViewRenderer(EquationBlock);
  },

  // Commands that this extension supports
  addCommands() {
    return {
      // Set (create) the math block
      // If any text is selected, it will be replaced with the math block with that latex content
      setMathBlock:
        (callback) =>
        ({ tr, state }) =>
          handleSetMathBlock({
            tr,
            state,
            callback,
            mathInstances: this.storage.mathQuillInstances,
          }),
      // Forward the latex command to the nearest MathQuill instance
      latexCommand:
        (latex) =>
        ({ state }) =>
          handleLatexCommand({
            state,
            latex,
            mathInstances: this.storage.mathQuillInstances,
          }),
      // Move the cursor inside the math block (move focus to the MathQuill instance)
      moveCursorInsideMathBlock:
        (direction) =>
        ({ state }) =>
          moveCursorInsideMathBlock({
            state,
            direction,
            mathInstances: this.storage.mathQuillInstances,
          }),
      // Simulate backspace
      simulateBackSpace:
        () =>
        ({ state }) =>
          symulateBackSpace({
            state,
            mathInstances: this.storage.mathQuillInstances,
          }),
    };
  },

  // Add a prse mirror plugin to handle clipboard serialization
  addProseMirrorPlugins() {
    return [
      clipboardPlugin(this.editor, this.options.delimiter ?? DEFAULT_DELIMITER),
    ];
  },

  // Add input rules to handle typing $ 1+1 $ and convert it to a math block (or using other custom delimiter)
  addInputRules() {
    return [
      nodeInputRule({
        find: compileInputRegexForDelimiter(
          this.options.delimiter ?? DEFAULT_DELIMITER,
        ),
        type: this.type,
        getAttributes: extractAttributesFromMatch,
      }),
    ];
  },

  // Add paste rules to handle pasting $ 1+1 $ and convert it to a math block (or using other custom delimiter)
  addPasteRules() {
    return [
      nodePasteRule({
        find: compilePasteRegexForDelimiter(
          this.options.delimiter ?? DEFAULT_DELIMITER,
        ),
        type: this.type,
        getAttributes: extractAttributesFromMatch,
      }),
    ];
  },

  // Whenever the selection is updated, check if we need to move focus inside the math block
  onSelectionUpdate() {
    handleSelectionUpdate(this.editor, this.storage);
  },
});

export default TiptapMathquill;
