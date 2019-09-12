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
      console.log(name, content)
    } else {
      fs.writeFileSync(path.resolve(entry, name), content, 'utf-8')
    }
  }
}
