// Seeds the official "Famous Landmarks" map. Every location is an official Google Street View
// panorama (outdoor, not user-uploaded) with the camera aimed at the landmark; each view was
// checked visually. Safe to re-run: replaces the locations, keeps play stats.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed-landmarks.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const LANDMARKS_ID = '6185dfd47b54baf63473a540'

// [name, countryCode, lat, lng, panoId, heading, pitch] - lat/lng is the panorama's position
const LANDMARKS = [
  ['Eiffel Tower', 'fr', 48.856352, 2.298117, 'PsMuBg3-YfkAghUwLVYKxg', 310.1, 19.0],
  ['Arc de Triomphe', 'fr', 48.872544, 2.298759, 'lTRifhOUsdPd8lQr-s91OA', 297.2, 4.7],
  ['Notre-Dame de Paris', 'fr', 48.853773, 2.347664, 'gcSeFCFElB0KvPS5wDvyoQ', 118.7, 10.7],
  ['Louvre Pyramid', 'fr', 48.861325, 2.334501, '6gBZ2waSPgwXQlsL2k-9iA', 111.2, 4.3],
  ['Mont-Saint-Michel', 'fr', 48.63242, -1.50939, 'rQG8GUHl0osRuRWIp4Qv9w', 338.7, 8.0],
  ['Big Ben', 'gb', 51.500865, -0.122128, 'S2jQoPmkHrZgXEtFGdwEgQ', 265.0, 19.0],
  ['Tower Bridge', 'gb', 51.506295, -0.073829, 's7RDbd2gDUyqPYmpqCugnA', 228.9, 12.0],
  ['Buckingham Palace', 'gb', 51.502161, -0.140053, '9mTlZxQb7YwAZtjHjP8tPQ', 235.0, 4.4],
  ['Stonehenge', 'gb', 51.179339, -1.825646, 'Ho-dX0haxICQ07uBEuaCgg', 216.9, 1.7],
  ['Colosseum', 'it', 41.891589, 12.490846, 'JbxC-n8VsZoozxhD0GJCYg', 143.2, 7.4],
  ['Trevi Fountain', 'it', 41.900732, 12.483169, 'PhQldsBsfq-v1sV1zDDOYg', 26.8, 24.8],
  ['Leaning Tower of Pisa', 'it', 43.722478, 10.395625, 'JJELhhMraNw1IIQOuJbEfw', 53.7, 17.3],
  ["St. Peter's Basilica", 'va', 41.902374, 12.458494, '_zlnB5FxZp3bYrtBL15_2Q', 266.4, 7.5],
  ['Florence Cathedral', 'it', 43.772894, 11.254785, 'JheyevU2eaknX5rzt5lwew', 76.8, 26.5],
  ['Rialto Bridge', 'it', 45.437435, 12.335281, 'W5nfIlFxkx2TGnrXSbIJww', 37.6, 3.6],
  ['Sagrada Família', 'es', 41.403328, 2.173417, '2dNClTqLOPOA4WCnqk3hLA', 66.9, 35],
  ['Plaza de España, Seville', 'es', 37.376966, -5.986995, 'scBS4zM9heDXC9UQ9Yd7Vg', 10.7, 35],
  ['Brandenburg Gate', 'de', 52.516174, 13.379236, 'saiCiDqcMsw_YyV3royeQg', 276.5, 6.5],
  ['Cologne Cathedral', 'de', 50.939963, 6.957966, 'qwty3GqJfUnA_rQS_948Ug', 4.1, 27.7],
  ['Atomium', 'be', 50.8958, 4.340555, 'CEewVoZXiThjQcfwfmek5Q', 145.9, 22.5],
  ['Rijksmuseum', 'nl', 52.359342, 4.884473, 'QbnbRlC85V1J3Yowlr2-Eg', 35.5, 9.6],
  ['Charles Bridge', 'cz', 50.086378, 14.412477, 'hJD4ajGYQ8AoNyamPtWH-A', 277.9, 6.2],
  ['Hungarian Parliament Building', 'hu', 47.506546, 19.04716, 'rs-Hbsmyh8W7P69tnGb2cA', 298.5, 17.5],
  ['Schönbrunn Palace', 'at', 48.186907, 16.313259, 'krIfBnp2zuoI1kLKjwcc5A', 197.7, 2.4],
  ["Saint Basil's Cathedral", 'ru', 55.753818, 37.62171, 'm8QQ1_FfOaT2K1JUn3MI3w', 149.1, 8.5],
  ['Hagia Sophia', 'tr', 41.008085, 28.978628, 'EWWqaa-4HA2JkkCrKaGvZg', 67.0, 12.0],
  ['Belém Tower', 'pt', 38.692324, -9.215575, 'twM5RrVSQITyq_C0W7KwOA', 202.8, 9.4],
  ['Statue of Liberty', 'us', 40.68876, -74.044955, 'eRHawLNCog-yin94mSyMYw', 35.2, 35],
  ['Golden Gate Bridge', 'us', 37.829868, -122.483419, 'caIJ5q2N_-1zcOVn0NCjmA', 157.7, 1.9],
  ['White House', 'us', 38.895748, -77.036575, 'z9QQM_-8qgYmrzNPVXE-0g', 0.6, 2.7],
  ['United States Capitol', 'us', 38.8898, -77.005475, '2w_U5_asGuo3PFo8OPkpsA', 272.1, 7.4],
  ['Lincoln Memorial', 'us', 38.889066, -77.048028, 'KIe44mr3gnJgLeqoZk06hA', 277.9, 3.8],
  ['Gateway Arch', 'us', 38.625213, -90.189015, 'YSiYq8DTmWXuHE4wsj1dOg', 98.8, 13.6],
  ['Space Needle', 'us', 47.619086, -122.348342, 'jI-fuV4ufmyDUOh6t8xJpg', 335.7, 30.3],
  ['Mount Rushmore', 'us', 43.876052, -103.454478, 't9pzPTREph9nq_G98HmVrA', 312.6, 10.2],
  ['Cloud Gate', 'us', 41.882728, -87.62303, 'ruHr_CyJNEXOuUr3bdNR1g', 252.0, 9.3],
  ['CN Tower', 'ca', 43.639948, -79.382928, 'OlJ34RqALhU6uRhSk7TA-w', 311.2, 29.5],
  ['Niagara Falls', 'ca', 43.086739, -79.072822, '64SaJmwZkSWR7lA7sTJGzw', 140.1, 0],
  ['Château Frontenac', 'ca', 46.810403, -71.204534, 'rO0wLUYYiLVNGxXzYwSPtw', 339.3, 13.4],
  ['Chichén Itzá', 'mx', 20.683771, -88.569237, 'mtMDYXaMN6n2ZALdhRHfaA', 142.5, 7.6],
  ['Palacio de Bellas Artes', 'mx', 19.434759, -99.140829, 'MueLE-OIkpSAn2j0Eu_-lw', 320.9, 18.8],
  ['Machu Picchu', 'pe', -13.166147, -72.5458, 'Rf77jc_6ZHIRNTBxlCLpOg', 15.2, 0],
  ['Christ the Redeemer', 'br', -22.951877, -43.210679, '6ajVZrLsZDeouqE5JBbmPQ', 103.9, 45],
  ['Obelisco de Buenos Aires', 'ar', -34.601995, -58.381469, 'NhqOg9r4q7DdgpHq6ulE-w', 183.3, 11.7],
  ['Taj Mahal', 'in', 27.172984, 78.042084, 'pK-t5dpPxNtJRXTLZ0OkNA', 1.9, 7.5],
  ['India Gate', 'in', 28.612908, 77.227663, 'ANiuknhexC8z8cVREmzKSA', 89.2, 6.3],
  ['Gateway of India', 'in', 18.92174, 72.834435, 'RBd3PQ_NQS1oIIKZAVHeaQ', 39.2, 18.5],
  ['Petronas Towers', 'my', 3.155615, 101.713317, 'vi_TLVxCRyZfs3ePVVjCmw', 323.3, 32.8],
  ['Marina Bay Sands', 'sg', 1.286792, 103.854429, 'SMNq641TpdPo7sXAUlZlFA', 118.4, 7.2],
  ['Tokyo Skytree', 'jp', 35.707893, 139.811476, 'fWi3HXAROVJyASpS-fTCpA', 343.8, 35],
  ['Osaka Castle', 'jp', 34.686608, 135.525869, 'q9KpX--K0hUDCsHo784LRQ', 10.7, 20.7],
  ['Gwanghwamun Gate', 'kr', 37.57529, 126.976837, 'Cyu12DD93RYAAAQINlDbmA', 3.0, 7.9],
  ['Burj Khalifa', 'ae', 25.19517, 55.277009, 'NkkuWyGouvHefXRFRDx6dQ', 310.4, 35],
  ['Sheikh Zayed Grand Mosque', 'ae', 24.41286, 54.474929, 'sD98I5nvfXgAAAQINSQnUg', 165.9, 35],
  ['Petra Treasury', 'jo', 30.322215, 35.451643, 'kCs5K_GNZK7BrnzyvjeFag', 256.2, 35],
  ['Angkor Wat', 'kh', 13.412496, 103.863313, 'xKOhhFebQcrLDexgQwif_w', 90.7, 4.3],
  ['Grand Palace, Bangkok', 'th', 13.753112, 100.491701, 'gqeoa0l9UtLOnlrkdsKIVQ', 183.6, 4.1],
  ['Sydney Opera House', 'au', -33.858024, 151.214494, '2goFknGi9X7-XBWq1tHkBw', 28.3, 9.0],
  ['Sydney Harbour Bridge', 'au', -33.854299, 151.209342, '7a-iCc-v4W2BiCOlcPM2Bw', 32.0, 8.8],
  ['Uluru', 'au', -25.351166, 131.032709, '_nXfEwJBF_7E0MYxkQClBA', 29.1, 9.9],
  ['Sky Tower', 'nz', -36.847335, 174.761916, 'pA5q911ZyXG-t2UafDudVg', 169.4, 35],
  ['Great Pyramid of Giza', 'eg', 29.976289, 31.136522, 'aiUzXsBboB4UlVJBj8enEw', 325.6, 5.8],
]

async function main() {
  const { MONGO_URI, DB_NAME } = process.env
  if (!MONGO_URI || !DB_NAME) throw new Error('MONGO_URI and DB_NAME must be set')

  const client = await new MongoClient(MONGO_URI).connect()
  const db = client.db(DB_NAME)
  const mapId = new ObjectId(LANDMARKS_ID)
  const lats = LANDMARKS.map(([, , lat]) => lat)
  const lngs = LANDMARKS.map(([, , , lng]) => lng)

  await db.collection('maps').updateOne(
    { _id: mapId },
    {
      $set: {
        name: 'Famous Landmarks',
        description: 'The most iconic landmarks around the world',
        previewImg: 'official32.jpg',
        creator: 'GeoHub',
        isPublished: true,
        locationCount: LANDMARKS.length,
        bounds: { min: { lat: Math.min(...lats), lng: Math.min(...lngs) }, max: { lat: Math.max(...lats), lng: Math.max(...lngs) } },
        scoreFactor: 2000,
      },
      $setOnInsert: { createdAt: new Date(), avgScore: 0, usersPlayed: 0 },
    },
    { upsert: true }
  )

  await db.collection('locations').deleteMany({ mapId })
  await db.collection('locations').insertMany(
    LANDMARKS.map(([, countryCode, lat, lng, panoId, heading, pitch]) => ({ mapId, lat, lng, countryCode, panoId, heading, pitch, zoom: 0 }))
  )

  console.log(`Seeded Famous Landmarks map ${LANDMARKS_ID} with ${LANDMARKS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
