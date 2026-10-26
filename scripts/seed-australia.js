// Seeds the official "Australia" map. Locations cover every state and territory (big cities, suburbs, coastal and
// country towns, wine regions, Tasmania, the tropical north and the outback), weighted roughly by population and
// Street View coverage. Each one is an official outdoor Google panorama, confirmed to be in Australia by reverse
// geocoding and checked visually.
// Safe to re-run: replaces the locations, keeps play stats.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed-australia.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const AUSTRALIA_ID = '6185e0557b54baf63473a545'

// [state, lat, lng, panoId, heading] - lat/lng is the panorama's position
const LOCATIONS = [
  ['NSW', -33.896117, 151.06815, '7Lvm8HqrzoS6xeEzjreWZw', 220.5], // 01 Wentworth St, Greenacre NSW 2190, Australia
  ['NSW', -33.954368, 151.194023, 'NSYL-T5tj1RamTpxb-ro0A', 202], // 25WV+7J Mascot NSW, Australia
  ['NSW', -33.905581, 151.238494, '7CXSHRNMOY_07WFHd5oePw', 215.6], // 23 Mort St, Randwick NSW 2031, Australia
  ['NSW', -33.911777, 151.270059, 'crE-xwgcBCZMurtWSxGo7Q', 84.4], // 1 Ocean St, Clovelly NSW 2031, Australia
  ['NSW', -33.80362, 151.161795, 'f-o1vto6kBkWdKSU3UIg3w', 207.6], // 10 Hart St, Lane Cove North NSW 2066, Australia
  ['NSW', -33.722112, 151.291859, 'DuKQG8hD5oDUw6E0BcyXXA', 245.5], // 10 Walker Ave, Narrabeen NSW 2101, Australia
  ['NSW', -33.951066, 151.111415, '_efKa-V6xhMJYsqAyVC4lQ', 151.2], // 66B Unwin St, Bexley NSW 2207, Australia
  ['NSW', -33.97551, 151.126786, 'OL9jXC4KDMagzeIeDd2zRg', 93.5], // 289 Princes Hwy, Carlton NSW 2218, Australia
  ['NSW', -32.92955, 151.789909, '9L36PtCPqhiSV5r61H2Paw', 118], // 30 Shortland Esplanade, Newcastle East NSW 2300, Australia
  ['NSW', -32.905084, 151.761957, '0PAlNvHvHsQePcBMZhsy8A', 349.2], // 24 Gross St, Carrington NSW 2294, Australia
  ['NSW', -32.904743, 151.726065, 'jWJ6Z_3D6WpjMOmaVrLIJw', 298.5], // 29 High St, Waratah NSW 2298, Australia
  ['NSW', -34.422287, 150.909383, 'es9rT-ytIc9eFrJFyXpbIg', 126.6], // Wollongong Head Lighthouse, LOT 2 Endeavour Dr, Wollongong NSW 2500, Australia
  ['NSW', -34.474594, 150.912595, 'fIGwKdRbRww1gIfJHNBQFQ', 205.8], // 91 Foreshore Rd, Port Kembla NSW 2505, Australia
  ['NSW', -34.400128, 150.87772, 'hiDaj5ZNM1pbHMcHlwcVDQ', 79.2], // 16 Bellebrae Ave, Mount Ousley NSW 2519, Australia
  ['NSW', -33.384291, 151.391276, 'xMpysA6F0v0qpgkHniJo_Q', 231.2], // 154 Fagans Rd, Lisarow NSW 2250, Australia
  ['NSW', -33.46037, 151.311238, 'DaHGpFtWn9JGAbx_2RciJA', 256.6], // 229 Glenrock Parade, Koolewong NSW 2256, Australia
  ['NSW', -33.740323, 150.236603, 'jBc2byW-IHi39keG-uL5-Q', 295], // 1415 Megalong Rd, Megalong Valley NSW 2785, Australia
  ['NSW', -35.082879, 147.318977, 'sLHSCfDELFaIeAD_2b8vIQ', 221.4], // River Rd, Gobbagombalin NSW 2650, Australia
  ['NSW', -35.132574, 147.313433, '7QYkt8YkXdKATSQ359YVqA', 58.6], // 1058 Olympic Hwy, Moorong NSW 2650, Australia
  ['NSW', -36.027086, 146.959135, 'Q_sZqHW5tq6MYRrJDkxB1A', 195.7], // 41 Birubi Rd, Springdale Heights NSW 2641, Australia
  ['NSW', -33.27568, 149.059204, 'F5AGbnYmwv3xZy7z58V6OA', 290.7], // 456 The Escort Way, Orange NSW 2800, Australia
  ['NSW', -33.299296, 149.099999, '22KHFjLCqOQmSIaXPrvb9A', 118.9], // 3 Peisley St, Orange NSW 2800, Australia
  ['NSW', -33.387429, 149.611496, '8llbW6MpxDnRtqYHQlVwpQ', 74.7], // 130-183 Laffing Waters Ln, Laffing Waters NSW 2795, Australia
  ['NSW', -32.205806, 148.602791, 'U0X0f-rZSH9yvn347kqvtA', 312.2], // 12 R Troy Bridge Rd, Dubbo NSW 2830, Australia
  ['NSW', -32.260155, 148.607301, 'trMLq1EJkljHGJRw3pZ-9Q', 171.9], // 40 Tamworth St, Dubbo NSW 2830, Australia
  ['NSW', -31.048868, 150.889054, 'n63EmyGHjhHUotvRRtELuw', 85.1], // Gemrock, 748A Manilla Rd, Oxley Vale NSW 2340, Australia
  ['NSW', -31.112383, 150.912502, 'Wkfa9OpWZXSbZrto6I3oQA', 57.8], // 14 Central Ave, South Tamworth NSW 2340, Australia
  ['NSW', -30.485235, 151.637101, '4r-CNSfYqikKsqEnWL2ymg', 238.3], // 110 Trevenna Rd, Armidale NSW 2350, Australia
  ['NSW', -31.447605, 152.839499, 'Wt86WnaEQJN6gAW74V8xkw', 118.4], // 19 Glenfern Ave, Thrumster NSW 2444, Australia
  ['NSW', -31.4256, 152.866444, 'YtouraQpffpF4QeZfYmtCw', 265.3], // 100 Tuffins Ln, Fernbank Creek NSW 2444, Australia
  ['NSW', -30.282549, 153.051865, 'Ou1LEg5-oWi4lcmKt9ExRA', 4.1], // P382+XP Upper Orara NSW, Australia
  ['NSW', -30.338137, 153.076746, 'DviCkgcCRm1vJzBCsKOI9g', 335.9], // 645 Pacific Hwy, Boambee East NSW 2452, Australia
  ['NSW', -28.809977, 153.33708, 'owhp_Fg7qUvqJYhDHFnE9Q', 225], // Sunrise Park, Sunrise Cres, Goonellabah NSW 2480, Australia
  ['NSW', -28.682661, 153.593871, 'MWtkXAPUh2ukIRVVInLvmA', 41.5], // 105 Coopers Shoot Rd, Coopers Shoot NSW 2479, Australia
  ['NSW', -29.642946, 152.90637, '7465K_vLyc0JuB9bWjMtOg', 327.2], // 196 Carrs Peninsula Rd, Junction Hill NSW 2460, Australia
  ['NSW', -31.937543, 141.481363, 'XTPAyomPvbn4V3hcljkiCw', 291], // 758 Chapple St, Broken Hill NSW 2880, Australia
  ['NSW', -32.000508, 141.44092, '9NrR0ywW-USMibFwl4Jw-w', 271.4], // Silver City Hwy, Broken Hill NSW 2880, Australia
  ['NSW', -34.236658, 146.032788, '61KzDJTZ907C38c7NGnamg', 54.4], // 6 S Lake Dr, Lake Wyangan NSW 2680, Australia
  ['NSW', -34.789912, 149.699601, 'd2miHmf9CBvT3PcmFGwAew', 112.6], // 5492 Braidwood Rd, Brisbane Grove NSW 2580, Australia
  ['NSW', -34.860493, 150.573861, 'kGZFQWiqq8uNPGg4btS9Cg', 43.9], // 95 Mcmahons Rd, North Nowra NSW 2541, Australia
  ['NSW', -35.72229, 150.166673, 'F-EXndbWYHg7QqF_8f5bLw', 166.1], // 63 Cranbrook Rd, Batemans Bay NSW 2536, Australia
  ['NSW', -36.724272, 149.862675, 'I96IUDfyMHdZP7FZblaf0w', 193.2], // 101 Mountview Cl, Bega NSW 2550, Australia
  ['NSW', -36.370898, 148.595055, 'FK1foJgvQmGujrFArLx5Yw', 37.6], // Kosciuszko Rd, Jindabyne NSW 2627, Australia
  ['NSW', -29.455226, 149.877679, 'BqiU_x7gkP84kSl6334UPA', 294.9], // 526 Gwydirfield Rd, Moree NSW 2400, Australia
  ['NSW', -31.576828, 145.892685, 'BlB5nQgB7V2zhwVWUbs8wg', 194.7], // 35548 B87, Cobar NSW 2835, Australia
  ['NSW', -30.101017, 145.950574, 'wK6m5UBCQCEUarvEk46otQ', 165], // B71, Bourke NSW 2840, Australia
  ['NSW', -30.27436, 149.799725, 'CR1LH7Tl_xPmO53Om8Av8g', 75.2], // 34 Newell Hwy, Narrabri NSW 2390, Australia
  ['NSW', -32.609796, 149.611376, 'XLw5J0JyGO7KPPPmkMraaw', 242.3], // 50 Burrundulla Rd, Burrundulla NSW 2850, Australia
  ['NSW', -33.132161, 148.111279, 'emJaT_0dr5-yrlT4rmAo2w', 52.7], // Brolgan Rd, Parkes NSW 2870, Australia
  ['NSW', -34.465334, 144.888012, '4HEM059z0RUzspXNGIpK6A', 339.7], // Sidonia Rd, Hay NSW 2711, Australia
  ['NSW', -32.845143, 151.369433, '_KMe_llM-otlq-94V4vO9g', 187.3], // 8 Cessnock St, Aberdare NSW 2325, Australia
  ['NSW', -32.292172, 150.859053, 'RtrWiU3XwFfmzdZIzRRwng', 16.4], // Bengalla Rd, Muswellbrook NSW 2333, Australia
  ['NSW', -31.853885, 152.444634, '3VbxMOAeFEFV5VET3-Zi6w', 56.4], // 43 Iluka Cct, Taree NSW 2430, Australia
  ['NSW', -31.0208, 152.850346, 'XKqcLOqXouUZu7lu8uIa1Q', 303.2], // Collombatti Rd, Frederickton NSW 2440, Australia
  ['NSW', -34.366676, 148.306159, 'yGgOJcaUXjQ2v4wCnX5YIQ', 65.2], // 86 Boundary Rd, Young NSW 2594, Australia
  ['NSW', -35.554496, 144.900553, 'H5razCCr_LijB_DU47uO7w', 242.8], // Barham Rd, Deniliquin NSW 2710, Australia
  ['NSW', -29.816403, 151.117427, '_htlKp55FI7r3AJMvrOtUg', 92.5], // 55F2+H4 Goonoowigal State Conservation Area, Inverell NSW 2360, Australia
  ['NSW', -35.218516, 149.235912, 'Kw0lDUZwyb1mTWiPL2YXsw', 184.1], // 215 Old Gold Mines Rd, Sutton NSW 2620, Australia
  ['NSW', -28.561322, 150.316315, 'Cfq1xpVftpoLTN3g_OSLJA', 174], // 34144 Newell Hwy, Boggabilla NSW 2409, Australia
  ['NSW', -33.798377, 151.002914, 'Pd7UDxa0aYwKLEmqIIcX_Q', 301.6], // 557 Church St, North Parramatta NSW 2151, Australia
  ['NSW', -33.795239, 151.092171, 'NpEZZBLftPP-wJZCFqNuSA', 213.5], // 478 Blaxland Rd, Denistone NSW 2114, Australia
  ['NSW', -33.724109, 150.312485, 'SyyeHx50tRTPBHaRtS9CBQ', 280.6], // 24 Darley St, Katoomba NSW 2780, Australia
  ['ACT', -35.205994, 149.093792, 'bZouCQ8cA7xc_nG4t9iDxA', 195.9], // 88 Baracchi Cres, Giralang ACT 2617, Australia
  ['ACT', -35.236664, 149.087967, 'CF5yBuIqt-w1GAJP-1yl5A', 261.6], // 1 Broula St, Bruce ACT 2617, Australia
  ['ACT', -35.263406, 149.114604, '_kX7hF3FtPGTMHArJPeGHw', 238.3], // 41 Miller St, O'Connor ACT 2602, Australia
  ['ACT', -35.374599, 149.103135, '0YJCcw7CXr4Tt2bn32KYXw', 290.3], // 34 Gatton St, Farrer ACT 2607, Australia
  ['VIC', -37.858299, 145.022994, '7mPeLk-aWgz7AgACb9Fw_Q', 142.3], // 5 Orchard St, Armadale VIC 3143, Australia
  ['VIC', -37.841604, 145.135352, 'xlMXcGXZIaQh6R_BE341oQ', 333.1], // 5 Fulton Rd, Blackburn South VIC 3130, Australia
  ['VIC', -37.728199, 145.113145, '3AxKm1hv6Tw_l12anK1vow', 344.3], // 25 Old Eltham Rd, Lower Plenty VIC 3093, Australia
  ['VIC', -37.884088, 145.026954, 'LtDcMYujBXrNC53YdrvaHA', 170.8], // 43A Snowdon Ave, Caulfield VIC 3162, Australia
  ['VIC', -37.815042, 145.028823, 'OVE-JJ3fEU6r-f3IxtQGRA', 290.9], // 6 Hawthorn Grove, Hawthorn VIC 3122, Australia
  ['VIC', -37.740854, 144.938648, 'b-n3YcbOeRuI4C14qJw7nw', 211.5], // 10 Fontaine St, Pascoe Vale South VIC 3044, Australia
  ['VIC', -37.924344, 144.986064, 'ieEbtinCB-WIeoUJmj7Amw', 176.5], // 3XGP+3H, Brighton VIC 3186, Australia
  ['VIC', -37.871388, 144.840085, '-RHb_8LEUmqheFzbp1fU8w', 62.2], // 47 Esplanade, Seaholme VIC 3018, Australia
  ['VIC', -37.878473, 145.173815, 'DxMfn7WwiGllqJ5d77M51Q', 260.6], // 17 Garrisson Dr, Glen Waverley VIC 3150, Australia
  ['VIC', -38.127302, 144.425251, 'qLPFZWq6A4PSBQwmowFYYA', 140.6], // 431 Point Henry Rd, Moolap VIC 3224, Australia
  ['VIC', -38.187328, 144.376096, 'Tq-s4l85J_urNBTOe-ABxw', 9], // 3 Dyson Ct, Breakwater VIC 3219, Australia
  ['VIC', -38.125634, 144.295294, 'DESw4pMuToXtCB9ufYBzkA', 164.6], // 195 McCanns Ln, Fyansford VIC 3218, Australia
  ['VIC', -37.51773, 143.863345, 'R8snBvHfaDuxZ9YTV8NKhA', 51.2], // 43 Slatey Creek Rd N, Invermay VIC 3352, Australia
  ['VIC', -37.618292, 143.851146, 'UvOso-d3M_w0GVoy46uHDQ', 177.2], // 9 Charles Scorer Ct, Magpie VIC 3352, Australia
  ['VIC', -36.748119, 144.346846, 'O3M1NEqgoXziJGVDk_0nGA', 89.6], // Tresize Track, Wellsford VIC 3551, Australia
  ['VIC', -36.743964, 144.254593, '0POW0-dI9j4mZyUfr7sYpg', 353.2], // 34 Cunneen St, Long Gully VIC 3550, Australia
  ['VIC', -36.36213, 145.367262, 'u3PPugcuG2km_5jgQrDUCA', 23.2], // J9Q8+4W Shepparton VIC, Australia
  ['VIC', -36.347872, 146.276368, 'Qp1YcPgWeOGfsaGm9zYVdA', 298], // 553 Reith Rd, Wangaratta VIC 3677, Australia
  ['VIC', -34.210074, 142.123799, 'iVi2SXW-VWpsAx9KTxa4Lw', 61.6], // 48 Albert St, Mildura VIC 3500, Australia
  ['VIC', -34.168156, 142.079042, 'AlbHwv_q0yB-jvvfuyo9Ug', 34.7], // 249 Commercial St, Merbein VIC 3505, Australia
  ['VIC', -38.375693, 142.471277, 'w9ILrRSnmf1a_huy6Z6UvA', 58], // 341 Lava St, Warrnambool VIC 3280, Australia
  ['VIC', -38.354671, 142.542057, 'LdYnqhNBipMzoMqRMixJsg', 138.1], // 364 Wangoom Rd, Warrnambool VIC 3280, Australia
  ['VIC', -38.336532, 141.537603, 'YKmrYYpGZF_6oJ7YIAgHIA', 140.8], // 77 Atwells Rd, Portland West VIC 3305, Australia
  ['VIC', -36.696819, 142.216197, 'X73DUaeiSrPV04cKUKj7yg', 93.6], // 133 Rasmussen Rd, Dooen VIC 3401, Australia
  ['VIC', -38.203967, 146.588789, 'IpVQPoYGGjDXnUye1vYX7Q', 244.9], // 185 Traralgon Crk Rd, Traralgon East VIC 3844, Australia
  ['VIC', -38.179767, 146.525648, 'QSOHeXLwGfyNmWb6gmM6UA', 62.5], // 108 St Georges Rd, Traralgon VIC 3844, Australia
  ['VIC', -38.122027, 147.092479, 'g3r4Db-s8Pxih0Vyrk1C6Q', 77.2], // 107 Stevens St, Sale VIC 3850, Australia
  ['VIC', -37.819584, 147.614617, '2JLhG2AlBjCiCUL4dJcFLQ', 120.4], // 28 Warde St, Bairnsdale VIC 3875, Australia
  ['VIC', -37.83656, 148.003502, 'SYL3xYdz8w_SjqdMgFmrsA', 294.6], // 106 Hoggs Ln, Lakes Entrance VIC 3909, Australia
  ['VIC', -38.608801, 145.620353, 'Hf49Jdpoa-Kl3jYPlqWKmQ', 87], // 5261 B460, Wonthaggi VIC 3995, Australia
  ['VIC', -38.3934, 144.957404, 'LKyBSVmg8Zk59QSzZK9rxg', 271.7], // 458 Purves Rd, Main Ridge VIC 3928, Australia
  ['VIC', -38.553358, 143.983561, 'uW1K1iojcN9lMx50H0R8Xw', 206.8], // 3 Hird St, Lorne VIC 3232, Australia
  ['VIC', -38.716943, 143.707202, 'Ucjeo9mcZBu4GtzeZ_s8xQ', 278.3], // 250 Skenes Creek Rd, Skenes Creek VIC 3233, Australia
  ['VIC', -36.12268, 144.800783, 'z-tDYxRqqLw4C3au-i2Uvw', 348], // 168 River Ave, Echuca Village VIC 3564, Australia
  ['VIC', -35.344628, 143.526847, 'SaoAn8LUvEtlK7xRnjdkXQ', 295.2], // 39 Acacia St, Swan Hill VIC 3585, Australia
  ['VIC', -36.714348, 146.966127, '5YPatcQytgCy6FUSiKTw4A', 18.4], // 110 Mount Porepunkah Rd, Bright VIC 3741, Australia
  ['VIC', -37.098168, 146.132281, 'grWcc1WBsIzY5pmRmMsuWQ', 342.8], // 740 Mansfield-Woods Point Rd, Mansfield VIC 3722, Australia
  ['VIC', -37.697523, 142.049647, 'V3AlBUDb--fMlT0y3rHrXw', 36.9], // 442 Hartwichs Rd, Hamilton VIC 3300, Australia
  ['VIC', -37.316312, 142.957117, 'tCMUtQc8ZqIJS2a3d6tcAQ', 320.4], // 17 Quarry Rd, Ararat VIC 3377, Australia
  ['VIC', -37.056062, 145.115272, 'tkJsKP68Xza5bSrLVI8jtA', 157.2], // 415 Schoolhouse Ln, Hilldene VIC 3660, Australia
  ['VIC', -37.653037, 145.490945, 'VlntVS-Ce3H32v_5mQ6WlQ', 159.3], // Mount Vue Rd/Healesville-Yarra Glen Rd, Healesville VIC 3777, Australia
  ['VIC', -37.036515, 144.158885, 'xbqqmYuaTOfPsMMxrmmXzg', 286.3], // Halls Ln, Muckleford VIC 3451, Australia
  ['VIC', -38.330533, 143.591764, 'd8X4uIK_gKmrtm0gRGrLAA', 89.5], // MH9R+PW, Colac VIC 3250, Australia
  ['QLD', -27.438807, 153.02791, 'vAwrePXC8k4gkGTHC8tKKA', 359.7], // 69 Swan Terrace, Windsor QLD 4030, Australia
  ['QLD', -27.394143, 153.128924, 'Cyvdg2anUy1ZShGK5Gq3Qw', 349.3], // 24 Baeckea St, Brisbane Airport QLD 4008, Australia
  ['QLD', -27.435781, 153.111167, 'rGp4Qn26E8fmEXWk6kGAEg', 209.6], // 6 MacArthur Ave Central, Pinkenba QLD 4008, Australia
  ['QLD', -27.523655, 152.979535, 'GkLejxvLA_iZ0CqnH-mJEw', 305.9], // 30 Dan St, Graceville QLD 4075, Australia
  ['QLD', -27.501128, 152.971644, 'RzWi8WSjUxpeExZX75_NVw', 239.3], // 89 Station Rd, Indooroopilly QLD 4068, Australia
  ['QLD', -27.60714, 152.931626, 'gLfg1TlAq5s7BvCLiFYXKQ', 325.3], // 260 Waterford Rd, Wacol QLD 4076, Australia
  ['QLD', -27.351078, 153.105532, 'UttDAsLfMMnI4nfKeGiXEQ', 127.9], // J4X4+G6, Nudgee Beach QLD 4014, Australia
  ['QLD', -27.45997, 153.075035, 'B_91PmOAoxSRP31Pt6wUPA', 212.9], // 56 Skirving St, Morningside QLD 4170, Australia
  ['QLD', -27.971257, 153.353332, 'IhXBLHPsn5HtKe7BNS0NsQ', 91.7], // 15 Kingsway Dr, Molendinar QLD 4214, Australia
  ['QLD', -27.995781, 153.430518, 'fw1-50TxXfw7-cpe6QpJcQ', 32.9], // And The Esplanade, Cnr Staghorn Ave, Surfers Paradise QLD 4217, Australia
  ['QLD', -27.973625, 153.403016, 'Uf9l3n_GsItIQk9Bz6Ewjw', 189.2], // 167 Nerang St, Southport QLD 4215, Australia
  ['QLD', -28.02946, 153.362496, 'YfvYaqniniwWcR11OdzQLg', 330.4], // 38 Hastings Cres, Carrara QLD 4211, Australia
  ['QLD', -26.602052, 153.097204, '_Xtm0DbNQzVAei6X5Ao85g', 93.7], // Unit 1/903 David Low Way, Marcoola QLD 4564, Australia
  ['QLD', -26.68166, 153.137251, 'sCf3EVEd6uojjI3oDL6PEA', 210.5], // 31 Pacific Blvd, Buddina QLD 4575, Australia
  ['QLD', -26.671667, 153.040589, 'BKPI6D-APYhZ6cNyvi6XOA', 314.5], // 9 Lutana Cct, Buderim QLD 4556, Australia
  ['QLD', -27.549427, 152.018546, 'beBuFhAHezxyaIcQh8Yj1g', 332.3], // 9 Pepperwood Pl, Withcott QLD 4352, Australia
  ['QLD', -27.561552, 151.944447, 'QYKrywKeyPZKxt0UUG3xFg', 274.5], // Laurel Bank Park, 50 Hill St, Toowoomba City QLD 4350, Australia
  ['QLD', -27.591707, 152.709383, 'LuzkHdxnfsCf9sJUQcDATw', 194.8], // 109-143 Haggartys Ave, Karrabin QLD 4306, Australia
  ['QLD', -19.277534, 146.841266, 'a63k4DSgPX0anSDHnoZ6RQ', 293.6], // Southern Port Rd, Stuart QLD 4811, Australia
  ['QLD', -19.270035, 146.759395, 'aKrRv69als84s-L56nO5CA', 136.3], // 59 Duckworth St, Garbutt QLD 4814, Australia
  ['QLD', -19.270361, 146.778947, 'h_qBz1qcywIFc6lV3c7e-g', 317.3], // 11/238-262 Woolcock St, Currajong QLD 4812, Australia
  ['QLD', -16.903358, 145.812274, 'j3UZ_wdhXq2oD4wl079D_g', 83.2], // 110 Pine Creek - Yarrabah Rd, East Trinity QLD 4871, Australia
  ['QLD', -16.922184, 145.811515, '6CHpjBXObCYf4dsuVfctiw', 119.8], // 25 Pine Creek - Yarrabah Rd, East Trinity QLD 4871, Australia
  ['QLD', -16.948705, 145.80379, 'ZRKGHeTtt8kM93QbaSk1Ng', 172.3], // Lee Yan Rd, Glen Boughton QLD 4871, Australia
  ['QLD', -21.125486, 149.219704, 'rEU-625Z77r9b8ag4IAYJA', 345.8], // 23 Seashore Cres, Mackay Harbour QLD 4740, Australia
  ['QLD', -21.118841, 149.157099, 'Mf2f29E7lt91YrVtWdg44g', 102.4], // 14 Macquarie St, Mount Pleasant QLD 4740, Australia
  ['QLD', -23.328328, 150.474518, 'jkGSpUi5CL7t1EApKB7VxQ', 261.6], // 291-297 Six Mile Rd, Pink Lily QLD 4702, Australia
  ['QLD', -23.368919, 150.549514, 'N48AMaYDXVC6p61fjiKfQA', 223.9], // 324 Pain St, Koongal QLD 4701, Australia
  ['QLD', -24.821163, 152.347409, 'G1N5yg3P9mghrgWJH7KTnQ', 68.7], // 6 Billabong Dr, Gooburrum QLD 4670, Australia
  ['QLD', -24.901163, 152.359556, 'a3JcOR0X5arKFxJuD43eeA', 88.7], // 44 Wyllie St, Thabeban QLD 4670, Australia
  ['QLD', -25.344107, 152.876333, '_mWAh7GD8Oir9p4gTxl9Ug', 358.5], // Booral Rd, Booral QLD 4655, Australia
  ['QLD', -23.866911, 151.253164, 'tSn418MAUbJtnybYE6GVxw', 232.8], // 8 W Ridge Cres, West Gladstone QLD 4680, Australia
  ['QLD', -26.175815, 152.683798, '-TbvAKiW2DSH3WbTHUVyBg', 190.4], // 33 Barton Rd, Victory Heights QLD 4570, Australia
  ['QLD', -20.743807, 139.474627, '2hkjwcpM1dXXfiZ89mrxuw', 264.3], // 5 Spruce St, Mount Isa QLD 4825, Australia
  ['QLD', -20.777707, 139.483773, '4ewNzaA-DjpUmKcUlv-H9w', 118.5], // Boulia Mount Isa Hwy, Mount Isa QLD 4825, Australia
  ['QLD', -23.493746, 144.241363, 'b7CMw2NXDANkOv3bD0mzAw', 85.1], // Thomson Developmental Rd, Longreach QLD 4730, Australia
  ['QLD', -26.394965, 146.2169, '3QXPsu310YQH_yPsnYj3uA', 91.5], // 175 Diamantina Developmental Rd, Charleville QLD 4470, Australia
  ['QLD', -26.590939, 148.839244, 'uDgLvfM-JXhP__9NkqTkTw', 65], // 330 Roma Downs Rd, Roma QLD 4455, Australia
  ['QLD', -23.518831, 148.190481, 'gnTAApuWYOD6UUwVRptxfw', 273.9], // 80 Codenwarra Rd, Emerald QLD 4720, Australia
  ['QLD', -20.290467, 148.775836, 'hL3szZ8ZozZ1ZzWoPryLBA', 46.9], // 3264 Shute Harbour Rd, Shute Harbour QLD 4802, Australia
  ['QLD', -20.024659, 148.265822, 'HBOeFew_vHnjMfpv0KNUlA', 73.3], // Dalrymple Point Rd, Coral Sea QLD 4805, Australia
  ['QLD', -17.526645, 146.02336, 'cu1CrnxRoR5FVdYeV5DycA', 200.9], // 8 Kookaburra Cl, Innisfail QLD 4860, Australia
  ['QLD', -16.539435, 145.466147, 'NVQDVrQ8rtsh3mljh8H-qA', 228.4], // 1-3 Owen St, Craiglie QLD 4877, Australia
  ['QLD', -17.321069, 145.440618, 'SzlxnePsNk7kAtI1uf8eeQ', 334.2], // 803 Atherton Herberton Rd, Wongabel QLD 4883, Australia
  ['QLD', -20.051909, 146.313818, '389yWEPXbiBVnVB_S2mGJg', 176.7], // A6, Broughton QLD 4820, Australia
  ['QLD', -28.211736, 152.108139, 'r6RdT07Wu8NiZspYcZGgRg', 122.3], // Hermitage Emuvale Rd, The Hermitage QLD 4370, Australia
  ['QLD', -28.630987, 151.976641, 'dJ2Pf7Ki8b16LVWLdTIjWA', 227.7], // 22 Eastern Colour Rd, Applethorpe QLD 4378, Australia
  ['QLD', -27.227428, 151.240739, 'NxiDmgz4rs-17JQ4pG6S3Q', 337.2], // 554 Wilds Rd, Dalby QLD 4405, Australia
  ['QLD', -26.570841, 151.865066, 'EN3kTdZWLuBTGCc5nqTI1w', 247.4], // 15995 D'Aguilar Hwy, Kingaroy QLD 4610, Australia
  ['QLD', -20.66788, 140.522462, 'ExgpnqPq8uxKmJE3bP8PqQ', 131.8], // Ernest Henry Rd, Cloncurry QLD 4824, Australia
  ['QLD', -12.658884, 141.860894, '_NdNnH9lWJ0ms0PQ_ldc7w', 125.9], // Florence Hibberd Dr, Mission River QLD 4874, Australia
  ['QLD', -15.511681, 145.22527, 'XPJbyoUhW544V7LWWgteaQ', 254.1], // State Route 40, Cooktown QLD 4895, Australia
  ['WA', -31.879952, 115.773358, 'iE_uSjSd5Xm-ZKX_QnlxqQ', 195], // 51 Jeanes Rd, Karrinyup WA 6018, Australia
  ['WA', -31.941609, 115.916568, '8nlq_wyZQuEZzxTsotNnbg', 253.8], // LOT 221 Tidewater Way, Ascot WA 6104, Australia
  ['WA', -32.046422, 115.731828, '72K0AjZ33sJb7fWT7ffzdw', 114.3], // 21 N Mole Dr, North Fremantle WA 6159, Australia
  ['WA', -32.042825, 115.831484, 'BoNvZkm4dK-aYSPHHUGNeg', 313.1], // 43 Hatfield Way, Booragoon WA 6154, Australia
  ['WA', -31.945211, 115.755795, 'FAbV81ZvHPGklmNrypBfEw', 191.8], // 56 Branksome Gardens, City Beach WA 6015, Australia
  ['WA', -31.795666, 115.9195, '5n_pYVBjjVLE9n2PC0kdhg', 357.3], // 729 Gnangara Rd, Cullacabardee WA 6079, Australia
  ['WA', -32.082537, 115.752451, 'cOGm8jhjUl3AqRzKRKcWTQ', 248.4], // 25 Rollinson Rd, North Coogee WA 6163, Australia
  ['WA', -31.779811, 115.838768, 'a1cXGtS_Dag3UT-lZ9ZZeg', 314.9], // 294 Benmuni Rd, Wanneroo WA 6065, Australia
  ['WA', -32.471858, 115.748695, 'Yet0w83Q6AdY7MCkx-0QHQ', 345.1], // 15 Parmelia Way, Madora Bay WA 6210, Australia
  ['WA', -32.5107, 115.739388, 'wYr0xCEVbQmeS6IYWAJ8kQ', 171.5], // Gordon Rd Before Shepherd Rd, Mandurah WA 6210, Australia
  ['WA', -33.319309, 115.689112, '823UfSU9GNSR0I3SnPcRIw', 182], // Foreshore Park, Estuary Dr, Pelican Point WA 6230, Australia
  ['WA', -33.327674, 115.649757, 'NUc-7nwfitwHWBoI6N-Y9g', 263.4], // 127 Stirling St, East Bunbury WA 6230, Australia
  ['WA', -33.706791, 115.389504, 'QAKiSzory8mnS_8ABcE4fw', 299.7], // Acton Park Rd, Yoongarillup WA 6280, Australia
  ['WA', -33.970561, 115.083335, '0CWv_Yyh9ZQUV5uQZeCDLg', 335.6], // 7A Bottlebrush Dr, Margaret River WA 6285, Australia
  ['WA', -35.002895, 117.85953, 'gKHihRSeM1o0MuX8Trdm1A', 35.8], // 50 Parker St, Lockyer WA 6330, Australia
  ['WA', -35.056689, 117.854562, 'dMVvxCvFfGD8i6j6e3mnTw', 26.6], // 441 Frenchman Bay Rd, Torndirrup WA 6330, Australia
  ['WA', -33.833896, 121.966784, 'LUfxtJFk5ZgstwP5JewK0w', 303.4], // Wylie Bay Rd, Bandy Creek WA 6450, Australia
  ['WA', -30.691236, 121.466313, 'eEVgTbcoiBU_eFSr45RiXA', 274.7], // Goldfields Hwy, Mullingar WA 6430, Australia
  ['WA', -30.80135, 121.488128, 'cwtI-HGMdngxt3tXoiVGGQ', 52.7], // Anzac Dr, Broadwood WA 6431, Australia
  ['WA', -28.790336, 114.597282, 'xuGMpHZv3POmAsvLmedkaw', 352], // 133 Separation Point Cl, Beachlands WA 6530, Australia
  ['WA', -28.784048, 114.660721, 'byi5fUgAq_Gk-O1zv9BXuw', 13], // 111 Edward Rd, Utakarra WA 6530, Australia
  ['WA', -27.722108, 114.154326, 'mLjMXoxpbPREp_L1203WUw', 237.5], // Siphon Rd, Kalbarri WA 6536, Australia
  ['WA', -24.875733, 113.630093, '4C4ePRuyH63JEfd80B20fA', 231.5], // 1 Annear Pl, Babbage Island WA 6701, Australia
  ['WA', -21.903101, 114.118454, 'R7E_ekos9ATG71nYAsY1Gw', 230.1], // 34W9+Q9 Exmouth WA, Australia
  ['WA', -20.798494, 116.825329, 'RKKIhIhnLqZSjY-_tbHq3A', 359], // North West Coastal Hwy, Cooya Pooya WA 6714, Australia
  ['WA', -20.325741, 118.662354, '9vcD9Qh1SgiqPWYzC0EZ7g', 329.2], // Gray St, Port Hedland WA 6721, Australia
  ['WA', -17.960664, 122.241856, '_GaQ1Bekjhij2WOkVyA8mg', 128.6], // Moonlight Bay Apartments, 49 Carnarvon St, Broome WA 6725, Australia
  ['WA', -17.296129, 123.617774, '3qlwU2zJxcmvud3iVRrNDw', 61.2], // PJ39+G4 Derby WA, Australia
  ['WA', -15.735669, 128.736185, 'JJtk3f32Os-FTJpqRRXz3A', 15.3], // 68 Whimbrel Rd, Kununurra WA 6743, Australia
  ['WA', -23.322195, 119.724444, '2aFRxzhn2HmOlaOOqc5SdQ', 207.9], // Great Northern Hwy, Newman WA 6753, Australia
  ['WA', -31.589638, 116.650238, 'y7j5lpsx-ojVfY1Jp5-mGA', 278.3], // 454 Beering Rd, Irishtown WA 6401, Australia
  ['WA', -32.906968, 117.174587, 'YSZnGJc74jLHoP-YB43G-w', 133.2], // 35VF+6R Hillside WA, Australia
  ['WA', -31.520494, 118.274014, 'AnxxGZsv-ZNg78ER-qKvgQ', 189.8], // York Merredin, Merredin WA 6415, Australia
  ['WA', -33.662016, 117.51404, 'cC655xq9QknMtaf00GK0bw', 191.9], // Trimmer Rd, Katanning WA 6317, Australia
  ['WA', -34.969682, 117.282991, 'jGLD4vXxtdqo7DmdWn0DEA', 280.4], // 78 Illsley Dr, Shadforth WA 6333, Australia
  ['WA', -34.272666, 116.19928, 'UJ0jExrAIeNV2VUJ-fiLrw', 202.3], // Muir Hwy, Middlesex WA 6258, Australia
  ['WA', -33.312381, 116.115509, 'BAyaw1o0wctAEzIGW4UHwA', 281.9], // Mornington Rd, Harris River WA 6225, Australia
  ['WA', -30.627191, 115.941174, '4Brk7JWIjw6oat8wPk6b-A', 229.2], // Dandaragan Rd, Moora WA 6510, Australia
  ['WA', -32.14408, 121.812876, 'L2aWrBn2T1kZMH1pJ30gUQ', 91.7], // National Highway 1, Norseman WA 6443, Australia
  ['WA', -22.703172, 117.762677, 'mOO2SYNDPz4AIBzpiLfN0Q', 28.1], // 7QW7+P3 Tom Price WA, Australia
  ['WA', -17.969973, 122.219731, '21lgudwU8X_rQJfVPEOWag', 255.1], // 44 Blackman St, Broome WA 6725, Australia
  ['SA', -34.990456, 138.681807, 'LMoFxWnPOBCD6_iax2X0aw', 344.4], // 66 Emmett Rd, Crafers West SA 5152, Australia
  ['SA', -35.007067, 138.511919, 'NL9FbiDPBAoRcg_wrSYTsg', 123.6], // 84 Esplanade, North Brighton SA 5048, Australia
  ['SA', -34.912049, 138.75684, 'F96zf5maXq_OXmqH1a92vg', 250.6], // 23 Moores Rd, Cherryville SA 5134, Australia
  ['SA', -34.846996, 138.631236, 'DlES52KJTi1xAcNJGeT0jw', 249.8], // 30 Stonewell Common, Northgate SA 5085, Australia
  ['SA', -34.83512, 138.500524, '6yNW1zxzFPhE_BJUl4SbxQ', 149.9], // 4 Levi St, Birkenhead SA 5015, Australia
  ['SA', -34.871373, 138.51398, 'AFFWWaTV_jzSy97D9fAU3g', 243.6], // 44 Paqualin St, Hendon SA 5014, Australia
  ['SA', -37.86383, 140.816342, 'dIQXqlTBaQIitFEsVOigew', 258.1], // 200 Square Mile Rd, Yahl SA 5291, Australia
  ['SA', -37.784854, 140.826109, 'hD2vjEvKHtgI2f1S3ZWaHQ', 86], // 8 Rexwells Court, Mil-Lel SA 5291, Australia
  ['SA', -34.563069, 138.975144, 'Keruozelrla-Ya1ftUmDzA', 257.5], // 279 Krondorf Rd, Krondorf SA 5352, Australia
  ['SA', -33.837291, 138.587874, '_wnvhER2gfeGLzPGnAxSEw', 119.7], // 57 Emu Flat Rd, Armagh SA 5453, Australia
  ['SA', -32.484873, 137.724317, 'zX82n8GI7C7rdawUac3WGA', 237.7], // National Highway A1, Port Augusta West SA 5700, Australia
  ['SA', -33.021397, 137.574051, 'C2lpDjQzX_svI6L5UvDaFQ', 251.8], // Lincoln Hwy, Whyalla Barson SA 5601, Australia
  ['SA', -34.736743, 135.813526, 'yQEZlOWYBnbqqyRAcClUpA', 211.8], // 87 Concorde Rd, Duck Ponds SA 5607, Australia
  ['SA', -32.178559, 133.689595, '59Yxp9hMgykxy4x-XQd2gQ', 198.1], // 149 Bosanquet Blvd, Ceduna Waters SA 5690, Australia
  ['SA', -29.006247, 134.780926, 'H7Tr_poMLWUqy9TF6H65XA', 256], // 1665 Crows Rd, Coober Pedy SA 5723, Australia
  ['SA', -33.208787, 138.050722, 'OpZFzL3OlcpR3-rHkG7thw', 152.2], // Old Race Course Rd, Pirie East SA 5540, Australia
  ['SA', -35.092851, 139.266385, 'JtraR5RJtcZPoN2x9D4ZtQ', 279.8], // 24 Doyle Rd, Mobilong SA 5253, Australia
  ['SA', -34.144149, 140.719279, 'oOfUPAcM1ZP1lYT2EKaZzw', 1.7], // 16 Kulkyne St, Renmark West SA 5341, Australia
  ['SA', -36.913141, 140.761886, 'lrVFw8lCzzwveWlAJ5_JBg', 248.4], // 261 Hampton Rd, Wild Dog Valley SA 5271, Australia
  ['SA', -35.732004, 137.583983, 'UKdSUp6nlGyf-M3ecRuGpg', 112.2], // 8 Nepean Esplanade, Nepean Bay SA 5223, Australia
  ['SA', -30.574699, 136.893939, 'rxa5eppXq9UQAJfJk7R6Cw', 277.3], // Olympic Way, Roxby Downs SA 5725, Australia
  ['SA', -33.943752, 137.692178, '9OCE9nzBgXH94n82xGp3mQ', 223.5], // 283 Dunn Rd, Kadina SA 5554, Australia
  ['SA', -35.024112, 138.819795, 'mh5Rt8GapBR1t6iZ0hV4YQ', 322.7], // 16 Balhannah Rd, Hahndorf SA 5245, Australia
  ['SA', -35.556751, 138.625745, '4-Fc1cClTQ_Z1fzp27ebgA', 301.2], // 1 Granite Island Rd, Victor Harbor SA 5211, Australia
  ['TAS', -42.840893, 147.206909, 'bdew4YkzXq6PVSQEp7m9lQ', 37.1], // 78 Church Rd, Collinsvale TAS 7012, Australia
  ['TAS', -42.874065, 147.258554, 'v4gDuqJr1LkK-Y6taotIuQ', 131.4], // 387 Lenah Valley Rd, Lenah Valley TAS 7008, Australia
  ['TAS', -42.925634, 147.41238, 'w0ZiYAjCmj-zJ-FDpJdMqg', 194.9], // 24 Anchorage Ct, Tranmere TAS 7018, Australia
  ['TAS', -42.890888, 147.337041, 'YadfoSAMjg0GmTCGf0Xv5w', 263], // 7 Mona St, Battery Point TAS 7004, Australia
  ['TAS', -41.418248, 147.113785, 'KYp7HtXMagcM0HC51UlEIg', 312.7], // 29 Benson Ct, Riverside TAS 7250, Australia
  ['TAS', -41.441694, 147.115053, 'kQJm7WpE0dhzmAFDSaHIvA', 150], // 27 Coniston Pl, Trevallyn TAS 7250, Australia
  ['TAS', -41.37596, 147.151241, 'RXbW5V8UeW5iTO3Jj4wA8A', 71.2], // Russells Plains Rd, Rocherlea TAS 7248, Australia
  ['TAS', -41.219154, 146.381365, 'HS6bytNn4vn_1g7L6DV2MA', 126.6], // River Rd, Latrobe TAS 7307, Australia
  ['TAS', -41.050092, 145.908646, 'ZTOMIHoYC4kZ-xsrkADjVA', 118.4], // 3 North Terrace, Burnie TAS 7320, Australia
  ['TAS', -42.085969, 145.557959, 'Gl7PS3JLdvGihWm0eL6w2g', 113.5], // 16 Colville St, Queenstown TAS 7467, Australia
  ['TAS', -42.190435, 145.364227, '8DxYPFs52zCZkF1kmnkLOA', 140.7], // Lowana, Strahan TAS 7468, Australia
  ['TAS', -41.31505, 148.249191, 'jl4vDwKV6I-ThVhgtFIXWg', 92.9], // 111 Cecilia St, St Helens TAS 7216, Australia
  ['TAS', -42.130058, 148.047408, 'TiI6ODKNEVwN_iFUyxpBfQ', 318.8], // 120 Maria St, Swansea TAS 7190, Australia
  ['TAS', -43.00153, 146.993858, '_MQ7OKUjQbGgbg5_wG9eRw', 195.7], // 122 Waggs Gully Rd, Ranelagh TAS 7109, Australia
  ['TAS', -42.784002, 147.102873, 's4HNCVa9oTMK5nJRhIk_0A', 82.7], // 1257 Lyell Hwy, Sorell Creek TAS 7140, Australia
  ['NT', -12.429579, 130.951425, 'QIXbZs0sixQf1WI-3FmqAg', 110.4], // 1140 McMillans Rd, Knuckey Lagoon NT 0828, Australia
  ['NT', -12.459838, 130.829019, '37qtm0qwD6zrPcWATnRsXA', 261.2], // 12 Larrakeyah Terrace, Larrakeyah NT 0820, Australia
  ['NT', -12.506145, 130.723498, 'yJbxRF2DsGZAOLmxJSdwKQ', 330.9], // B34, Cox Peninsula NT 0822, Australia
  ['NT', -12.471038, 130.844063, '3uIwro3Q3LKYQVkVCH83yg', 241.1], // Fort Hill Parkland, Anchorage Court, Darwin City NT 0800, Australia
  ['NT', -23.721125, 133.887151, 'GFxFhfA5kwv5P0HoVAKGBw', 269.2], // 143 Stephens Rd, Desert Springs NT 0870, Australia
  ['NT', -23.670542, 133.883936, 'wXPEj_9SfK0oYWegM1uuLA', 280.6], // 87 Herbert Heritage Dr, Stuart NT 0870, Australia
  ['NT', -23.734751, 133.870398, '_JC87ylFc9SE0AiSfAAoVQ', 282], // 15 Ragonesi Rd, Ross NT 0873, Australia
  ['NT', -14.480817, 132.320151, 'qjcQah2Hy_eW4QR4cv3bFA', 295.5], // 554 Stuart Hwy, Uralla NT 0852, Australia
  ['NT', -14.436211, 132.227996, 'rTb1QYKtWkOkbQ9cw0LVMw', 77.3], // 8627 Stuart Hwy, Emungalan NT 0850, Australia
  ['NT', -19.653347, 134.176567, 'sb0KW3IPzff59_lH8YhrUA', 162], // 133 Standley St, Tennant Creek NT 0860, Australia
  ['NT', -25.262068, 130.97314, 'IGS3qw1Djro9h8_4bh5Y0g', 74.1], // Uluru Rd, Yulara NT 0872, Australia
  ['NT', -12.651603, 132.795618, 'bcgtJnFElLRIYooG5Un01Q', 255], // Arnhem Hwy, Kakadu NT 0822, Australia
  ['NT', -13.048108, 131.050511, 'mo4sqjjACXUqCZ-1XvRGJQ', 19.5], // 923 B30, Batchelor NT 0845, Australia
  ['NT', -12.547996, 131.049525, 'xrWsPmDQj49oUfqHGRVVCQ', 221.1], // 50 Carambola Rd, Virginia NT 0834, Australia
  ['NT', -14.978067, 133.078799, '-ZuKfkpDEo_KOSQm1kXsXA', 50.4], // National Highway 1, Mataranka NT 0852, Australia
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
  const mapId = new ObjectId(AUSTRALIA_ID)
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
        name: 'Australia',
        description: 'From Sydney Harbour to the red centre, explore the land down under!',
        previewImg: 'official30.jpg',
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
      countryCode: 'au',
      panoId,
      heading,
      pitch: 0,
      zoom: 0,
    })),
  )

  console.log(`Seeded Australia map ${AUSTRALIA_ID} with ${LOCATIONS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
