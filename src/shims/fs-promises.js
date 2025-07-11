// Stub for `import "fs/promises"` in browser builds.
export async function readFile() {
  throw new Error("fs.promises.readFile is not available in the browser.")
}
export async function writeFile() {
  throw new Error("fs.promises.writeFile is not available in the browser.")
}
export default {}
