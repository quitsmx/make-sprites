import { existsSync, promises as fs } from 'fs'
import path from 'path'

import { dataPath } from '../paths'
import { stringify } from './stringify'

export const nodeStorage = (function () {
  //
  const jsonPath = path.join(dataPath, 'node-storage.json')
  const writeOpts = { encoding: 'utf8' } as const

  const _data = Object.create(null)

  if (existsSync(jsonPath)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Object.assign(_data, require(jsonPath))
  }

  /**
   * Manejador minúsculo de error.
   */
  const handleError = <T extends Error>(err: T) => {
    console.error(`
    Error en node-storage ----------------------------------
    ${err}
    --------------------------------------------------------
    `)
    return false
  }

  /**
   * Guarda los datos en el almacén permanente.
   *
   * WARNING: Si hay más de una instancia, se darán problemas pues c/una
   *          contiene su copia de los datos que sobrescribirá la de otros.
   */
  const saveJson = async () =>
    fs.writeFile(jsonPath, stringify(_data), writeOpts).catch(handleError)

  return {
    /**
     * Devuelve el objeto completo
     */
    get: () => _data,

    /**
     * Establece el valor de una propiedad.
     * @param {string} name nombre de la propiedad
     * @param {*} value el valor a establecer (tipos aceptados por JSON)
     */
    set: (name: string, value: any) => {
      _data[name] = value
      saveJson()
    },

    /**
     * Remueve una propiedad.
     * @param {string} name nombre de la propiedad a remover
     */
    remove: (name: string) => {
      if (name in _data) {
        delete _data[name]
        saveJson()
      }
    },

    /**
     * Remueve todas las propiedades.
     */
    clear: () => {
      Object.keys(_data).forEach(k => {
        delete _data[k]
      })
      saveJson()
    },
  }
})()
