import stringRandom from 'string-random'

export function generateName(pre?: string) {
  const systemPre = process.env.APPLICATION_NAME
  const preStr = pre ? `${pre}_` : ''

  if (systemPre) {
    return `${systemPre}_${preStr}${stringRandom(15, { numbers: false })}`
  }

  return `${preStr}${stringRandom(15, { numbers: false })}`
}
