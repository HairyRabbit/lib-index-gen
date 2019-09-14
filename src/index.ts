import fs from 'fs'
import path from 'path'
import scan from './scan'
import gen from './generate'

interface Options {
  dryrun?: boolean
}

export default function render(entry: string, options: Options = {}) {
  const {
    dryrun = false
  } = options
  const node = scan(entry)
  const result = gen(node)
  for (const [name, content] of result) {
    if(dryrun) {
      console.log('')
      console.log(`[[-------- ${name} --------`)
      console.log(content)
      console.log(`---------- ${name} --------]]`)
      console.log('')
    } else {
      const filePath = path.resolve(entry, name)
      if(fs.existsSync(filePath)) {
        throw new Error(`File already exists ${filePath}`)
      }
      
      fs.writeFileSync(filePath, content, 'utf-8')
    }
  }
}
