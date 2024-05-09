import React from 'react';
import {
  addStyles,
  EditableMathField,
  EditableMathFieldProps,
} from 'react-mathquill';

// Add the styles necessary for MathQuill to render
addStyles();

// Expose the MathField component and pass the props
const MathQuillField = (props: EditableMathFieldProps) => {
  return <EditableMathField {...props} />;
};

export default MathQuillField;
