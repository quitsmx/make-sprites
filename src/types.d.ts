type Dict<T = any> = Record<string, T>
type DictStr = Record<string, string>

/**
 * Formato del objeto con las equivalencias de los iconos requeridos.
 * Leído por omisión del icons.json en la raiz del repo.
 */
type IconIds = Dict<DictStr>

/**
 * Definición de icono: ['markup',width,height]
 */
type IconDef = import('..').IconDef

/**
 * Elimina el `optional` de las propiedades de un objeto.
 */
type FullOptions = Required<import('..').MakeSpritesOptions>
