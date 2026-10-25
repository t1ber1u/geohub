import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { SearchIcon, XIcon } from '@heroicons/react/outline'
import { geocodePlaces, PlaceResult, searchPlaces, zoomToPlace } from '@utils/helpers/searchPlaces'
import { StyledGuessMapSearch } from './'

type Props = {
  map?: google.maps.Map
  onFocusChange?: (focused: boolean) => void
}

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

const GuessMapSearch: FC<Props> = ({ map, onFocusChange }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<any>()
  const abortRef = useRef<AbortController>()

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [])

  const runSearch = async (text: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)

    let places: PlaceResult[] = []

    try {
      places = await searchPlaces(text, controller.signal)
    } catch (err) {
      if (controller.signal.aborted) return []

      try {
        places = await geocodePlaces(text)
      } catch {
        places = []
      }
    }

    if (controller.signal.aborted) return []

    setResults(places)
    setActiveIndex(places.length ? 0 : -1)
    setNoResults(!places.length)
    setOpen(true)
    setLoading(false)

    return places
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setQuery(text)
    clearTimeout(debounceRef.current)

    if (text.trim().length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort()
      setResults([])
      setOpen(false)
      setLoading(false)
      setNoResults(false)
      return
    }

    debounceRef.current = setTimeout(() => runSearch(text.trim()), DEBOUNCE_MS)
  }

  const selectPlace = (place: PlaceResult) => {
    if (map) zoomToPlace(map, place)

    setQuery(place.name)
    setOpen(false)
    // closes the mobile keyboard so the zoomed map is visible and ready for a pin
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    clearTimeout(debounceRef.current)
    abortRef.current?.abort()
    setQuery('')
    setResults([])
    setOpen(false)
    setLoading(false)
    setNoResults(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()

      if (open && results[activeIndex]) {
        return selectPlace(results[activeIndex])
      }

      // Enter before the debounced search returned: search now and take the best match
      if (query.trim().length >= MIN_QUERY_LENGTH) {
        clearTimeout(debounceRef.current)
        const places = await runSearch(query.trim())
        if (places?.[0]) selectPlace(places[0])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && (results.length > 0 || noResults)

  return (
    <StyledGuessMapSearch className="guessMapSearch">
      <div className="searchInputWrapper">
        <SearchIcon className="searchIcon" />

        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Search a place to zoom in"
          aria-label="Search a place on the map"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="guess-map-search-results"
          aria-activedescendant={showDropdown && activeIndex >= 0 ? `guess-map-search-${activeIndex}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            onFocusChange?.(true)
            if (results.length) setOpen(true)
          }}
          onBlur={() => {
            onFocusChange?.(false)
            setOpen(false)
          }}
        />

        {loading && <span className="spinner" aria-hidden />}

        {query && !loading && (
          <button
            type="button"
            className="clearBtn"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSearch}
          >
            <XIcon />
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="results" id="guess-map-search-results" role="listbox">
          {results.map((place, i) => (
            <li
              key={place.id}
              id={`guess-map-search-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`result ${i === activeIndex ? 'active' : ''}`}
              // keep focus in the input so blur doesn't close the list before the click lands
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectPlace(place)}
            >
              <div className="resultText">
                <span className="resultName">{place.name}</span>
                {place.detail && <span className="resultDetail">{place.detail}</span>}
              </div>
              <span className="resultType">{place.type}</span>
            </li>
          ))}

          {noResults && <li className="noResults">No places found</li>}
        </ul>
      )}
    </StyledGuessMapSearch>
  )
}

export default GuessMapSearch
