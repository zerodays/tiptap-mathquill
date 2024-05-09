import React from 'react';
import { Editor, NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import VirtualSpace from './virtual-space';
import { Direction } from '../../utils/utils';
import MathQuillField from '../math-field/math-field';
import { MathField, MathFieldConfig } from 'react-mathquill';
import {
  DEFAULT_DELIMITER,
  TiptapMathquillProps,
} from '../../extension/extension';

export type MathFieldConfigWithoutHandlers = Omit<MathFieldConfig, 'handlers'>;

// Handles the transfer of caret between the MathQuill field and Tiptap
function onMoveOutOf(
  direction: number,
  position: number,
  editor: Editor,
  mathField: MathField | undefined,
) {
  if (!mathField) {
    return;
  }

  const newPosition = position + (direction === Direction.left ? -1 : 3);
  const contentSize = editor.state.doc.content.size;

  if (newPosition <= 0) {
    // If the equation is the first node, let's add some text in front of it so that
    // the caret can move there.
    editor
      .chain()
      .insertContentAt(1, { type: 'text', text: ' ' })
      .focus()
      .setTextSelection(newPosition)
      .run();
  } else if (newPosition >= contentSize - 1) {
    // If the equation is the last node, let's add some text at the end of it so that
    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size - 1, {
        type: 'text',
        text: ' ',
      })
      .focus()
      .setTextSelection(newPosition)
      .run();
  } else {
    // All is good, just move the caret
    editor.chain().focus().setTextSelection(newPosition).run();
  }

  // Move the focus out of the MathQuill field
  mathField.blur();
}

// Handler for deleting the present MathQuill field
function onDeleteOutOf(
  position: number,
  editor: Editor,
  extensionOptions: TiptapMathquillProps,
  deleteNode: () => void,
) {
  // Focus the editor and delete the node
  editor.chain().focus().setTextSelection(position).run();

  // Call the on mathBlock leave callback if provided
  extensionOptions.onMathBlockLeave?.();

  // Delete the node
  deleteNode();
}

function onChange(
  mathField: MathField | undefined,
  updateAttributes: NodeViewProps['updateAttributes'],
) {
  if (!mathField) {
    return;
  }

  // Update the attributes of the node
  // TODO: comment why microtask
  queueMicrotask(() => {
    updateAttributes({
      latex: mathField.latex(),
    });
  });
}

// Handles pasting into the MathQuill field
function onPaste(
  e: React.ClipboardEvent<HTMLSpanElement>,
  mathField: MathField | undefined,
  delimiter: string,
) {
  if (!mathField) {
    return;
  }

  // Read the content from clipboard
  let content = e.clipboardData.getData('text/plain');

  // If the content is escaped with the specified delimiter, remove it
  if (
    content.trim().startsWith(delimiter) &&
    content.trim().endsWith(delimiter)
  ) {
    content = content.trim().slice(1, -1);
  }

  // Type the new content in the MathQuill field
  mathField.write(content);

  // Prevent the default paste event
  e.preventDefault();
}

function onCopy(
  e: React.ClipboardEvent<HTMLSpanElement>,
  mathField: MathField | undefined,
  delimiter: string,
) {
  if (!mathField) {
    return;
  }

  // The controller is not exposed in the MathField instance, but we need to access it here to get the current text selection
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cursor = mathField.__controller.cursor;
  if (!cursor || !cursor.selection) {
    return;
  }

  // Join together all the selected text
  const text = cursor.selection.join('latex');
  const escapedText = `${delimiter}${text}${delimiter}`;

  // Set the data to be copied
  e.clipboardData.setData('text/plain', escapedText);

  // Prevent the default copy event
  e.preventDefault();
}

const EquationBlock = ({
  editor,
  node,
  getPos,
  extension,
  updateAttributes,
  deleteNode,
}: NodeViewProps) => {
  // Unpack the attributes needed
  const instanceId = node.attrs.id;
  const latex = node.attrs.latex;
  const delimiter = extension.options.delimiter ?? DEFAULT_DELIMITER;

  const setMathQuillInstance = (mathField: MathField | undefined) => {
    extension.storage.mathQuillInstances.set(instanceId, mathField);
  };

  return (
    <NodeViewWrapper
      key={instanceId}
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        alignItems: 'center',
        overflowX: 'auto',
        verticalAlign: 'middle',
        // TODO: make sure styles can be passed here
      }}>
      {/* A clickable space in front of the math field for user to
           click on and exit the MathQuill field. */}
      <VirtualSpace
        onClick={() =>
          onMoveOutOf(
            Direction.left,
            getPos(),
            editor,
            extension.storage.mathQuillInstances.get(instanceId),
          )
        }
      />
      {/* Configured MathQuill field */}
      <MathQuillField
        latex={latex}
        id={`mathquill-field-${instanceId}`}
        key={`mathquill-field-${instanceId}`}
        // All the event handlers for HTML events
        onPaste={(e) =>
          onPaste(
            e,
            extension.storage.mathQuillInstances.get(instanceId),
            delimiter,
          )
        }
        onCopy={(e) =>
          onCopy(
            e,
            extension.storage.mathQuillInstances.get(instanceId),
            delimiter,
          )
        }
        onChange={() =>
          onChange(
            extension.storage.mathQuillInstances.get(instanceId),
            updateAttributes,
          )
        }
        mathquillDidMount={(mathField) => {
          // Register the new MathQuill instance
          setMathQuillInstance(mathField);
        }}
        onFocus={extension.options.onMathQuilFieldFocus}
        onBlur={extension.options.onMathQuilFieldBlur}
        // Config from the extension and custom handlers
        config={{
          ...(extension.options
            .mathQuillConfig as MathFieldConfigWithoutHandlers),
          // Custom handlers for MathQuill
          handlers: {
            moveOutOf: (direction, mathField) =>
              onMoveOutOf(direction, getPos(), editor, mathField),
            upOutOf: (mathField) =>
              onMoveOutOf(Direction.left, getPos(), editor, mathField),
            downOutOf: (mathField) =>
              onMoveOutOf(Direction.right, getPos(), editor, mathField),
            deleteOutOf: () =>
              onDeleteOutOf(getPos(), editor, extension.options, deleteNode),
            enter: (mathField) => extension.options.onEnterPressed?.(mathField),
          },
        }}
      />
      <VirtualSpace
        onClick={() =>
          onMoveOutOf(
            Direction.right,
            getPos(),
            editor,
            extension.storage.mathQuillInstances.get(instanceId),
          )
        }
      />
    </NodeViewWrapper>
  );
};

export default EquationBlock;
