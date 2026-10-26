// Seeds the official GeoHub "World" map (and the locations used by Country Streaks
// and the Daily Challenge) into an empty database.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const WORLD_ID = '6185df7a7b54baf63473a53e'

// [lat, lng, countryCode] - city-centre spots with reliable Street View coverage
const SPOTS = [
  [40.7580, -73.9855, 'us'], [34.0522, -118.2437, 'us'], [41.8781, -87.6298, 'us'], [29.7604, -95.3698, 'us'],
  [47.6062, -122.3321, 'us'], [25.7617, -80.1918, 'us'], [39.7392, -104.9903, 'us'], [33.4484, -112.0740, 'us'],
  [51.5074, -0.1278, 'gb'], [53.4808, -2.2426, 'gb'], [55.9533, -3.1883, 'gb'], [51.4816, -3.1791, 'gb'],
  [4.7110, -74.0721, 'co'], [6.2442, -75.5812, 'co'],
  [53.3498, -6.2603, 'ie'], [51.8985, -8.4756, 'ie'],
  [50.4501, 30.5234, 'ua'], [49.8397, 24.0297, 'ua'],
  [41.3275, 19.8187, 'al'],
  [14.5995, 120.9842, 'ph'], [10.3157, 123.8854, 'ph'],
  [44.4268, 26.1025, 'ro'], [46.7712, 23.6236, 'ro'],
  [-12.0464, -77.0428, 'pe'], [-13.5320, -71.9675, 'pe'],
  [14.6937, -17.4441, 'sn'],
  [-16.5000, -68.1500, 'bo'],
  [56.9496, 24.1052, 'lv'],
  [-1.9441, 30.0619, 'rw'],
  [-0.1807, -78.4678, 'ec'], [-2.1710, -79.9224, 'ec'],
  [60.1699, 24.9384, 'fi'], [61.4978, 23.7610, 'fi'],
  [-34.6037, -58.3816, 'ar'], [-31.4201, -64.1888, 'ar'], [-32.8895, -68.8458, 'ar'],
  [18.4655, -66.1057, 'pr'],
  [-6.2088, 106.8456, 'id'], [-8.6500, 115.2167, 'id'],
  [35.8989, 14.5146, 'mt'],
  [32.2949, -64.7814, 'bm'],
  [54.1523, -4.4861, 'im'],
  [62.0107, -6.7716, 'fo'],
  [52.5200, 13.4050, 'de'], [48.1351, 11.5820, 'de'], [53.5511, 9.9937, 'de'],
  [47.4979, 19.0402, 'hu'],
  [18.3358, -64.8963, 'vi'],
  [64.1466, -21.9426, 'is'],
  [-33.4489, -70.6693, 'cl'], [-41.4693, -72.9424, 'cl'],
  [41.0082, 28.9784, 'tr'], [39.9334, 32.8597, 'tr'],
  [41.9028, 12.4964, 'it'], [45.4642, 9.1900, 'it'], [40.8518, 14.2681, 'it'],
  [32.0853, 34.7818, 'il'],
  [35.6762, 139.6503, 'jp'], [34.6937, 135.5023, 'jp'], [43.0618, 141.3545, 'jp'],
  [37.9838, 23.7275, 'gr'], [40.6401, 22.9444, 'gr'],
  [55.7558, 37.6173, 'ru'], [59.9343, 30.3351, 'ru'],
  [49.2144, -2.1313, 'je'],
  [13.7563, 100.5018, 'th'], [18.7883, 98.9853, 'th'],
  [-23.5505, -46.6333, 'br'], [-22.9068, -43.1729, 'br'], [-30.0346, -51.2177, 'br'],
  [6.5244, 3.3792, 'ng'], [9.0765, 7.3986, 'ng'],
  [14.6349, -90.5069, 'gt'],
  [17.9757, 102.6331, 'la'],
  [64.1814, -51.6941, 'gl'],
  [45.8150, 15.9819, 'hr'], [43.5081, 16.4402, 'hr'],
  [47.3769, 8.5417, 'ch'], [46.2044, 6.1432, 'ch'],
  [48.8566, 2.3522, 'fr'], [43.2965, 5.3698, 'fr'], [45.7640, 4.8357, 'fr'],
  [28.6139, 77.2090, 'in'], [19.0760, 72.8777, 'in'], [12.9716, 77.5946, 'in'],
  [19.4326, -99.1332, 'mx'], [20.6597, -103.3496, 'mx'],
  [42.4304, 19.2594, 'me'],
  [59.4370, 24.7536, 'ee'],
  [18.4861, -69.9312, 'do'],
  [-29.3151, 27.4869, 'ls'],
  [25.2048, 55.2708, 'ae'],
  [31.9454, 35.9284, 'jo'],
  [47.8864, 106.9057, 'mn'],
  [27.4728, 89.6390, 'bt'],
  [45.4215, -75.6972, 'ca'], [43.6532, -79.3832, 'ca'], [49.2827, -123.1207, 'ca'], [45.5017, -73.5673, 'ca'],
  [3.1390, 101.6869, 'my'],
  [6.9271, 79.8612, 'lk'],
  [59.9139, 10.7522, 'no'], [60.3913, 5.3221, 'no'],
  [42.5063, 1.5218, 'ad'],
  [-33.8688, 151.2093, 'au'], [-37.8136, 144.9631, 'au'],
  [-36.8485, 174.7633, 'nz'], [-43.5321, 172.6362, 'nz'],
  [-26.2041, 28.0473, 'za'], [-33.9249, 18.4241, 'za'],
  [37.5665, 126.9780, 'kr'], [1.3521, 103.8198, 'sg'],
  [40.4168, -3.7038, 'es'], [41.3851, 2.1734, 'es'],
  [38.7223, -9.1393, 'pt'], [52.3676, 4.9041, 'nl'], [50.8503, 4.3517, 'be'],
  [52.2297, 21.0122, 'pl'], [50.0755, 14.4378, 'cz'], [48.2082, 16.3738, 'at'],
  [55.6761, 12.5683, 'dk'], [59.3293, 18.0686, 'se'], [44.7866, 20.4489, 'rs'],
  [-1.2921, 36.8219, 'ke'], [-4.4419, 15.2663, 'cd'],
]

async function main() {
  const { MONGO_URI, DB_NAME } = process.env
  if (!MONGO_URI || !DB_NAME) throw new Error('MONGO_URI and DB_NAME must be set')

  const client = await new MongoClient(MONGO_URI).connect()
  const db = client.db(DB_NAME)
  const mapId = new ObjectId(WORLD_ID)
  const lats = SPOTS.map(([lat]) => lat)
  const lngs = SPOTS.map(([, lng]) => lng)

  await db.collection('maps').updateOne(
    { _id: mapId },
    {
      $set: {
        name: 'World',
        description: 'The classic game mode we all love, any country is fair game!',
        previewImg: 'official15.jpg',
        creator: 'GeoHub',
        isPublished: true,
        locationCount: SPOTS.length,
        bounds: { min: { lat: Math.min(...lats), lng: Math.min(...lngs) }, max: { lat: Math.max(...lats), lng: Math.max(...lngs) } },
        // same scale as calculateMapScoreFactor's world reference; 1 made every guess worth ~0 points
        scoreFactor: 2000,
      },
      // re-seeding must not reset play stats
      $setOnInsert: { createdAt: new Date(), avgScore: 0, usersPlayed: 0 },
    },
    { upsert: true }
  )

  await db.collection('locations').deleteMany({ mapId })
  await db.collection('locations').insertMany(
    SPOTS.map(([lat, lng, countryCode]) => ({ mapId, lat, lng, countryCode, panoId: null, heading: 0, pitch: 0, zoom: 0 }))
  )

  console.log(`Seeded world map ${WORLD_ID} with ${SPOTS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
