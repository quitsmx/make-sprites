/**
 * Camelize based on humps
 * humps is copyright © 2012+ Dom Christie
 * Released under the MIT license.
 */
export const camelize = (str: string) => {
  //
  str = str.replace(/[\s_-]+(.)?/g, (_, ch) => (ch ? ch.toUpperCase() : ''))

  // Ensure 1st char is always lowercase
  return str[0].toLowerCase() + str.substr(1)
}
