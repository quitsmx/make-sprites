/**
 * Helper para ordenar cadenas de forma ascendente con `Array.prototype.sort`
 * ignorando las diferencias entre minúsculas y mayúsculas.
 */
export const sortStrIcase = (a: string, b: string) =>
  a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
