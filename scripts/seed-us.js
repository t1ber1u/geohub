// Seeds the official "United States" map. Locations cover all 50 states and DC (cities, suburbs, small towns,
// highways, farmland, deserts, mountains, Alaska and Hawaii), weighted roughly by population. Each one is an
// official outdoor Google panorama, confirmed to be in the US by reverse geocoding and checked visually.
// Safe to re-run: replaces the locations, keeps play stats.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed-us.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const US_ID = '6185e0077b54baf63473a542'

// [state, lat, lng, panoId, heading] - lat/lng is the panorama's position
const LOCATIONS = [
  ['CA', 34.109166, -118.224013, 'rA_2l4Kej3EyFg5usdEpng', 126.7], // 2210 Maricopa Dr, Glassell Park, CA 90065
  ['CA', 34.000993, -118.257182, 'A12by-f-4QH7nNl3YZKgAQ', 148.1], // 1047 E 47th St, Los Angeles, CA 90011
  ['CA', 32.770793, -117.178815, 'DqUwVBVA4cy-RAfQehv9GQ', 171.9], // 6495 Linda Vista Rd, San Diego, CA 92111
  ['CA', 37.741731, -122.419929, 'RVzbM8WA2_miiKRebjcgyQ', 255.9], // 236 Prospect Ave, San Francisco, CA 94110
  ['CA', 37.295526, -121.884748, 'ygqdORckiJBbHKmPS6t_hA', 204.7], // 2054 Jonathan Ave, San Jose, CA 95125
  ['CA', 38.54161, -121.451064, '_mZqnChcqTdiy7TmNy1Y4A', 284.9], // 3624 Stockton Blvd, Sacramento, CA 95820
  ['CA', 36.695471, -119.727383, 'sJIKr8NKlSTtKwNxP1aDWQ', 41.7], // 2921 S Willow Ave, Fresno, CA 93725
  ['CA', 35.357978, -119.022714, '3B5-qX4dzzQNjeVvF_u9tw', 157.9], // 1816 Bank St, Bakersfield, CA 93304
  ['CA', 40.579873, -122.387579, 'LXZ7CYoWzyWQvfrIL2ZN_g', 118.3], // 2007 Pine St, Redding, CA 96001
  ['CA', 40.779757, -124.175854, 'JfFDgBcRj9Ih-yJYg9Qg_Q', 112.9], // 3138 Albee St, Eureka, CA 95503
  ['CA', 33.891761, -116.518226, 'ityseJLMieFqqCbFIRBUww', 267.2], // Sonny Bono Mem Fwy, Desert Hot Springs, CA 92240
  ['CA', 34.865327, -117.065087, '2fvlRSFtYZ81HO4kYcwRcw', 333.6], // 33825 P St, Barstow, CA 92311
  ['CA', 34.444163, -119.677474, 'pHxZ8Tj0LDJ9Nxuu3IX9qw', 67.6], // 11 Ealand Pl, Santa Barbara, CA 93103
  ['CA', 37.344427, -118.39501, 'NrVzoCMOxUG8osTF9BR7vA', 319.9], // 1305 US-395, Bishop, CA 93514
  ['CA', 36.684869, -121.707882, 'tZzLTRy_rUSoSUjBNMp6vg', 346.3], // 85 Armstrong Rd, Salinas, CA 93908
  ['CA', 33.980647, -117.363362, 'PuVxKLOSV7pjH4hfDLuAbg', 277.6], // 2957 5th St, Riverside, CA 92507
  ['TX', 29.705947, -95.392871, 'ygJGq797IMMoh6SkcuL8yw', 345.9], // 1801 Devonshire Crescent, Houston, TX 77030
  ['TX', 29.791039, -95.410021, 'jHtX3GtKeS79hBXQ-IUmbA', 55.6], // N Shepherd Dr @ W 11th St, Houston, TX 77008
  ['TX', 32.756981, -96.86243, '1euPPiYVdBrKSS8ybqpKQA', 242.9], // 2600 Bahama Dr, Dallas, TX 75211
  ['TX', 29.455332, -98.493533, '2JZ7Ltb4U4t7g31VD1NgrA', 77.7], // 109 E Magnolia Ave, San Antonio, TX 78212
  ['TX', 30.292916, -97.798264, 'pIi8NlE1SdsXaK4IHEP7XQ', 104.5], // 1107 Westlake Dr, West Lake Hills, TX 78746
  ['TX', 31.805197, -106.509221, '1bhsHdg-PFD3-tjdc49_aQ', 212.2], // 4748 N Mesa St #239, El Paso, TX 79912
  ['TX', 33.561477, -101.892662, 'zOJJ1IY_EA3AVqW5_MRKYw', 329.5], // 3605 36th St, Lubbock, TX 79413
  ['TX', 35.265613, -101.865538, 'wgq7HQGytIRzwJM3NKB7xA', 217.4], // 2564 W Loop 335 N, Amarillo, TX 79108
  ['TX', 27.797046, -97.387992, 'cG2VZwRj-rjiMeyk-S8tTw', 186.1], // Corpus Christi Sunrise, Norma Urban Park, 76 Peoples St T-Head, Corpus Christi, TX 78401
  ['TX', 31.978429, -102.083764, 'DaUh8Y0AAYZT5amzMf8AjQ', 80.6], // 1400 W Montgomery Ave, Midland, TX 79701
  ['TX', 32.309, -95.334063, '8j36osumISIzF0y0qtcSlQ', 34.6], // 3705 Frankston Hwy, Tyler, TX 75701
  ['TX', 32.414527, -99.702836, 'ZZt8lXzq78fRJUCHntdKTQ', 92.1], // 2909 Loop 322, Abilene, TX 79602
  ['TX', 30.568045, -103.912969, 'QD2R7VZSDMpkalqWBfr0yQ', 278.1], // TX-17, Fort Davis, TX 79734
  ['TX', 30.063859, -94.051858, 'Tc0imMMCThLDR2smxxiadg', 262.3], // Plant Rd Pl, Beaumont, TX 77701
  ['FL', 25.80843, -80.200478, 'G4efZqCha2LCD2B7srXBqQ', 318.3], // 261 NW 34th St, Miami, FL 33127
  ['FL', 28.484834, -81.413501, 'dr6JORZ2820tsI79Eq10HA', 192.1], // 5359 Ansonia Ct, Orlando, FL 32839
  ['FL', 27.923024, -82.416803, 'ZTNdLmBWlX0oIJNfPmqeLg', 73.3], // 3620 Causeway Blvd, Tampa, FL 33619
  ['FL', 30.368342, -81.714195, '1k8JmjlLLk3dIffDIPZ60w', 178.8], // 2961 W 45th St, Jacksonville, FL 32209
  ['FL', 30.403862, -84.245292, 'V1EpwUnL2-3SjjF1-YDaSw', 123.1], // 3700 S Blair Stone Rd, Tallahassee, FL 32311
  ['FL', 30.394368, -87.268988, 'lHK51XzsBkKX23lAVeOrqQ', 132.1], // 1307 Dexter Ave, Pensacola, FL 32507
  ['FL', 26.615202, -81.889965, 'ICDwhDEUt_vObr460xZPQw', 311.8], // 1206 Plumosa Dr, Fort Myers, FL 33901
  ['FL', 29.235108, -82.144604, 'Tuc6kUNKAdAOgfcCLz-XXw', 55], // 823 NW 45th Pl, Ocala, FL 34475
  ['FL', 24.548769, -81.808515, 'H0ynG3RGWpivbbDQ_Q0oEg', 258.9], // 10 Howard England Wy, Key West, FL 33040
  ['FL', 29.661872, -82.36938, 'P8QAlXfwrW6YuJc_HP6OKQ', 190.5], // 3131 NW 10th Pl, Gainesville, FL 32605
  ['NY', 40.714413, -73.985961, 'ztNq6dbbj9hLRM0nrPJKeg', 244.6], // 247 E Broadway, New York, NY 10002
  ['NJ', 40.745231, -74.054518, 'aZZzdMkxDV8Z0-zUK8BpCg', 168.2], // 81 Sherman Pl, Jersey City, NJ 07307
  ['NY', 42.865681, -78.876644, 'ixMgEoZPfLVc067aD5MrxQ', 302.2], // 543 Fuhrmann Boulevard, Buffalo, NY 14203
  ['NY', 42.663177, -73.782763, 'wIEWJjRfme4qvmLfy8H5uw', 50.5], // 197 Partridge St, Albany, NY 12203
  ['NY', 43.068422, -76.137994, 'qK7GoBaaFQYkqr7-YhYBxw', 6.7], // 101 Elsner St, Syracuse, NY 13203
  ['NY', 44.292966, -74.053732, 'IfP2F2MBkiVMvpMgP3twSQ', 115.3], // 1351-1340 NY-86, Lake Placid, NY 12946
  ['NY', 42.445306, -76.5258, 'X78rVKr013C1StvCUenZ2Q', 250.1], // 425 Richard Pl, Ithaca, NY 14850
  ['NY', 41.072296, -71.954823, 'p0a7kWK3C2VrrwqFJlRRsQ', 88.2], // 42 Captain Kidds Path, Montauk, NY 11954
  ['PA', 39.973428, -75.196577, 'GMN5Uv884dq-kWZnoBenAw', 5.5], // 3400 W Girard Ave, Philadelphia, PA 19104
  ['PA', 40.500047, -79.983836, 'WQCRBZi-xthF7_f1qF1ryA', 27.9], // 309 Russell St, Pittsburgh, PA 15209
  ['PA', 40.254931, -76.899664, 'l_BhG-dY5HTHChOIJ_Df-w', 288.8], // 20 N River St, Wormleysburg, PA 17043
  ['PA', 42.088979, -80.119922, 'EyFSnFKcbKzuSw-zBf3T9w', 342.8], // W 32nd St at Pittsburgh Ave, Erie, PA 16508
  ['PA', 41.407168, -75.692421, 'OYvkbTPQz1YQA2mrbH-oDQ', 262.2], // 1279 Apgar Pl, Scranton, PA 18504
  ['PA', 40.802366, -77.788281, 'rnJD2tGZSd0yaoWPpbL5Sw', 355.5], // 141 Blackberry Ln, Boalsburg, PA 16827
  ['PA', 40.022521, -76.37575, 'iCZPTgnr-1su7OV7ZGPMXw', 41.1], // 2824 Charlestown Rd, Lancaster, PA 17603
  ['IL', 41.930854, -87.652345, '5cwRgP6rOXEiBtKhB8vm9w', 311.7], // 923 W Schubert Ave, Chicago, IL 60614
  ['IL', 41.887701, -87.619627, 'eHY_8nRtqmRbNR90poE0Gg', 222.9], // 323 E Wacker Dr, Chicago, IL 60601
  ['IL', 39.769814, -89.715225, 'VrSl0NxFHrdKACBOJK7c9A', 164.6], // 2538 S Koke Mill Rd, Springfield, IL 62711
  ['IL', 40.64309, -89.553434, 'gpNI7zGVKvAJeSF1Xy7a8A', 191.4], // 301 Peace Field Ln, East Peoria, IL 61611
  ['IL', 37.73049, -89.230192, 'yjjGAG24UTsMWrNJ-HfICA', 286.4], // 1001 W Sycamore St, Carbondale, IL 62901
  ['IL', 42.313762, -89.149243, 'jzqvcet3_vtrYA5BSkl2mw', 356.5], // 5730 Page Pl, Rockford, IL 61101
  ['OH', 39.931531, -82.98656, 'DmyMdOuqP3AKSU6Nrs3IlA', 114.5], // 339 Southwood Ave, Columbus, OH 43207
  ['OH', 41.536004, -81.648778, '6qnVjHy-772h09QDTPbVOg', 114.1], // G9P2+CF Cleveland, OH
  ['OH', 39.143557, -84.534011, 'HM7bfyPamv5jGwQ4IGgfiw', 352.8], // 3344 Central Pkwy, Cincinnati, OH 45225
  ['OH', 41.65578, -83.526262, 'aGGaxGdjjjCyBOnAwRrvZg', 115.5], // 907 Water St, Toledo, OH 43604
  ['OH', 39.285841, -82.101415, 'YXIOHlVHH-7OQPh2acJTxQ', 158], // 3811 US-33, Athens, OH 45701
  ['OH', 40.702312, -84.053832, '31kNbFO_NxB6SuHTS3-Nwg', 343.1], // 2790 E Hanthorn Rd, Lima, OH 45804
  ['GA', 33.762097, -84.326104, 'dd4Z7Dh907pYCSVUKQflTg', 110.5], // 292 Ivy Ct NE, Atlanta, GA 30307
  ['GA', 32.089587, -81.118686, 'iD4OrqijccQMBQvvqytrSg', 238.2], // 1600 Rogers St, Savannah, GA 31415
  ['GA', 32.834737, -83.631209, 'iswnYre0CPvNYyWfpAvrNg', 108.1], // 595 2nd St, Macon, GA 31201
  ['GA', 30.834343, -83.338804, 'ribsxkVoKOu2rkSnLfNW6A', 88.3], // 2968 Riverside Rd, Valdosta, GA 31601
  ['GA', 34.49167, -84.019956, 'OMzgwk7euXuiB8P-tL0UlA', 95.4], // 3079 Auraria Rd, Dahlonega, GA 30533
  ['NC', 35.216836, -80.895047, '21Gt1Qh9h_qbFw8VYEkbNQ', 186.4], // 2701 McCombs St, Charlotte, NC 28208
  ['NC', 35.818078, -78.691081, '4eIm7LoZsk3IWo8lG7gTJA', 137.6], // 2612 Wycliff Rd, Raleigh, NC 27607
  ['NC', 35.590127, -82.564839, 'j20j54nVM-B2JdyseDF5rw', 257.4], // 21 Jefferson Dr, Asheville, NC 28801
  ['NC', 34.211935, -77.904519, 'kjJ_yjaSYC3M9ITwpDQWSA', 219.8], // 1710 Fordham Rd, Wilmington, NC 28403
  ['NC', 35.943913, -75.616592, '580oDARBD77rSB-jYNc5Cw', 319.9], // 4710 S Virginia Dare Trail, Nags Head, NC 27959
  ['MI', 42.376995, -83.027506, '5SueNmo7LfCQ2b8cUonquw', 173.5], // 1577 E Grand Blvd, Detroit, MI 48211
  ['MI', 42.957459, -85.752029, 'pDpmPvkUX8YrqsVBLKyc1A', 207.5], // 3423 O'Brien Rd SW, Grand Rapids, MI 49534
  ['MI', 42.776022, -84.493951, 'nEGwU5fWvd5nTtY0tYnYCQ', 354.9], // 3682 Shearwater Ln, East Lansing, MI 48823
  ['MI', 44.709411, -85.626692, 'pHvQRvN1nK1Glr1drnikSA', 138.5], // 1591 Cass Rd, Traverse City, MI 49685
  ['MI', 46.517581, -87.401309, 'nrq1bv0H5hS1NKXzoFC8ww', 113.3], // 2858 Granite Pointe Dr, Marquette, MI 49855
  ['NJ', 40.794158, -74.199713, 'vntpo-g7oE1ahSvCYjPkuA', 306.7], // 11 Farrand St, Bloomfield, NJ 07003
  ['NJ', 40.222417, -74.689014, 'nHT2dWvso3qq5rHVVHYEbQ', 349.5], // 1722 Whitehorse Mercerville Rd, Hamilton Township, NJ 08619
  ['NJ', 38.993335, -74.880021, 'eLr-mDl_0ZWGkR2DKguqxg', 215.3], // Garden State Pkwy, Cape May, NJ 08204
  ['NJ', 40.792382, -74.497251, 'xcO5oLE916usDfsxwf-_Ew', 4.8], // 54 Center Ave, Morristown, NJ 07960
  ['VA', 37.512336, -77.458864, 'EjYcOKm-gkVtSH_jw5wsfQ', 149.3], // 16 E 28th St, Richmond, VA 23224
  ['VA', 36.785174, -75.973574, 'pu46PHU2tqmcjrvTzHQqqg', 109.8], // 603 Jaden Wy, Virginia Beach, VA 23454
  ['VA', 37.23697, -79.93972, 'm2ZQ7zbp4W__vy017SmJPg', 51.9], // 2643 Mill Mountain Pkwy, Roanoke, VA 24014
  ['DC', 38.864921, -77.02227, '6qM6utF7kpMpLS4kDZLfqA', 137.1], // 177 Ohio Dr SW, Washington, DC 20024
  ['VA', 38.423117, -78.84714, '8fYFnzS180D_RaL9DYXy4A', 3.4], // 273 Emerald Dr, Harrisonburg, VA 22801
  ['WA', 47.634197, -122.359677, 'y0Okm6kePB-2zD3es4GlDQ', 178.7], // 1620 2nd Ave W, Seattle, WA 98119
  ['WA', 47.667894, -117.470573, 'FEa1Jz0UtY3arneGgUc1fA', 17.6], // 1202 N Government Wy, Spokane, WA 99224
  ['WA', 46.618703, -120.484012, 't6Slu9WbM4L0Lhz2YoiOPA', 2.3], // 1418 Marsh Rd, Yakima, WA 98901
  ['WA', 47.065775, -122.89655, 'T-1h2e711malZw-qDdlKtA', 197.6], // 2203 Bayside Pl NE, Olympia, WA 98506
  ['WA', 48.10434, -123.446017, 'OJmo-bwcmnqhMmOMbXkmeA', 146], // 110 W Fogarty Ave, Port Angeles, WA 98362
  ['AZ', 33.467019, -112.031361, 'IZU6bhMXcnQwyMzykx8hVg', 144.6], // 2328 E Almeria Rd, Phoenix, AZ 85006
  ['AZ', 32.197495, -110.993586, 'hUC-nq7aR6RlQ9Sc6y-lzQ', 218.8], // 1325 W Silverlake Rd, Tucson, AZ 85713
  ['AZ', 35.241435, -111.650757, 'ADWh2-ttYqtT0jyVdDneGA', 82.8], // 110 W Mt Elden Lookout Rd, Flagstaff, AZ 86001
  ['AZ', 32.728548, -114.592067, 'gjScb0Jbcf2KteS5FJrIkA', 85.9], // Levee Rd, Yuma, AZ 85364
  ['AZ', 36.910323, -111.409494, 'OZZ3yp5VQDwJAYUY0MW4eA', 161.3], // 304 Antelope Pt Rd, Page, AZ 86040
  ['MA', 42.400774, -71.062628, 'ZSlAU_oXIeXkQnO9SMctCQ', 73.1], // 25 Charlton St, Everett, MA 02149
  ['MA', 42.302663, -71.832423, 'S7ooEOBzM_8e7fnolFAIuw', 96.9], // 101 Barry Rd, Worcester, MA 01609
  ['MA', 41.659716, -70.321113, 'eGL_WFmEwBr5CnVHH4YEkA', 154], // 933 Falmouth Rd, Hyannis, MA 02601
  ['MA', 42.474986, -73.259661, 'm4jkm4e71fdFUrY4p7cyRQ', 194.9], // 45 Paul Ave, Pittsfield, MA 01201
  ['TN', 36.140954, -86.746714, 'K7Ez_SLqBWj52mUbEPOnQQ', 352.6], // 727 Fesslers Ln, Nashville, TN 37210
  ['TN', 35.162296, -90.001906, 'AnsV4PbZoAEo2bzUU8ymxw', 109.1], // 885 N Belvedere Blvd, Memphis, TN 38107
  ['TN', 35.903661, -83.906393, 'DZUQlzHE4qnqusFe58GMvA', 231.7], // 6236 W Martin Mill Pike, Knoxville, TN 37920
  ['TN', 35.061767, -85.357345, '234w5g-cGxUUx6Smm4gzZQ', 226], // 3520 Elderview Dr, Chattanooga, TN 37419
  ['IN', 39.798673, -86.212125, 'xt2Qpuw-wf9_9u217yobng', 345.1], // 2314 N Goodlet Ave, Indianapolis, IN 46222
  ['IN', 41.041548, -85.161796, 'K90B8TIO2F0dwZL-tM21EQ', 269.7], // 3900 Old Mill Rd, Fort Wayne, IN 46807
  ['IN', 39.106129, -86.540236, 'hVNs0BPJkSPA5c5MsamMtw', 77.5], // 5501 S Rogers St, Bloomington, IN 47403
  ['IN', 37.942853, -87.537174, '5pSbI21m6UeCLQhACTj2SQ', 66.6], // 2629 Beech Dr, Evansville, IN 47714
  ['KS', 39.078422, -94.649513, 'OtMpMXw5HOCoyHiVm7c2Eg', 297.8], // 1010 S 18th St Expy, Kansas City, KS 66105
  ['MO', 38.624874, -90.258937, 'Aow_tDHuCGud5stS7cGbPw', 244], // 4377 Norfolk Ave, St. Louis, MO 63110
  ['MO', 37.185501, -93.345278, 'f60t1IsgnT9T33cg8SjKOg', 34.8], // 1678 S Moore Rd, Springfield, MO 65807
  ['MO', 38.948808, -92.259042, '3NEcdo7HYgb2KoLp0RvSPg', 283.1], // 2 Lexibelle Dr, Columbia, MO 65201
  ['MD', 39.32788, -76.67327, 'Xm6sCg-MjwpimqBGx3YApQ', 193], // 3511 Edgewood Rd, Baltimore, MD 21215
  ['MD', 38.941492, -76.450593, '18YyYJ4D2a67w6wGbsTBvw', 355.7], // 121 Bay Dr, Annapolis, MD 21403
  ['MD', 39.452725, -77.370226, 'rZuaFt19MdV0_sLdhNp2yg', 315.8], // 8506 MD-26, Walkersville, MD 21793
  ['MD', 38.386229, -75.06394, 'NPBnUxyHGYDKMLebtEiL0w', 257.1], // 1 64th St, Ocean City, MD 21842
  ['WI', 43.061581, -87.917091, '7W-nT3t_XQxmDc4mvaSn2w', 190.6], // 2353 N 5th St, Milwaukee, WI 53212
  ['WI', 43.115092, -89.357914, 'zFm_gpAcyjTrrtzVYnIi5w', 337.3], // 1329 Loftsgordon Ave, Madison, WI 53704
  ['WI', 44.490133, -88.092033, 'I3JsKdjpIiwxMfXZvVvFSQ', 295], // 1384 Mohican Ct, Green Bay, WI 54313
  ['WI', 44.86419, -91.524181, 'FohhVOa4EI59THCU1vDnOg', 104.6], // 1150 Plum Creek Dr, Eau Claire, WI 54703
  ['CO', 39.698413, -105.037313, 'qQnwcWvt_f3bp1r-uofKeg', 257.1], // 1002 S Osceola St, Denver, CO 80219
  ['CO', 38.823975, -104.807749, 'J1h98IwgYGz4_3h77pG-1A', 114.3], // 915 E Rio Grande St, Colorado Springs, CO 80903
  ['CO', 39.088705, -108.586675, 'uaYfIs9CMIA_XEAM6r6qFA', 57.9], // 577 N Westgate Dr, Grand Junction, CO 81505
  ['CO', 37.230404, -107.904936, '_2nwiC3Z5x2vSnvopm2WrA', 307.1], // 63JW+52 Durango, CO
  ['CO', 40.571989, -105.079091, 'h7dUNreWQIvmxSu1s5P63w', 189.5], // General Services, 1251 S Mason St, Fort Collins, CO 80523
  ['MN', 45.000644, -93.346396, 'tJNivJ4URVHhKghlH3uU0w', 300.4], // 2100 Toledo Ave N, Minneapolis, MN 55422
  ['MN', 46.805929, -92.171001, '5nzeBVLtMMycfbzvDUSV1A', 58.4], // 4940 Matterhorn Dr, Duluth, MN 55811
  ['MN', 44.001744, -92.427047, '8gTKxKrmI0int99zBxMOaw', 194.6], // 1418 24th Ave SE, Rochester, MN 55904
  ['MN', 47.443535, -94.835958, 'AVZoVLZ55fMGShIDRAs_5Q', 254.6], // 2184 Open Meadows Ct SE, Bemidji, MN 56601
  ['SC', 34.033719, -80.984848, 'PS90jchtzWy3ZCFTSg5C2g', 169.2], // 3511 Raven Hill Rd, Columbia, SC 29204
  ['SC', 32.728244, -79.909857, 'fCkL-GLIg3w41AnXP-lqKQ', 229.3], // 523 Schooner Rd, Charleston, SC 29412
  ['SC', 34.87016, -82.447247, 'gE7Xa37v9-jxpEd2UnNuEg', 114], // 8 Childress Cir, Greenville, SC 29617
  ['AL', 33.514942, -86.885247, 'zSuJNhps0JhWfK2QSPpdDg', 232.3], // 1267 Avenue L, Birmingham, AL 35218
  ['AL', 32.354476, -86.321244, 'qmyKF7uJE0NmBuaHgDxZtA', 321.9], // 1620 S Holt St, Montgomery, AL 36108
  ['AL', 34.783078, -86.590818, 'lGF4pbF8fF_wPxbU7FOX8A', 340.8], // 2221 Norris Rd NW, Huntsville, AL 35810
  ['AL', 30.659268, -88.035525, 'leJs5Sz7M0YLcFEW9rYgNQ', 323.5], // 1702 Yeend Lp, Mobile, AL 36603
  ['LA', 29.962882, -90.101093, 'YyFiPQcR3SCqm54Boi_27g', 142.8], // 755 S Norman C. Francis Pkwy, New Orleans, LA 70119
  ['LA', 30.418029, -91.232191, 'sIMGbB6cK_I6g4fVYcZdoA', 75], // 2410 Liberty Ln, Port Allen, LA 70767
  ['LA', 32.557402, -93.739363, 'JXynFvgjYM-mHZucWka8aA', 251.1], // I-220, Bossier City, LA 71111
  ['LA', 30.232126, -92.068605, 'ZzpmK4OjNw2qn_wZkAZLLw', 186.4], // 4124 Cameron St, Lafayette, LA 70506
  ['KY', 38.227462, -85.725481, 'r1GBEv2YZqz2Yqb9zhR9AA', 266.4], // 23 Hawthorn Hill, Louisville, KY 40204
  ['KY', 38.051327, -84.463649, 'pAR_igCbeUTceH94zm27_g', 206.6], // 981 Contract St, Lexington, KY 40505
  ['KY', 36.969974, -86.463365, 'CaTXf8x-AYi9ziD6p7Nx_w', 223], // 554 Brentmoor Ave, Bowling Green, KY 42101
  ['KY', 37.419511, -82.516655, 'WRlnibRIHuIaOCkrTPZm2w', 244.2], // 2359 US-23, Pikeville, KY 41501
  ['OR', 45.467442, -122.628066, 'Nak49tQ8Nbvl1DigCjtglQ', 315.8], // 3406 SE Lambert St, Portland, OR 97202
  ['OR', 44.000689, -123.071762, 'kZoTJycCi3NXmzItgKLDBA', 187.6], // 901 Woodhill Dr, Eugene, OR 97405
  ['OR', 44.001992, -121.315635, '_GR2sZelEFsvELoU7a55xw', 132], // 60650 China Hat Rd, Bend, OR 97702
  ['OR', 42.272809, -122.858042, 'Hg9KimoMTJ4nDXf-pGH6vg', 122.6], // 4145 Independence School Rd, Medford, OR 97501
  ['OR', 45.658941, -118.734627, 'u2JFbLaBQAf1jWYw1raOwQ', 230.8], // 45327 Trail Rd, Pendleton, OR 97801
  ['OK', 35.43543, -97.479007, '29RcnylmAPF2qtoXcjGLWQ', 355.4], // 1830 SE 29th St, Oklahoma City, OK 73129
  ['OK', 36.189553, -95.968699, 'Uvx4G2AmrHcYfcaayIgvng', 79], // 1614 E Young St, Tulsa, OK 74106
  ['OK', 34.586778, -98.457248, '11Brsa158NQhRpSSpQI4XA', 71.2], // 2007 SW 52nd St, Lawton, OK 73505
  ['OK', 36.674761, -101.412092, 'VYEAGlpk2p8nevs-MJHbOw', 113], // 3441 US-412, Guymon, OK 73942
  ['CT', 41.779143, -72.742437, 'g273JBkq5hdC6lHoLGkKBg', 135.5], // 1821 Asylum Ave, West Hartford, CT 06117
  ['CT', 41.293637, -72.957315, 'PJU10EI5xg6jQswgaRhyDA', 332.8], // 19 Atwood Pl, West Haven, CT 06516
  ['UT', 40.772245, -111.834426, 'O7A0A6hAn83XwjT5NYb8ZA', 349.9], // 175 N Medical E Dr, Salt Lake City, UT 84112
  ['UT', 37.131845, -113.583932, 'G6kaJB5uFzqcgpe65TfYig', 151.7], // Red Hills Pkwy, St. George, UT 84770
  ['UT', 38.582397, -109.511276, 'QGvxxsWd4zsDF2k0d_KkdQ', 69.5], // Sand Flats Rd, Moab, UT 84532
  ['IA', 41.63666, -93.580871, 'dSu7dscd96phiNUX9zW5cA', 56.6], // 4111 Delaware Ave, Des Moines, IA 50313
  ['IA', 41.952392, -91.615692, '1hsoVC0uM1pYWigwV5xFyg', 322.1], // 3600 Otis Rd SE, Cedar Rapids, IA 52403
  ['IA', 42.497177, -96.426045, 'ynGCqFee3qqo9qjREBkVqA', 39.9], // 106-10 George St, Sioux City, IA 51103
  ['NV', 36.230285, -115.126676, 'pumtK9bTGP_KJwa6_6mp_w', 15.2], // 3885 Rockbottom St, North Las Vegas, NV 89030
  ['NV', 39.504475, -119.756288, 'SUqCExbSJukK4jMqU_ox9Q', 122.8], // 520 Edison Way, Reno, NV 89502
  ['NV', 40.851437, -115.718446, 'LQa74kkfEk3uvznt_0LyKw', 288.4], // 2546 Florida Ave, Elko, NV 89801
  ['AR', 34.691774, -92.269785, 's058dnNBJVlk4hUxvL6vlQ', 349], // I-530, Little Rock, AR 72206
  ['AR', 36.012683, -94.193522, '0wc9NnAEaPCN1K3e6D7iNg', 16], // 1308 N Wood Creek Ln, Fayetteville, AR 72701
  ['AR', 34.49874, -93.054226, 'QypVvF1VjvrIa-ZSQi_irw', 290.2], // 300 Charteroak St, Hot Springs, AR 71901
  ['MS', 32.253513, -90.235803, '72tj4T2-LjKdsMmN5GsW_Q', 181.6], // 431 Cooper Rd, Jackson, MS 39212
  ['MS', 30.377964, -89.074849, 'WC9DkFUvmluWhw6nVr3IlQ', 118.2], // 1213 23rd St, Gulfport, MS 39501
  ['MS', 34.23567, -88.674991, 'iT4wOw7HFwXttTHwAG_fEA', 347.5], // 2044 S Eason Blvd, Tupelo, MS 38804
  ['KS', 37.706531, -97.283956, 'e3FiGKJI7E-u9prlx1lEgQ', 189.1], // 1302 N Terrace Dr, Wichita, KS 67208
  ['KS', 39.003317, -95.678362, 'maAZCN5ssJCoehTtPLxdWw', 135.3], // 3376 SE Girard St, Topeka, KS 66605
  ['KS', 37.783248, -100.031367, 'b2bY-BpJd4U7GtfrM4c80Q', 317.1], // 2801 Buffalo Dr, Dodge City, KS 67801
  ['NM', 35.049184, -106.613688, 'z7z7riYOVQiun5pUSX_gEA', 216], // new mexico pinon coffee, 2200 Sunport Blvd SE, Albuquerque, NM 87106
  ['NM', 35.665619, -106.005599, 'c5doYOe4AkSJSZtJeo1ifA', 326.6], // 3924 Quail View Ln, Santa Fe, NM 87507
  ['NM', 32.346664, -106.750407, 'kv28Z9zqBZmRrd8lmhUepg', 107.9], // 2984 Scenic Cir, Las Cruces, NM 88011
  ['NM', 33.375837, -104.457785, '8enlaaHQ2oGm9hFZlda9LA', 292.6], // 3622 Lovers Ln, Roswell, NM 88203
  ['IA', 41.278085, -95.882114, 'riOD7HE4nvVHZ_mKC58cVg', 77.9], // 2000 N 25th St, Council Bluffs, IA 51501
  ['NE', 40.789245, -96.709135, '1-wzJbyrkdtOXrR1q62WGA', 138.8], // 2401 S 9th St, Lincoln, NE 68502
  ['NE', 41.101718, -100.701636, '-8rosGKOwNydQdGzMj5z3Q', 153.4], // E Hidden Lakes Rd, North Platte, NE 69101
  ['ID', 43.647379, -116.174048, 'qqSd-z8EH3jYiEMdHEOH-A', 236.7], // 1235 E Highland View Dr, Boise, ID 83702
  ['ID', 43.436152, -112.003815, 'R5Ii5hL0TpIZ1A6rADaQjg', 35.7], // 6855 S 15th E, Idaho Falls, ID 83404
  ['ID', 47.695614, -116.718577, '6GOe8fHTfOg0DXLIKF75Ag', 282.9], // 5320 E French Gulch Rd, Coeur d'Alene, ID 83814
  ['WV', 38.381298, -81.599527, 'VpjFvUG_XtfstXpgGR9VDQ', 141.9], // 2524 Pennsylvania Ave, Charleston, WV 25302
  ['WV', 39.692232, -79.949597, 'B2Fkyeeo-gcqiTFtxFjnjA', 227.4], // 1005 Fort Martin Rd, Maidsville, WV 26541
  ['HI', 21.360424, -157.85528, '4BB9nFEfJ9sIIN2moehgRQ', 178], // 3128 Numana Rd, Honolulu, HI 96819
  ['HI', 19.660071, -155.099131, 'lmM9zAE75_w1iXUW5LZv-w', 253.1], // 185 Alaloa Rd, Hilo, HI 96720
  ['HI', 20.853331, -156.419664, 'sgMl59KZINr8BBGKeN-Ssg', 340.7], // 8001 Pulehu Rd, Kahului, HI 96732
  ['NH', 42.965734, -71.446893, 'UbnNmxz5hDUrLltLoXeWzw', 80], // 622 S Willow St, Manchester, NH 03103
  ['NH', 44.016374, -71.099247, 'D4xJBp07pc4YxfktLYrchQ', 179.8], // 87 Mountain St, Center Conway, NH 03813
  ['ME', 43.706189, -70.217695, 'YW64AB8AukTYim49JeHriQ', 137], // 91 Waites Landing Rd, Falmouth, ME 04105
  ['ME', 44.849984, -68.727724, 'IeNnrhgbJnkZ0OhEzkvnog', 38.3], // I-95, Veazie, ME 04401
  ['ME', 46.632364, -67.969416, 'Syn8_s-FOJvLQYCw90hgTA', 59.9], // 66 Williams Rd, Presque Isle, ME 04769
  ['MT', 45.787435, -108.587945, 'fB20KrIE3pZd98rhNCGPEA', 250.6], // 1710 Westwood Dr, Billings, MT 59102
  ['MT', 46.907607, -113.953244, 'IqHTPltgcM-DAaJbT1WEGw', 293.8], // 5140 Elk Ridge Rd, Missoula, MT 59802
  ['MT', 47.531482, -111.324222, '-MiPgi16pCpZeY_A66Lssg', 123.4], // 2816 6th St NW, Great Falls, MT 59404
  ['MT', 46.447857, -105.902346, '6Nkq28utdJcMwNiHoko9ig', 268.3], // MT-59, Miles City, MT 59301
  ['RI', 41.799213, -71.365721, 'roz_DVZKiyvAiOu4P5jb3g', 207.2], // 9 Gerald St, East Providence, RI 02914
  ['DE', 39.687709, -75.51404, 'B46qw2A3kIZeU6tkAAI0-w', 31], // US-40, Wilmington, DE 19801
  ['DE', 39.099337, -75.522432, 'nxljkRZHfItARjBSgBtxHA', 139.9], // 1201 Voshells Mill Star Hill Rd, Dover, DE 19901
  ['SD', 43.508564, -96.697455, 'oKen7xxa0ZNo6q2wVWE3mA', 183], // 4000 S Birchwood Ave, Sioux Falls, SD 57103
  ['SD', 44.068619, -103.186596, 'Yi3WyNe3B9Sf8MmaBE8uZA', 16.8], // 1734 Creek Dr, Rapid City, SD 57703
  ['SD', 44.411169, -100.335066, 'fnNHqTQEyTwSwDpUBE0_cw', 43], // 29072 Range Rd, Pierre, SD 57501
  ['ND', 46.885202, -96.832164, 'VWxkVoX4W6Sbf582NEbC1Q', 231.3], // 801 34th St N, Fargo, ND 58102
  ['ND', 46.79923, -100.70773, 'hFtMB2Bo0lHB5i5W1ghPTw', 281.2], // 513 Koenig Dr, Bismarck, ND 58504
  ['ND', 48.263579, -101.231086, 'VA-UOwHaFxYXkCdMifBZTA', 209.5], // 2658 42nd St NE, Minot, ND 58703
  ['AK', 61.225435, -149.858552, 'EZkuQW8rSXFwqOkKmKSVzQ', 146.2], // 1201 E Whitney Rd, Anchorage, AK 99501
  ['AK', 64.797307, -147.710737, 'lqBzSWdSpGZl74khjXVVJg', 114.1], // 4400 Cushman St, Fairbanks, AK 99701
  ['AK', 58.319096, -134.554025, 'IbBM6T5a1Rtmp4jh7812Gw', 205.4], // Eaglecrest Rd, Juneau, AK 99801
  ['AK', 60.566871, -151.226484, 'lC591u-SmFZeCBFHMGzKXg', 285.1], // 475 Daubenspeck Rd, Kenai, AK 99611
  ['VT', 44.482472, -73.189157, 'JhHNLFSv-aw_NVJk1dtX1w', 134.8], // 72 Thibault Pkwy, Burlington, VT 05401
  ['VT', 44.298725, -72.535743, 'mu_ZfE9Uob4UUY-cQ6pioA', 275.2], // 2103 County Rd, Montpelier, VT 05602
  ['WY', 41.200153, -104.79757, 'OKI7wJ8E09v7LAIBt5o-xw', 260.2], // 8813 Clear View Cir, Cheyenne, WY 82009
  ['WY', 42.8811, -106.35566, '_dPNb56ANDL2hhVwdc0N9Q', 171.8], // 2765 Kerzell Ln, Casper, WY 82601
  ['WY', 43.508898, -110.707677, 'e8bonM2oopog96-nmDyHLQ', 151.6], // National Elk Refuge Rd, Jackson, WY 83001
  ['DC', 38.964904, -77.061261, 'IR2c1TKj7kr3FLIkxZx6Xg', 231.7], // 2971 McKinley St NW, Washington, DC 20015
]

// mirrors backend/utils/calculateMapScoreFactor: the World map (18150 km across) has a score factor of 2000
const scoreFactorFor = ({ min, max }) => {
  const rad = (d) => (d * Math.PI) / 180
  const a =
    Math.sin(rad(max.lat - min.lat) / 2) ** 2 +
    Math.cos(rad(min.lat)) * Math.cos(rad(max.lat)) * Math.sin(rad(max.lng - min.lng) / 2) ** 2
  const km = 2 * 6371.071 * Math.asin(Math.sqrt(a))
  return (2000 * km) / 18150
}

async function main() {
  const { MONGO_URI, DB_NAME } = process.env
  if (!MONGO_URI || !DB_NAME) throw new Error('MONGO_URI and DB_NAME must be set')

  const client = await new MongoClient(MONGO_URI).connect()
  const db = client.db(DB_NAME)
  const mapId = new ObjectId(US_ID)
  const lats = LOCATIONS.map(([, lat]) => lat)
  const lngs = LOCATIONS.map(([, , lng]) => lng)
  const bounds = {
    min: { lat: Math.min(...lats), lng: Math.min(...lngs) },
    max: { lat: Math.max(...lats), lng: Math.max(...lngs) },
  }

  await db.collection('maps').updateOne(
    { _id: mapId },
    {
      $set: {
        name: 'United States',
        description: 'The land of the free! 50 states of locations waiting for you.',
        previewImg: 'official4.jpg',
        creator: 'GeoHub',
        isPublished: true,
        locationCount: LOCATIONS.length,
        bounds,
        scoreFactor: scoreFactorFor(bounds),
      },
      $setOnInsert: { createdAt: new Date(), avgScore: 0, usersPlayed: 0 },
    },
    { upsert: true },
  )

  await db.collection('locations').deleteMany({ mapId })
  await db.collection('locations').insertMany(
    LOCATIONS.map(([, lat, lng, panoId, heading]) => ({
      mapId,
      lat,
      lng,
      countryCode: 'us',
      panoId,
      heading,
      pitch: 0,
      zoom: 0,
    })),
  )

  console.log(`Seeded United States map ${US_ID} with ${LOCATIONS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
