import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateGuessMapSize } from '@redux/slices'
import { getGuessMapSize } from '@utils/helpers'
import { COLLAPSED_GUESS_MAP_SIZE } from '@utils/helpers/getGuessMapSize'

const useGuessMap = () => {
  const [mapHeight, setMapHeight] = useState(COLLAPSED_GUESS_MAP_SIZE.height) // height in vh
  const [mapWidth, setMapWidth] = useState(COLLAPSED_GUESS_MAP_SIZE.width) // width in vw
  const [hovering, setHovering] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const hoverDelay = useRef<any>()

  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()

  const handleMapHover = () => {
    clearTimeout(hoverDelay.current)
    setHovering(true)

    const { width, height } = getGuessMapSize(user.guessMapSize as number)
    setMapHeight(height)
    setMapWidth(width)
  }

  const handleMapLeave = () => {
    if (isPinned) return

    hoverDelay.current = setTimeout(() => {
      setHovering(false)
      setMapHeight(COLLAPSED_GUESS_MAP_SIZE.height)
      setMapWidth(COLLAPSED_GUESS_MAP_SIZE.width)
    }, 1500)
  }

  const changeMapSize = (change: 'increase' | 'decrease') => {
    let newMapSize = 1

    if (change === 'increase' && (user.guessMapSize as number) < 4) {
      newMapSize = (user.guessMapSize as number) + 1
    } else if (change === 'decrease' && (user.guessMapSize as number) > 1) {
      newMapSize = (user.guessMapSize as number) - 1
    }

    const { width, height } = getGuessMapSize(newMapSize)

    setMapHeight(height)
    setMapWidth(width)

    dispatch(updateGuessMapSize({ guessMapSize: newMapSize }))
  }

  return {
    mapHeight,
    mapWidth,
    hovering,
    isPinned,
    setMapHeight,
    setMapWidth,
    setHovering,
    setIsPinned,
    handleMapHover,
    handleMapLeave,
    changeMapSize,
  }
}

export default useGuessMap
