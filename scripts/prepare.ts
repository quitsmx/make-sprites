import { makeFaDefs } from './make-fa-defs'
import { makeWbDefs } from './make-wb-defs'

const goDef = async () => {
  await Promise.all([makeFaDefs(), makeWbDefs()])
}

goDef()
