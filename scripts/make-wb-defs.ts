/// <reference path="../src/types.d.ts" />
/*
  Genera las definiciones de los iconos del conjunto "Web Icons" a partir
  de los archivos de sprites del paquete "web-icons" (devDependency).
*/
import { promises as fs } from 'fs'
import path from 'path'

import parser from 'fast-xml-parser'

import 'jsonc-require'

import { getSrcPath, sortStrIcase, stringify } from '../src/lib'
import { dataPath, rootPath } from '../src/paths'

type WebIconDef = {
  xmlns: 'http://www.w3.org/2000/svg'
  width: number
  height: number
  viewBox: string
  style?: string
  path: {
    class?: string
    d: string
    id: string
  }
}

type IconDefEx = [string, number, number, string]

const parserOpts = {
  attributeNamePrefix: '',
  ignoreAttributes: false,
  parseAttributeValue: true,
} as const

/** Constantes */
const styleStr1 = '<style>.st0{fill-rule:evenodd;clip-rule:evenodd}</style>'
const styleStr2 = '<style>.st0{clip-rule:evenodd;fill-rule:evenodd}</style>'
const attrStr1 = 'fill-rule="evenodd"'
const attrStr2 = 'clip-rule="evenodd"'

const isArray = Array.isArray
const isDict = (x: any): x is DictStr => x && typeof x === 'object' && !isArray(x)

const getWbPath = () => {
  const srcPath = getSrcPath('web-icons')
  return srcPath && path.join(srcPath, 'src', 'svg')
}

const cleanXml = (xml: string) =>
  xml.includes(attrStr1) && xml.includes(attrStr2)
    ? xml.replace(attrStr1, '').replace(attrStr2, '')
    : xml
      .replace(/<style>.*<\/style>/s, m => m.replace(/\s+/g, ''))
      .replace(styleStr1, '')
      .replace(styleStr2, '')
      .replace('class="st0"', '')

/**
 * Trunca un número, si el módulo es mayor que 0.3 al siguiente.
 */
const roundNum = (n: number) => (n % 1 > 0.1 ? ~~n + 1 : ~~n)

/**
 * Obtiene el ID en base al nombre de archivo.
 */
const idFromPath = (fpath: string) => path.basename(fpath).replace(/\.svg$/, '')

/** Para errores */
const emptyDef: IconDefEx = ['', 0, 0, '']

/**
 * Todos los web-icons se esperan con un viewPort de "0 0 64 64", con una clase
 * "s0" o attributos fijados a `fill-rule:evenodd` y `clip-rule:evenodd`.
 * El `d` de "path" pude contener un "id", pero ningún otro atributo.
 */
// eslint-disable-next-line complexity
const readSVG = async (fpath: string): Promise<IconDefEx> => {
  const fname = 'web-icon/' + path.basename(fpath)

  const tmp = await fs.readFile(fpath, 'utf8')
  const src = cleanXml(tmp)

  const svg: WebIconDef = parser.parse(src, parserOpts, true).svg

  if (!isDict(svg) || svg.xmlns !== 'http://www.w3.org/2000/svg') {
    console.dir(src, { colors: true, depth: 5 })
    throw new Error(`Elemento 'svg' no válido en WebIcon ${fname}`)
  }

  if (svg.style) {
    console.dir(src, { colors: true, depth: 5 })
    console.warn(`${fname} contiene estilos extraños ignorados.`)
    return emptyDef
  }

  if (svg.width !== 64) svg.width = roundNum(svg.width)
  if (svg.height !== 64) svg.height = roundNum(svg.height)

  const { path: pt } = svg
  if (!pt) {
    console.dir(src, { colors: true, depth: 5 })
    console.warn(`${fname} se ignora porque no contiene un tag 'path'`)
    return emptyDef
  }

  const { d, id = idFromPath(fpath), ...rest } = pt

  if (!pt.id) {
    console.warn(`${fname} no contiene un 'id', se asume "${id}"`)
  }
  if (!d) {
    console.dir(src, { colors: true, depth: 5 })
    console.warn(`${fname} se ignora porque no contiene un 'path.d'.`)
    return emptyDef
  }

  if (Object.keys(rest).length) {
    const s = JSON.stringify(rest)
    console.warn(`${fname} contiene attributos ignorados en path: ${s}`)
  }

  return [d, svg.width, svg.height, id]
}

/**
 * Lee y guarda las definiciones de los iconos de web-icons.
 */
export const makeWbDefs = async () => {
  const srcPath = getWbPath()
  if (!srcPath) {
    console.error('Cannot read the WebIcons sources.')
    process.exitCode = 1
    return
  }

  try {
    const files = await fs.readdir(srcPath, 'utf8')

    const svgs = files
      .filter(f => f.endsWith('.svg'))
      .map(f => path.join(srcPath, f))
      .map(readSVG)

    const temp = await Promise.all(svgs)
    const defs: Dict<IconDef> = {}

    temp.sort((a, b) => sortStrIcase(a[3], b[3]))
    temp
      .filter(e => !!e[0])
      .forEach(def => {
        const id = def.pop() as string
        defs[id] = def as any
      })

    const outFile = path.join(dataPath, 'wb-defs.json')
    await fs.writeFile(outFile, stringify(defs), 'utf8')

    console.log('Archivo json creado:', path.relative(rootPath, outFile))
    //
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }
}
