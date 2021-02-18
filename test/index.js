// @ts-check
const { makeSprites } = require('..')

/** @type {*} */
const extraDefs = require('./kn-defs.json')

makeSprites({
  extraDefs,
  extraId: 'kn',
  svgOutputPath: '~test-sprites.svg',
  tsOutputPath: '~test-sprites.ts',
})
