/* eslint-disable node/no-process-exit, unicorn/no-process-exit */

import path from 'path'

/**
 * Devuelve la ruta absoluta a un archivo en "node_modules"
 */
// eslint-disable-next-line consistent-return
export const getSrcPath = (fname: string, quit = false) => {
  try {
    const p = path.join(fname, 'package.json')
    return path.dirname(require.resolve(p))
  } catch (err) {
    if (!quit) {
      console.error(`Error ubicando "${fname}": ${err.message}`)
    }
  }
  return ''
}
