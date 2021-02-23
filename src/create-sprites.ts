/*
  Genera project://public/sprites.svg y project://src/support/sprites.ts con
  datos leídos de las definiciones en jsons la carpeta "data", seleccionando
  el subconjunto determinado en project://icons.json
*/
import { promises as fs } from 'fs'
import path from 'path'

import { getDateStr, sortStrIcase, stringify } from './lib'
import { saveJsFile } from './save-js-file'

/**
 * El objeto usado para mapear los IDs resultantes
 */
type SizeMap = Dict<[number, number]>

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Carga las definiciones para un determinado conjunto.
 */
const getDefsFor = (prefix: string) =>
  require(`../data/${prefix}-defs.json`) as Dict<IconDef>

/**
 * Devuelve un objeto con la información leída de project://src/icons.json
 * El objeto tiene 3 propiedades...
 *
 * - `idMap`:
 *    Cada llave es el nombre de un grupo un grupo, su valor es un `DictStr`
 *    donde las llaves son los nombres definidos por el usuario (icons.json)
 *    y los valores son los id de los `<symbols>` ya con el prefijo de grupo.
 *    NOTE que puede existir más de un nombre para un mismo id, no afecta.
 *
 * - `sizes`:
 *    Las llaves son los nombres de los grupos, los valores son array de 3
 *    elementos que contienen datos para crear la información de la relación
 *    de tamaño del icono en project://src/support/sprites.ts
 *    El elemento 0 es nombre definido por el usuario (icons.json), y los
 *    otros dos son el ancho y alto del viewPort.
 *
 * - `symbols`:
 *    El markup SVG de cada uno de los símbolos que componen sprites.svg
 *    (cada uno en una línea).
 *
 * @param idsToMake grupos con los IDs de los iconos a incluir
 */
const getSymbols = (idsToMake: IconIds, opts: FullOptions) => {
  const idMap: IconIds = Object.create(null)
  const sizes: SizeMap = {}
  const symbols: string[] = []
  const extra = opts.extraId

  for (const [group, rawIds] of Object.entries(idsToMake)) {
    //
    const defs = group === extra ? opts.extraDefs : getDefsFor(group)

    /**
     * Guarda las traslaciones de nombres a IDs.
     * Cada ID aquí es el original del icono prefijado por el nombre del grupo.
     */
    const equ: DictStr = Object.create(null)
    idMap[group] = equ
    Object.keys(rawIds) // camelCased names
      .sort(sortStrIcase)
      .forEach(name => {
        let id = rawIds[name]

        if (!defs[id]) {
          console.error(`Cannot found definition for icon '${id}' of '${group}'.`)
          return
        }

        const [d, w, h] = defs[id]
        const _path = d[0] === '<' ? d : `<path d="${d}"/>`

        id = `${group}-${id}`
        sizes[id] = [w, h]
        equ[name] = id

        symbols.push(`<symbol id="${id}" viewBox="0 0 ${w} ${h}">${_path}</symbol>`)
      })
  }

  return { idMap, sizes, symbols }
}

/**
 * Crea el SVG con los símbolos de los iconos, ordenados por su `id`.
 */
const createSpritesFile = async (symbols: string[], opts: FullOptions) => {
  //
  const content = opts.svgTemplate
    .replace('{{date}}', getDateStr())
    .replace('{{symbols}}', symbols.join('\n'))

  return fs.writeFile(opts.svgOutputPath, content, 'utf8')
}

/**
 * Crea las definiciones para el objeto que contiene las traslaciones
 * de nombre a ID del icono.
 *
 * Los nombres son las llaves y todo se pone a nivel raíz en el objeto,
 * por lo que se verifica que no haya nombres ni IDs duplicados.
 */
const flatNameIds = (idMap: IconIds) => {
  //
  const names: string[] = []
  const dups: string[] = []
  const items: string[] = []

  for (const [group, block] of Object.entries(idMap)) {
    items.push(`// ${group}`) // comment as group header

    for (const [name, id] of Object.entries(block)) {
      if (names.includes(name)) {
        dups.push(name)
      } else {
        names.push(name)
        items.push(`  ${name}: '${id}',`)
      }
    }
  }

  if (dups.length) {
    console.error(`Iconos con nombre duplicado:\n${dups.join('\n')}`)
  }

  return items.join('\n')
}

/**
 * Obtiene los ratios de las dimensiones de los iconos.
 */
const getRatios = (sizes: SizeMap) => {
  const out: DictStr = Object.create(null)

  Object.keys(sizes).forEach(key => {
    const [w, h] = sizes[key]
    const ratio = Math.ceil((w / h) * 16)

    if (ratio < 2 || ratio > 20) {
      throw new Error(`Relación alto/ancho de "${key}" es errónea: ${ratio}`)
    }
    if (ratio !== 16) {
      out[key] = `${ratio}`
    }
  })

  return out
}

/**
 * Crea las definiciones
 */
const createDefinesFile = async (idMap: IconIds, sizes: SizeMap, opts: FullOptions) => {
  //
  const content = opts.tsTemplate
    .replace('{{date}}', getDateStr())
    .replace('{{mapKeys}}', flatNameIds(idMap))
    .replace('{{ratios}}', stringify(getRatios(sizes)))
    .replace('{{svgName}}', path.basename(opts.svgOutputPath))

  return saveJsFile(content, opts)
}

/**
 * Main
 */
export const createSprites = async (opts: FullOptions) => {
  try {
    const { idMap, sizes, symbols } = getSymbols(opts.iconIDs, opts)

    await Promise.all([
      createSpritesFile(symbols, opts),
      createDefinesFile(idMap, sizes, opts),
    ])
    //
  } catch (err) {
    console.error(`${err}`)
    process.exitCode = 1
  }
}
