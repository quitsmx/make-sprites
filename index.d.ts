type Dict<T = any> = Record<string, T>
type DictStr = Record<string, string>

/**
 * La definición de un icono de makeSprites es un array con 3 elementos:
 *
 * 0. El `d` del elemento `path` o el markup completo si no es un solo path\*
 * 1. Propiedad `width`, lo mismo que para `viewBox` del `symbol` contenedor.
 * 2. Propiedad `height`, igual que el anterior.
 *
 * NOTE: Se asume que es el markup completo cuando la cadena empieza por `<`.
 *
 * @example
 * ```json
 *  {
 *   "alert": ["M28, M34...z", 64, 64],
 *   "other": ["<path d=\"M28, M34...z\">", 64, 64]
 *  }
 * ```
 */
export type IconDef = [string, number, number]

/**
 * Formato del objeto con las equivalencias de los iconos requeridos.
 * Leído por omisión del icons.json en la raiz del repo.
 */
export type IconIds = Dict<DictStr>

/**
 * User's options.
 */
export type MakeSpritesOptions = {
  /**
   * Groups with icon `{iconName:ID}`
   * @default {}
   */
  iconIDs?: IconIds
  /**
   * Group for additional icon definitions
   * @default "ext"
   */
  extraId?: string
  /**
   * Additional icon definitions (for `extraDefs` group)
   * @default {}
   */
  extraDefs?: Dict<IconDef>
  /**
   * The name of the sprite SVG file, relative to cwd.
   * @default "./sprites.svg"
   */
  svgOutputPath?: string
  /**
   * Definitions filename, relative to cwd.
   * @default "./sprites.svg"
   */
  tsOutputPath?: string
  /**
   * The sprite SVG template filename, relative to cwd.
   * @default "./sprites.svg"
   */
  svgTemplate?: string
  /**
   * Definitions template filename, relative to cwd.
   * @default "./sprites.svg"
   */
  tsTemplate?: string
}

declare function makeSprites (options?: MakeSpritesOptions): void
export { makeSprites }
