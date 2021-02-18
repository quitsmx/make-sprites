/**
 * Devuelve cadena con la fecha/hora UTC en formato "YYYY-MM-DD @ hh:mm"
 */
export const getDateStr = () =>
  `${new Date().toJSON().slice(0, 16).replace('T', ' @ ')} UTC`
