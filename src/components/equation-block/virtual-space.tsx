import React from 'react';
import { HtmlHTMLAttributes } from 'react';

/*
The VirtualSpace component is placed on the left and right of the
equation block. It acts as a virtual space between the equation block
and the text and allows the user to exit the equation block even when
there is no text on the left or right of the equation block.
*/

// TODO: make sure that the props can be passed to it

const VirtualSpace = ({
  style,
  ...rest
}: HtmlHTMLAttributes<HTMLDivElement>): JSX.Element => {
  return (
    <div
      style={{
        display: 'inline-block',
        height: '1.5rem',
        width: '0.375rem',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  );
};

export default VirtualSpace;
