import fs from 'fs'
import path from 'path'

/**
 * Esta debe ser la ruta del directorio raiz del repositorio.
 *
 * Si el directorio repositorio no es el actual (cwd) se termina
 * el proceso con una excepción.
 */
export const rootPath = path.resolve('.')

if (!fs.existsSync(path.join(rootPath, 'package.json'))) {
  throw new Error('Debes estar en el directorio raiz de tu proyecto.')
}

// require.resolve trabaja en el directorio de este archivo
export const dataPath = path.dirname(require.resolve('../data'))
