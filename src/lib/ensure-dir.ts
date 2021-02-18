import fs from 'fs'
import path from 'path'

const getErrStr = (err: Dict, dir: string) =>
  err.code === 'ENOTDIR' ? `Some in ${dir} is not a directory.` : err.message || `=${err}`

/**
 * Se asegura que un directorio exista.
 */
export const ensureDir = (dir: string) => {
  const fdir = path.normalize(path.resolve(dir))
  const name = path.relative('.', fdir)
  let errStr = ''

  try {
    const stat = fs.statSync(fdir)

    if (!stat.isDirectory()) {
      errStr = `${dir} exist as a file.`
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        fs.mkdirSync(fdir, { recursive: true })
      } catch (err_) {
        errStr = getErrStr(err_, name)
      }
    } else {
      errStr = getErrStr(err, name)
    }
  }

  errStr && console.error(errStr)
  return !errStr
}
