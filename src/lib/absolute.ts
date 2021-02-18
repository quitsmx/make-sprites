import path from 'path'

const normalizeSep = (s: string) => (s ? s.replace(/\\+/g, '/') : '')

export const absolute = (...p: string[]) => path.resolve(...p.map(normalizeSep))
