// width in vw, height in vh
export const COLLAPSED_GUESS_MAP_SIZE = { width: 24, height: 28 }

const getGuessMapSize = (size: number) => {
  const SIZES = [
    { width: 30, height: 38 },
    { width: 40, height: 52 },
    { width: 50, height: 65 },
    { width: 65, height: 80 },
  ]

  return SIZES[size - 1]
}

export default getGuessMapSize
