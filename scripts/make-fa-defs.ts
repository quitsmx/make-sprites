/// <reference path="../src/types.d.ts" />
/*
  Genera las definiciones de los iconos de FontAwesome a partir de los
  archivos de sprites de la devDependency @fortawesome/fontawesome-free
*/
import { promises as fs } from 'fs'
import path from 'path'

import parser from 'fast-xml-parser'

import 'jsonc-require'

import { getSrcPath, stringify } from '../src/lib'
import { dataPath, rootPath } from '../src/paths'

/**
 * Definición de los elementos a leer de los archivo fuente SVG
 */
type IconSrcItem = {
  id: string
  viewBox: string
  path: {
    d: string
  }
  [k: string]: DictStr | string
}

const isArray = Array.isArray
const isDict = (x: any): x is DictStr => x && typeof x === 'object' && !isArray(x)

const parserOpts = {
  attributeNamePrefix: '',
  ignoreAttributes: false,
  parseAttributeValue: true,
} as const

/**
 * Extrae las definiciones de los iconos: 'id', 'viewBox' y 'path.d'
 */
const parseSymbols = (symbols: IconSrcItem[]) => {
  const result: Dict<IconDef> = {}

  symbols.forEach((item, ix) => {
    const { id, viewBox, path: pt } = item

    if (!id) {
      console.error(`El elemento ${ix + 1} no tiene un ID válido.`)
      return
    }

    const vb = viewBox?.split(' ')
    if (!isArray(vb) || vb.length !== 4) {
      console.error(`viewBox de svg '${id}' incorrecto: "${vb}"`)
      return
    }

    const d = pt?.d
    if (!d || typeof d !== 'string') {
      console.error(`El atributo 'path.d' del icono '${id}' no es válido.`)
      return
    }

    result[id] = [d, parseFloat(vb[2]), parseFloat(vb[3])]
  })

  return result
}

/**
 * Extrae las definiciones de un archivo SVG con sprites.
 */
const extractDefs = async (fpath: string): Promise<Dict<IconDef>> => {
  //
  const fname = path.relative('.', fpath)

  try {
    const xml = await fs.readFile(fpath, 'utf8')
    const svg = parser.parse(xml, parserOpts, true).svg

    if (!isDict(svg)) {
      throw new Error(`Cannot find a 'svg' tag in ${fname}`)
    }

    if (isArray(svg.symbol) && svg.symbol.length) {
      return parseSymbols(svg.symbol)
    }

    throw new Error(`Cannot find symbols in ${fname}`)
    //
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }

  return {}
}

/**
 * Devuelve la ruta absoluta a los archivos de sprites de FontAwesome
 * @returns {string}
 */
// eslint-disable-next-line consistent-return
const getFaPath = () => {
  const p = getSrcPath('@fortawesome/fontawesome-free')
  return p ? path.join(p, 'sprites') : ''
}

/**
 * Crea las definiciones para los sprites de FontAwesome
 */
export const makeFaDefs = async () => {
  const srcPath = getFaPath()
  if (!srcPath) {
    process.exitCode = 1
    return
  }

  const srcSprites = [
    ['fab', path.join(srcPath, 'brands.svg')],
    ['far', path.join(srcPath, 'regular.svg')],
    ['fas', path.join(srcPath, 'solid.svg')],
  ]

  try {
    await srcSprites.map(async ([prefix, fpath]) => {
      const defs = await extractDefs(fpath)

      const outFile = path.join(dataPath, `${prefix}-defs.json`)
      await fs.writeFile(outFile, stringify(defs), 'utf8')

      console.log('Archivo json creado:', path.relative(rootPath, outFile))
    })
  } catch (err) {
    console.error(`${err}`)
    process.exitCode = 1
  }
}
