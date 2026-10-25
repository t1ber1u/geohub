// Place search for the guess map. Photon (OpenStreetMap, keyless, built for search-as-you-type)
// with the Google Geocoder as fallback. Places Autocomplete isn't used since it needs an extra paid API.

export type PlaceResult = {
  id: string
  name: string
  detail: string
  type: string
  lat: number
  lng: number
  bounds?: { west: number; south: number; east: number; north: number }
}

const PHOTON_URL = 'https://photon.komoot.io/api/'
const PHOTON_LAYERS = ['country', 'state', 'county', 'city', 'district', 'locality', 'other']
// drops buildings, landuse, rail depots etc. that Photon also indexes
const PLACE_OSM_KEYS = ['place', 'boundary', 'natural']
const TYPE_LABELS: Record<string, string> = {
  country: 'Country',
  state: 'Region',
  county: 'County',
  city: 'City',
  district: 'Area',
  locality: 'Area',
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')

export const searchPlaces = async (query: string, signal?: AbortSignal): Promise<PlaceResult[]> => {
  const params = new URLSearchParams({ q: query, limit: '10', lang: 'en' })
  PHOTON_LAYERS.forEach((layer) => params.append('layer', layer))

  const res = await fetch(`${PHOTON_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Photon search failed: ${res.status}`)

  const { features = [] } = await res.json()
  const seen = new Set<string>()
  const results: PlaceResult[] = []

  for (const { geometry, properties: p } of features) {
    if (!PLACE_OSM_KEYS.includes(p.osm_key)) continue

    const detail = [p.state, p.country].filter((part, i, arr) => part && part !== p.name && arr.indexOf(part) === i).join(', ')
    const type = TYPE_LABELS[p.type] || capitalize(p.osm_value || p.type)
    const key = `${p.name}|${detail}|${type}`
    if (seen.has(key)) continue
    seen.add(key)

    const [lng, lat] = geometry.coordinates
    // Photon extent is [minLon, maxLat, maxLon, minLat]
    const bounds = p.extent
      ? { west: p.extent[0], north: p.extent[1], east: p.extent[2], south: p.extent[3] }
      : undefined

    results.push({ id: `${p.osm_type}${p.osm_id}`, name: p.name, detail, type, lat, lng, bounds })
  }

  return results.slice(0, 6)
}

export const geocodePlaces = async (query: string): Promise<PlaceResult[]> => {
  const { results } = await new google.maps.Geocoder().geocode({ address: query })

  return results.slice(0, 6).map((r) => {
    const [name, ...rest] = r.formatted_address.split(', ')
    const viewport = r.geometry.viewport.toJSON()

    return {
      id: r.place_id,
      name,
      detail: rest.join(', '),
      type: capitalize(r.types[0] || 'place'),
      lat: r.geometry.location.lat(),
      lng: r.geometry.location.lng(),
      bounds: viewport,
    }
  })
}

const POINT_ZOOM: Record<string, number> = { Country: 5, Region: 7, County: 9, City: 11, Area: 13 }
const MAX_ZOOM = 15

export const zoomToPlace = (map: google.maps.Map, place: PlaceResult) => {
  if (!place.bounds) {
    map.setCenter({ lat: place.lat, lng: place.lng })
    map.setZoom(POINT_ZOOM[place.type] ?? 12)
    return
  }

  const { west, south, east, north } = place.bounds
  map.fitBounds(new google.maps.LatLngBounds({ lat: south, lng: west }, { lat: north, lng: east }), 24)

  // tiny extents (single streets, islets) would otherwise zoom in too far to place a pin comfortably
  google.maps.event.addListenerOnce(map, 'idle', () => {
    if ((map.getZoom() ?? 0) > MAX_ZOOM) map.setZoom(MAX_ZOOM)
  })
}
