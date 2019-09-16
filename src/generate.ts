import { Project } from 'ts-morph'
import path from 'path'
import { Node } from './scan'

const project = new Project({
  // tsConfigFilePath: path.resolve('./tsconfig.json'),
  skipFileDependencyResolution: true,
  addFilesFromTsConfig: false,
  // compilerOptions: {
  //   outDir: output,
  //   module: ts.ModuleKind.CommonJS
  // }
})


export default function generate(node: Node): Map<string, string> {
  const nameTable: Map<string, string[]> = new Map
  assertNameConflict()
  return gen(node)

  function gen(node: Node, result: Map<string, string> = new Map, thunk?: (() => void)): typeof result {
    const { value, children } = node
    const { name: dirName, path: filePath, files, hasIndex } = value
    const acc: string[] = []

    if(0 !== children.length) {
      children.forEach(child => {
        gen(child, result, () => acc.push(`export * from './${child.value.name}'`))
      })
    }

    if(hasIndex) {
      console.debug(`${filePath} already has index file, skipped`)
      return result
    }

    files.forEach(({ name, path: filePath }) => {
      const fileName = path.basename(name, path.extname(name))
      const sourceFile = project.addExistingSourceFile(filePath)
      const exportedDeclarations = sourceFile.getExportedDeclarations()
      const exportNames: string[] = []

      exportedDeclarations.forEach((nodes, key) => {
        const name: string = `default` === key ? `default as ${fileName}` : key
        const node = nodes[0]
        
        if(!node) console.debug(nodes, fileName)
        const leadingCommentRanges = node.getLeadingCommentRanges()
        if(0 !== leadingCommentRanges.length) {
          const text = leadingCommentRanges[0].getText()
          if(/@noexport/.test(text)) return
        }

        const names = nameTable.get(name) || []
        nameTable.set(name, names.concat(`${dirName}.${fileName}`))

        exportNames.push(name)
        return
      })
      project.removeSourceFile(sourceFile)
      acc.push(`export { ${exportNames.join(', ')} } from './${fileName}'`)
    })

    const indexFileName: string = `index.ts`
    const indexFilePath: string = path.resolve(filePath, indexFileName)

    if(acc.length === 0) return result
    thunk && thunk()
    result.set(indexFilePath, acc.join('\n'))
    return result
  }

  function assertNameConflict(): void {
    let acc: boolean = true
    for (const [name, files] of nameTable) {
      if(files.length <= 1) continue
      acc = false
      console.log(`gen`, `index`, `"${name}" are both exports by ${files.join(', ')}`)
    }

    if(false === acc) throw new Error(`Exported name conflict`)
  }
}

