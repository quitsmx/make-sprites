/* eslint-disable @typescript-eslint/no-require-imports */

import { promises as fs } from 'fs'
import path from 'path'

import 'jsonc-require'

import { createSprites } from './create-sprites'
import { absolute } from './lib'
import { dataPath, rootPath } from './paths'

import type { IconIds, MakeSpritesOptions } from '..'

const readIDs = () => {
  const jsonPath = path.join(rootPath, 'icons.json')
  return require(jsonPath) as IconIds
}

const readText = async (file: string) => fs.readFile(absolute(dataPath, file), 'utf8')

/*
  Genera las definiciones de los iconos de FontAwesome a partir de los
  archivos de sprites de la devDependency @fortawesome/fontawesome-free

  Se selecciona el conjunto de datos de los iconos determinados en icons.json
  en el directorio raiz del repo.

  Con los datos se crea un archivo de sprites y un archiv TypeScript donde
  se define el objeto que describe los IDs sprites del archivo generado.
*/
export const makeSprites = async (options: MakeSpritesOptions = {}) => {
  //
  const [svgTemplate, tsTemplate] = await Promise.all([
    options.svgTemplate || readText('svg.template'),
    options.tsTemplate || readText('ts.template'),
  ])

  const opts: FullOptions = {
    iconIDs: options.iconIDs || readIDs(),
    extraDefs: options.extraDefs || {},
    extraId: options.extraId || 'ext',
    svgOutputPath: absolute(options.svgOutputPath || 'sprites.svg'),
    tsOutputPath: absolute(options.tsOutputPath || 'sprites.ts'),
    svgTemplate,
    tsTemplate,
  }

  createSprites(opts)
}
