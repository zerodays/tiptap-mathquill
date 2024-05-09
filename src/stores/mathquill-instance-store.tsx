// import { MathField } from 'react-mathquill';
// import { create } from 'zustand';

// /*
// This file holds a zustand store, used for holding intances of
// MathQuill fields and the current caret position.
// */

// export type MathQuillInstanceStoreState = {
//   // caretPosition is used for determining the direction the caret is moving when the next move is detected
//   caretPosition: number;
//   // mathInstances is a map of MathQuill instances, with the key being the id of the instance
//   mathQuillInstances: Map<number, MathField>;
// };

// type MathQuillInstanceStoreActions = {
//   // Sets the caret position
//   setCaretPosition: (position: number) => void;
//   // Sets a MathQuill instance
//   setMathQuillInstance: (id: number, instance: MathField) => void;
// };

// const useMathInstanceStore = create<
//   MathQuillInstanceStoreState & MathQuillInstanceStoreActions
// >((set) => ({
//   mathQuillInstances: new Map(),
//   caretPosition: 0,
//   setMathQuillInstance: (id, instance) => {
//     set((state) => ({
//       mathQuillInstances: new Map(state.mathQuillInstances).set(id, instance),
//     }));
//   },
//   setCaretPosition: (position) => {
//     set(() => ({
//       caretPosition: position,
//     }));
//   },
// }));

/*
waitForMathQuillInstance polls for a MathQuill instance with the
given id in an interval of 10ms, and resolves the promise.
If the instance is not found within 1 second, the promise is
resolved with undefined.
*/
// const waitForMathQuillInstance = async (id: number) => {
//   return new Promise<MathField | undefined>((resolve) => {
//     const startTime = Date.now();

//     const interval = setInterval(() => {
//       // Try to get the instance
//       const instance = useMathInstanceStore
//         .getState()
//         .mathQuillInstances.get(id);

//       if (instance) {
//         // The instance was found, resolve with the instance
//         clearInterval(interval);
//         resolve(instance);
//       } else if (Date.now() - startTime > 1000) {
//         // The timeout was reached, resolve with undefined
//         clearInterval(interval);
//         resolve(undefined);
//       }
//     }, 10);
//   });
// };

// export { waitForMathQuillInstance };
