import fs from 'fs'
import path from 'path'

interface Options {
  test?: string | RegExp,
  includes?: string[],
  excludes?: string[]
}

interface NodeValue {
  name: string
  path: string
  files: { name: string, path: string }[]
}

export interface Node {
  value: NodeValue,
  children: Node[]
}

export default function scan(entry: string, _options: Options = {}): Node {
  const root = path.resolve(entry)
  assertRootDir(root)
  return scanChild(root)
}

function assertRootDir(root: string): void {
  const stat = fs.statSync(root)
  if(!stat.isDirectory()) throw makeRootNotDirectoryError()
}

function makeRootNotDirectoryError(): Error {
  return new Error(`The project root not directory`)
}

function makeInitialNode(name: string, path: string): Node {
  const obj = Object.create(null)
  obj.value = {}
  obj.value.name = name
  obj.value.path = path
  obj.value.files = []
  obj.children = []
  return obj as Node
}

function scanChild(filePath: string): Node {
  const list: fs.Dirent[] = fs.readdirSync(filePath, { withFileTypes: true })
  const fileBaseName: string = path.basename(filePath)
  return list.reduce((acc, dirent) => {
    const name: string = dirent.name
    // if(`index.ts` === name) acc.isIndexFileExists = true

    const nodePath: string = path.resolve(filePath, name)
    
    if(dirent.isDirectory()) {
      acc.children.push(scanChild(nodePath))
    } else if(dirent.isFile()) {
      acc.value.files.push({ name, path: nodePath })
    }

    return acc
  }, makeInitialNode(fileBaseName, filePath))
}

