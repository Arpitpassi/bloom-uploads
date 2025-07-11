// Minimal shim for the Node 'fs' module used only for tree-shaking time.
// Any runtime call will throw so you notice unexpected server-side code.
export const constants = {}
export function readFile() {
  throw new Error("fs.readFile is not available in the browser.")
}
export default {}
