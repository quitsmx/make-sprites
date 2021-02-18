import { promises as fs } from 'fs'

type Prettier = typeof import('prettier')

/* eslint-disable no-empty, @typescript-eslint/no-require-imports */
const getPrettier = (p: string) => {
  try {
    return require(p) as Prettier
  } catch {}
  return null
}

/**
 * Try to format with prettier
 */
export const saveJsFile = async (code: string, opts: FullOptions) => {
  const outFile = opts.tsOutputPath
  let fname = 'prettierx'

  const prettier = getPrettier(fname) || getPrettier((fname = 'prettier'))
  if (prettier) {
    let options = await prettier.resolveConfig(outFile)

    options = options || {}

    if (fname === 'prettierx') {
      ;(options as Dict).alignObjectProperties = true
    }
    options.parser = outFile.endsWith('ts') ? 'babel-ts' : 'babel'

    code = prettier.format(code, options)
  }

  return fs.writeFile(outFile, code, 'utf8')
}
