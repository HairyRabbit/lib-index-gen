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
  hasIndex: boolean
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
  const obj = <Node>Object.create(null)
  obj.value = Object.create(null)
  obj.value.name = name
  obj.value.hasIndex = false
  obj.value.path = path
  obj.value.files = []
  obj.children = []
  return obj
}

function scanChild(filePath: string): Node {
  const list = fs.readdirSync(filePath, { withFileTypes: true })
  const fileBaseName = path.basename(filePath)
  return list.reduce((acc, dirent) => {
    const name = dirent.name

    const nodePath = path.resolve(filePath, name)
    
    if(dirent.isDirectory()) {
      acc.children.push(scanChild(nodePath))
    } else if(dirent.isFile() && /\.tsx?$/.test(path.extname(dirent.name))) {
      if(dirent.name.startsWith('index')) acc.value.hasIndex = true
      acc.value.files.push({ name, path: nodePath })
    }

    return acc
  }, makeInitialNode(fileBaseName, filePath))
}

