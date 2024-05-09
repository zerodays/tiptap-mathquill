import { getTextBetween, getTextSerializersFromSchema } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Editor } from '@tiptap/core';

const PLUGIN_NAME = 'tiptapMathQuillCipboardTextSerializer';

// This plugin takes care of serializing the content of the editor to the clipboard
// It wraps latex expressions in the specified delimiter
export const clipboardPlugin = (editor: Editor, delimiter: string) =>
  new Plugin({
    key: new PluginKey(PLUGIN_NAME),
    props: {
      clipboardTextSerializer: () => {
        const { state, schema } = editor;
        const { doc, selection } = state;
        const { ranges } = selection;

        // Get the range of the selection
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        // Retrieve existing text serializers
        const textSerializers = getTextSerializersFromSchema(schema);
        const range = { from, to };

        // Add our custom serializer for math blocks, otherwise use the existing ones
        const text = getTextBetween(doc, range, {
          textSerializers: {
            mathBlock: (node) => {
              // Wrap the latex expression in the specified delimiter
              return ` ${delimiter} ${node.node.attrs.latex} ${delimiter} `;
            },
            ...textSerializers,
          },
        });
        return text;
      },
    },
  });
