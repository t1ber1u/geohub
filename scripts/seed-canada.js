// Seeds the official "Canada" map. Locations cover all provinces and territories (cities, small towns,
// highways, prairie and Arctic roads), weighted roughly by population and Street View coverage. Each one is an
// official outdoor Google panorama, confirmed to be in Canada by reverse geocoding and checked visually.
// Safe to re-run: replaces the locations, keeps play stats.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed-canada.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const CANADA_ID = '6185dff27b54baf63473a541'

// [province, lat, lng, panoId, heading] - lat/lng is the panorama's position
const LOCATIONS = [
  ['ON', 43.629892, -79.424651, 'pKf-0EoPZ84Rt2yJ-Uuo1Q', 334], // 296 Lake Shore Blvd W, Toronto, ON M6K 3C3
  ['ON', 43.62051, -79.396033, '-8Ez15Z8KdOHE-hAkVpsHA', 338.5], // JJC3+6H Toronto, ON
  ['ON', 43.668138, -79.383035, 'LVk0Cll-xkPiYbnS8cIgnw', 343.7], // 52 Isabella St, Toronto, ON L3R 5C9
  ['ON', 43.665744, -79.44152, 'lRNIJFxy7o5ZntIeZzjq6A', 349.9], // 81 Lappin Ave, Toronto, ON M6H 1Y3
  ['ON', 43.594231, -79.607409, 'eVpBzHSXR7fEGavHL-y6tA', 317.7], // 526 Silver Creek Blvd, Mississauga, ON L5A 2B3
  ['QC', 45.429638, -75.707516, 'H_ds8U5T2feL2jH3E3upYg', 88.4], // 100 Rue Laurier, Gatineau, QC K1A 0M8
  ['ON', 45.390838, -75.733405, 'knziCdXf3j0UIhr_W7tLvg', 105.5], // 637 Island Park Crescent, Ottawa, ON K1Y 3P4
  ['ON', 43.26671, -79.902164, 'vyCkbbBdDhtTrhvX_fBA2w', 262], // 58 Parkside Dr, Hamilton, ON L8S 3Y2
  ['ON', 42.950068, -81.304056, '90ojOcudBS5z7bPjCx378Q', 173.3], // 587 Cranbrook Rd, London, ON N6K 2Y4
  ['ON', 43.434168, -80.464425, 'FF_2fqgZUw9JGIqlfgDN5A', 226], // 51 Carwood Crescent, Kitchener, ON N2G 3C6
  ['ON', 42.310962, -83.031158, '2vuwoJ-K6H8VY6SLPk9yVw', 262.2], // 954 Windsor Ave, Windsor, ON N9A 1K2
  ['ON', 44.277453, -76.443433, 'FrlChiqIkkdbxSJAWBdjkQ', 132.3], // 239 Pauline Tom Ave, Kingston, ON K7K 0G1
  ['ON', 44.36302, -79.689781, '5EUYq071eV970SX-y01M-g', 228.1], // 46 Peacock Ln, Barrie, ON L4N 3R8
  ['ON', 46.466472, -81.070229, 'PMxcXr7vtW-bS8RQc4xlLg', 95.4], // 99 Dow Dr, Copper Cliff, ON P0M 1N0
  ['ON', 48.36252, -89.316056, '3EKdrGvN7ugc0g_ShJg1Rg', 290.6], // 1279 Rosslyn Rd, Thunder Bay, ON P7E 6V9
  ['ON', 46.545121, -84.383709, 'dMqkZjAy0DzgwYCetTOQig', 46.3], // 38 Chippewa St, Sault Ste. Marie, ON P6C 3A3
  ['ON', 46.327678, -79.523212, 'UT__1u-jj4v9YJ5cYUrKoA', 328.8], // 540 Couchie Memorial Dr, North Bay, ON P1B 0A4
  ['ON', 48.418898, -81.335146, 'WChtvMRdDPmuzc87B5R8tw', 257.1], // Pine St S, Timmins, ON
  ['ON', 49.79207, -94.521585, 'ZeMVLBNJr8gX5KzRBti_lw', 339.9], // Kenora Bypass, Balmertown, ON
  ['ON', 45.340761, -79.134024, 'iaqOnaNExYyb7YyzHCD92Q', 153.9], // 6 Turnbull Ln, Huntsville, ON P1H 1A9
  ['ON', 44.585893, -81.021544, 'k5wjl51CJ5cWpZJOoiDoDg', 156.5], // 718335 Hwy 6, Owen Sound, ON N4K 5N7
  ['ON', 44.316313, -78.35223, 'AXuhuMWIRrhI48VnvCuuMA', 336.9], // 660 Lemay Grv, Peterborough, ON K9K 0H8
  ['ON', 43.041836, -79.132396, 'CUdfGIz3OzlqzFnBlizcfA', 39.2], // 8171 Grassy Brook Rd, Niagara Falls, ON L0S 1K0
  ['ON', 45.046993, -74.771401, 'RwCvvyhggRVuVXV47_nQ4g', 332.9], // 2694 Brookdale Ave, Cornwall, ON K6J 5Y2
  ['ON', 47.992216, -84.745504, 'OH3RrZ0vqcmsRFgDZNyzkA', 338.7], // 367 ON-101, Wawa, ON P0S 1G0
  ['ON', 49.430274, -82.41724, 'bEWCAtFVcliTic50bybLVg', 52.5], // 27 Winnipeg St, Kapuskasing, ON P5N 1Z1
  ['ON', 49.73884, -92.833166, 'WFpX_YUD5b2-MVtoTxHmlw', 13.8], // 622 McIntyre Dr, Oxdrift, ON P0V 2J0
  ['ON', 43.74312, -81.725961, 'rBbm9QDL0DhF4VdKg7UP1Q', 301.6], // 2 Beach St, Goderich, ON N7A 4C7
  ['ON', 45.811288, -77.124769, '8oZkexSgI1t_IPOY5FqYxg', 208.6], // 457 Boundary Rd E, Pembroke, ON K8A 6L2
  ['ON', 45.021724, -77.793221, '6FIBaLVMuuVK-HjbEt3uzA', 295.2], // 145 Old L'Amable Rd, Bancroft, ON K0L 1C0
  ['ON', 45.247163, -81.615413, 'Q5lT6VQwE2FTVhM2atItng', 135.8], // 237 Little Cove Rd, Tobermory, ON N0H 2R0
  ['ON', 42.430318, -82.253358, 'kVAeujc2n6Vj9Q5ZarGRkQ', 354.5], // 8211 Pine Line, Chatham-Kent, ON N7M 5J8
  ['QC', 45.469695, -73.522035, 'j51cRzFRvgoOB8gj8S1rkg', 3.7], // Pont Samuel De Champlain, Brossard, QC
  ['QC', 45.503064, -73.644329, 'KL5zkKpW4ORLQcwIbSt0vg', 303.1], // 3980 Rue Jean-Talon O, Montréal, QC H4P 1V6
  ['QC', 45.523349, -73.565699, 'ZNn9DNBIbosVQi5TD9LZfg', 354.6], // 1290 Rue Cherrier, Montréal, QC H2L 3A7
  ['QC', 46.802322, -71.241868, '_8NRuVl8wATg3g-TzbbzLQ', 36.5], // 205 Côte de la Pente-Douce, Québec, QC G1N 2M1
  ['QC', 46.778665, -71.176483, '9f3DHro2ds-Vw4Sin8kuzA', 196.7], // 1647 Rue Damase-Potvin, Levis, QC G6W 0P5
  ['QC', 45.632659, -73.761736, 'WLDLbNivQP6Pc9wVce3HXw', 343], // 390 Rue Salvadore, Laval, QC H7H 2X6
  ['QC', 45.510298, -75.739457, 'lMwzdQC3ZJx4BrtLwTQq7A', 253.5], // 217 Chem. des Érables, Gatineau, QC J8V 3Z7
  ['QC', 45.45971, -71.903733, 'HgEb7IqNyUnhqtgNyGb7iA', 207.2], // 1025 Rue des Ruches, Sherbrooke, QC J1C 0B3
  ['QC', 46.378604, -72.617563, 'emSasEyNfv_-y9hW_4bANg', 89.5], // 1410 Rue de Pierriche, Trois-Rivières, QC G8Y 6H3
  ['QC', 48.44934, -71.104515, '0D8E2gzRSnHIGmZ4fphAlg', 309.8], // 274 Rue Chapleau, Chicoutimi, QC G7G 4C2
  ['QC', 48.488132, -68.451602, 'YhjdqMqxaZdyH0xD6sy_7Q', 49.2], // A. Jean-Lesage, Pointe-au-Père, QC G0K 1H0
  ['QC', 48.272768, -79.106557, 'B4Lq9msTxZfBRkI8rN6qtg', 61.5], // 3976 Rang Nadeau, Rouyn-Noranda, QC J0Z 1B0
  ['QC', 48.10826, -77.776137, 'jFmiJWgpOQWuVl7SBDVSVw', 53.1], // 300 Chem. de la Gare, Val-d'Or, QC J9P 4P8
  ['QC', 50.205382, -66.296521, 'OgkUBo0Gt-wqzTRn2izXRw', 223.9], // 575 Rue Des Gallets, Sept-Ã�Les, QC G4R 0B9
  ['QC', 49.242354, -68.142458, 'dFM-2KgvPqe8pTk_b07-3A', 81.8], // 28 Av. de Ramezay, Baie-Comeau, QC G4Z 1B2
  ['QC', 48.7729, -64.469164, 'i4axaXzxgs1RTvB3bzxqfg', 296.4], // 693 Boulevard de York S, Gaspé, QC G4X 2K6
  ['QC', 48.867642, -67.448572, 'oUb_vHcWb0COuGAqZXODTw', 3.9], // 729 Chem. de la Grève, Matane, QC G4W 7A1
  ['QC', 45.862326, -72.405711, 'SqV3zUbiLnnUSFdVIFoVxA', 54.7], // 2355 Ch. Hemmings, Drummondville, QC J2B 7T5
  ['QC', 46.152464, -74.647652, 'Y59nqn4yN5iIV8O_8Q3JIg', 251.3], // 1986 Chem. des Hirondelles, La Conception, QC J0T 1M0
  ['QC', 49.913238, -74.384165, 'Hq8I1JaHN2AfZ5IRxqFd4g', 255.8], // 887 3e Rue, Chibougamau, QC G8P 1R3
  ['QC', 47.830431, -69.559748, 'L4gXqaSYlYqjyKSSBgxkjg', 119.7], // Autoroute 20, Rivière-du-Loup, QC G5R 1B2
  ['QC', 47.466058, -70.55081, 'H8HW30cpByra0_wENBRW2A', 350.8], // 357 Rang St Gabriel de Pérou N, Baie-Saint-Paul, QC G3Z 3A3
  ['QC', 46.143181, -71.268771, 'ae1MpCft4adyxqzkeqfYrw', 228.4], // 3867 Chem. des Bois Francs E, Thetford Mines, QC G6H 3E3
  ['QC', 48.59055, -78.111289, 'Xb-yXAJiEm4ivIu872T7pQ', 30.6], // 1969 1re Rue E, Amos, QC J9T 3A1
  ['QC', 48.524906, -64.207239, 'ts-yrxLcsfRiW4o-Uyd9FA', 67], // 39 Rue Mont Joli, Percé, QC G0C 2L0
  ['QC', 45.434278, -72.680712, 'hUpJn6OW1GBFh_TnvdikiQ', 329.2], // 75 Chem. Giard, Granby, QC J2H 0T1
  ['QC', 46.558962, -75.414523, 'RUUb85q-glrXuWUNoAm4BQ', 225.1], // 51 Chem. Bellevue, Lac-Des-Ã�Corces, QC J0W 1H0
  ['BC', 49.272865, -123.184031, 'iBchYmr6SQlnSrFqztnArQ', 208], // 3624 Cameron Ave, Vancouver, BC V6R 1A2
  ['BC', 49.285199, -123.099978, 'cLV1an88Pe8SsWfMP3rp4w', 357.5], // 40 E Waterfront Rd, Vancouver, BC V6A 1B8
  ['BC', 49.267761, -123.211416, '_udMUPLwrOXWgAc8OFa3Wg', 297.1], // 4582 W 5th Ave, Vancouver, BC V6R 1S7
  ['BC', 49.166058, -122.875021, 'eC8-gl-4qE05lNMjw_B8Gw', 151.1], // 12550 90 Ave, Surrey, BC V3V 1B8
  ['BC', 48.431331, -123.400086, 'pklWDivZhzNIsjvXN3BjDg', 262.1], // 880 Esquimalt Rd, Victoria, BC V9A 3M5
  ['BC', 49.860049, -119.533861, 'yYwTYLouEnF8WhltGjG2zQ', 3.3], // 2681 Casa Loma Rd, West Kelowna, BC V1Z 1T6
  ['BC', 50.684717, -120.285824, 'ACMP9Fcfa7-lYUql2gL8jw', 249.6], // 615 Shuswap Rd, Kamloops, BC V2C 4A5
  ['BC', 53.857823, -122.770096, 'YHZWhts_BPqbXZzXhG0Ofg', 73.7], // 7201 St Lawrence Ave, Prince George, BC V2N 0E2
  ['BC', 49.161371, -124.025473, 'nZtUAZDJDMW0T5WK25_X2A', 44], // 2675 Benson View Rd, Nanaimo, BC V9R 6W6
  ['BC', 50.103292, -122.995702, 'VjWm0B9ucM0SiN1VY33rtg', 129], // 5310 Alta Lake Rd, Whistler, BC V8E 0C4
  ['BC', 50.999243, -118.124961, 'vPrWXfju6DiDcf7wzCH0iA', 217.2], // Trans-Canada Hwy, Revelstoke, BC V0E 2S0
  ['BC', 49.497792, -117.359697, 'I8P_M4rZsens6-nICs7WXQ', 63.3], // 1155 Insight Dr, Nelson, BC V1L 5P5
  ['BC', 54.32095, -130.313201, '8E9tA4CM98B6go0a3fa0oA', 106.5], // 90 Charlie Currie Rd, Prince Rupert, BC V8J 0A0
  ['BC', 56.236825, -120.82113, 'LWL6HTsdlYbCxOcRhgFuXQ', 195.5], // 9019 86 St, Fort St John, BC V1J 6X4
  ['BC', 49.147771, -125.908426, 'ssaBfYafNg-HLotGMy-y6Q', 128.7], // 320 Peterson Dr, Tofino, BC V0R 2Z0
  ['BC', 49.537881, -119.57589, 'RGCMLuez7wySQHYyVxrnbQ', 43.6], // 810 Three Mile Rd, Penticton, BC V2A 8T7
  ['BC', 49.479218, -115.722376, 'NDYt_O9CgbKyEqIevbdkOw', 89.5], // 4126 42nd Ave S, Cranbrook, BC V1C 6Z7
  ['BC', 52.100102, -122.175037, 'Y85wUHXhtDwepzvVQfNQeg', 34.4], // 300 Snyder Rd, Williams Lake, BC V2G 4Y2
  ['BC', 54.76593, -127.272778, 'OgQSSvhqHSTBToDYG2A2HQ', 200.5], // 140 Prairie Rd, Smithers, BC V0J 2N4
  ['BC', 54.570932, -128.607408, '8OZ28k6d1EDERcUH_dTbow', 56], // 5190 Merkley Rd, Terrace, BC V8G 0B3
  ['BC', 55.764138, -120.146968, 'kxcmRZbMq1bzesXH9r6aEg', 295.8], // Rolla Rd, Pouce Coupe, BC V0C 2C0
  ['BC', 51.268917, -117.061584, 'FKKfdWIQcz6VIvx5G89lpQ', 67.7], // 7W9Q+H9 Golden, BC
  ['BC', 49.369858, -121.360288, 'nkCFUWdmdaAFsw0xgtK3_g', 183.1], // BC-5, Hope, BC V0X 1L1
  ['BC', 49.969625, -125.211767, '4Dpm0Bh0XkK0_09aKkNeYw', 327.7], // 2377 S Island Hwy, Campbell River, BC V9W 1C5
  ['BC', 52.949484, -122.550333, 'jekdD_AJrLR-ucErKOaoJA', 16.5], // 961 Abbott Dr, Cariboo I, BC V2J 7B2
  ['BC', 49.006845, -119.458906, 'uuyOpmgJJ03xrpf_go4EGA', 260.3], // 1417 85 St, Osoyoos, BC V0H 1V1
  ['AB', 51.026042, -114.030843, 'NapEYxlBnGy82nyW1e14sQ', 242.2], // 3220 Ogden Rd SE, Calgary, AB T2G 4N5
  ['AB', 51.060126, -114.04299, 'PFWqJe04i-Kfy9QjI4uoKg', 323.8], // 913 Remington Rd NE, Calgary, AB T2E 5J9
  ['AB', 51.06092, -114.086013, 'ZJ5FXe9vQuj_eTMIWmoQuw', 114.4], // 1103 10 St NW, Calgary, AB T2N 1W4
  ['AB', 53.549886, -113.563959, '7wKG1vrmVEgk1sZlmUcx8g', 155.3], // 14017 106a Ave NW, Edmonton, AB T5N 1E2
  ['AB', 53.542995, -113.498373, 'tuqj3W5BtK6P0aKI1pMgIQ', 107.7], // 10314 102 Ave NW, Edmonton, AB T5J 2X6
  ['AB', 53.597681, -113.503099, 'qLOpHgAP-T8CEoZeAKqOYg', 49.3], // 13530 105 St, Edmonton, AB T5E 4S9
  ['AB', 52.269603, -113.822546, '9OVJsTe2uGhSF3lT3HrmOA', 155.1], // 5411 49 St, Red Deer, AB T4P 4C8
  ['AB', 49.663719, -112.785209, 'n-8k9T_fDLIQ4l2TgYzBOQ', 157.1], // 36 Fairmont Park Landing S, Lethbridge, AB T1K 7L1
  ['AB', 50.025569, -110.714632, 'QO1SPrLHGvkX-zsNNa1J-g', 347.7], // 1511-1505 Gershaw Dr SW, Medicine Hat, AB
  ['AB', 55.148102, -118.74368, 'CeGgBLZmCkqXvfR3Jpbe0g', 175.7], // 71217 Range Rd 55, Grande Prairie, AB
  ['AB', 56.730931, -111.406797, 'xQphgiXWmzN1hWdhK_ZXYw', 75.7], // Silin Forest Rd, Fort McMurray, AB T9H 3A2
  ['AB', 51.198808, -115.537388, 'M-UUMymDw1J2fY1rvSu2EQ', 18.3], // 1029 Banff Ave, Banff, AB T1L 1H8
  ['AB', 52.819661, -118.012072, 'E1tVP8_Rz4VTZlFzuE_f8Q', 63.4], // Valley of the Five Lakes, Jasper, AB T0E 0A8
  ['SK', 53.277929, -109.919869, 'YmgIjXEhalkdvqfWonnA3w', 126.7], // SK-303, Marshall, SK S9V 1E9
  ['AB', 51.419244, -112.722876, 'CHQmVR3gRVnI--rSRh07xA', 132.2], // 284011 Range Rd 202, Drumheller, AB T0J 2V0
  ['AB', 56.2111, -117.180182, '-yrhmcwr2uEV4XLe6-ystQ', 335.9], // Range Rd 210, St Isidore, AB T8S 1S6
  ['AB', 51.092215, -115.38686, 'vAchsjy0PJkClJSIVLE4Lg', 198], // 1992 Olympic Way, Canmore, AB T1W 2T5
  ['AB', 50.56168, -111.929004, 'QFjzZNv6ZMcTa3iNUi49zg', 144.6], // 185024 15 St W, Duchess, AB T1R 1H8
  ['AB', 53.429785, -117.558602, 'zeQgbsxtN4dUTMkG9lREfQ', 183], // Willow Creek Rd, Yellowhead County, AB
  ['AB', 54.734402, -113.208076, 'AfYezFWuHRLEPdLPTGDO8g', 136.4], // Township Rd 664, Colinton, AB T9S 0A2
  ['SK', 52.174669, -106.631175, 'g2_XxrNLgsmL_5VbogvZxA', 234], // 26 Roborecki Terrace, Saskatoon, SK S7K 5L3
  ['SK', 52.15366, -106.678314, 'DW6S84I4UliemEg0kLxE1g', 70.9], // 1811 Ave. F N, Saskatoon, SK S7L 1Y5
  ['SK', 50.452361, -104.643805, 'vHJ8ZWOzx1EoaQq_tDlYAA', 259.4], // 1670 Alexandra St, Regina, SK S4T 4P1
  ['SK', 50.408743, -104.599675, 'Nu3GcuCaQeAMeHSK5wJnBg', 61.5], // 43 Cowburn Crescent, Regina, SK S4S 5R9
  ['SK', 53.219816, -105.736865, 'HAOs3UsgxQ8pkqX21jvGhg', 36.1], // 402 15 St NE, Spruce Home, SK S0J 2N0
  ['SK', 50.434606, -105.557595, 's2_EfZJ6_-v96zGg6Db7uQ', 33.4], // 9th Ave NW, Bushell Park, SK S6J 0A1
  ['SK', 50.266897, -107.814967, 'mxmSMpjO4fI5dim61xuW4w', 12.5], // 100 Aitken Pl, Swift Current, SK S9H 4H4
  ['SK', 51.261476, -102.451015, 'C5qoS2Eie-jyvBuGpHm-SA', 10], // Saskota Flyway, Ebenezer, SK S3N 2V6
  ['SK', 52.812782, -108.277767, 'bfIb71KD8lrqIIluOHHcAw', 354.5], // RP7C+4V North Battleford, SK
  ['SK', 49.117943, -102.921962, 'ELcG1EJTOFdY3Wc6qmBOOg', 42.7], // 439H+56 Estevan, SK
  ['SK', 49.668316, -103.784328, '5Iz1oBzN5VSBn8UJAdfOog', 316.3], // 8670 Red Coat Trail, North Weyburn, SK S0C 1X0
  ['SK', 51.445828, -109.144858, 'Y8-79IJoI7ICv_WonBEXdg', 344.2], // Ditson Dr, Kindersley, SK S0L 1S3
  ['SK', 55.086444, -105.329273, '096mqeCLYqlyXo9rLXczyg', 272.7], // 136 Cessna St W, Air Ronge, SK S0J 0B3
  ['SK', 49.937618, -109.529453, 'c7IUYb4sr4eCE7Ah1tjsXg', 269.5], // WFQC+26 Maple Creek, SK
  ['MB', 49.837024, -97.129666, 'Azfd5yDgKsVjudp6siH6mg', 316.1], // 3 Victoria Crescent, Winnipeg, MB R2M 1X5
  ['MB', 49.869692, -97.064692, '4i-4uRkgu7MZ0468N6qdhg', 16.4], // VW9P+V4 Winnipeg, MB
  ['MB', 49.91658, -97.209958, 'VZb1C_OwcVktvMKaG7l5Pg', 54.4], // 2070 Notre Dame Ave, Winnipeg, MB R3H 0J8
  ['MB', 49.86722, -99.940458, '2nJh1nRjnQdzZWD5LO2zCg', 265.4], // 943 2nd St N, Brandon, MB R7A 2L9
  ['MB', 49.545433, -96.756171, 'J-CMLqa33pLtxbZkEz6S0w', 222.2], // 31017 Randolph Rd, Randolph, MB R0A 1L0
  ['MB', 55.777282, -97.839252, 'RyVqx3surJMEomPMe3rgbg', 183.6], // Provincial Rd 391, Thompson, MB
  ['MB', 51.103693, -100.063237, 'lsG9OfNO4SuhaWMFyRXu5w', 293.4], // 142075 PTH 5 & 10, Dauphin, MB R7N 3M9
  ['MB', 49.952388, -98.321848, 'vE1myGpbtH-8SWj7lubCgA', 157.3], // 4505 MB-1, Portage la Prairie, MB R1N 3C3
  ['MB', 53.79152, -101.229258, 'q2MIvULOjf0xQN1mNo7QVw', 77.9], // MB-10, Kelsey, MB R9A 1T7
  ['MB', 50.585396, -96.995284, 'uydI7juHXdMcCEiakvOrvg', 5.9], // 10 Odins Way, Gimli, MB R0C 1B0
  ['MB', 54.809041, -101.82568, 'F_lCwiUPK5bMlVTuc1pvkg', 241.2], // R55F+JP Flin Flon, MB
  ['MB', 49.219248, -98.114372, 'ZqjJI26AxHODI1Knk1h5XQ', 99.4], // 14137 MB-432, Thornhill, MB R6T 0B7
  ['NS', 44.665112, -63.494155, 'LgpiId2SJeTcG3Ih4XvSHg', 300.2], // 101 Driftwood Crescent, Dartmouth, NS B2V 1S6
  ['NS', 44.592629, -63.594808, 'jmByZATFeCETYPQf6HRsIQ', 216.6], // 27 Princeton Ave, Halifax, NS B3R 2A1
  ['NS', 46.148861, -60.118744, 'TtLIhoz8FlsqtPkCeDxf1g', 77.3], // 69 Kytes Hl Dr, Sydney, NS B1M 1A7
  ['NS', 45.419402, -63.303169, '1AjX8wzrCvotQshGTR1vfg', 113.1], // 99 Sunnybrook Dr, Onslow Mountain, NS B6L 6T7
  ['NS', 43.896323, -66.113804, 'A7RC2-4Ro1lFwhcp3o3sbQ', 164.8], // 175 Cedar Dr, Yarmouth, NS B5A 5K4
  ['NS', 44.330407, -64.323037, 'oQLV87qdE6PxGqHg3260-g', 260.4], // 2472 NS-332, Rose Bay, NS B0J 2X0
  ['NS', 45.659017, -61.919709, '5zLFI9C1snyYOSiKYPpvHw', 95.3], // 78 Aberdeen Ave, Antigonish County, NS B2G 2L2
  ['NS', 45.069743, -64.458063, 'ggOZlqdkauzHaAmEYq7B3A', 17.9], // 5 Aalders Ave Ext, New Minas, NS B4N 5H6
  ['NS', 46.58906, -60.997957, 'VHW_Vj1bxRPp15OsSKKtcQ', 212.7], // 283 Mountain Rd, Grand Étang, NS B0E 1L0
  ['NB', 46.053547, -64.777741, 'rQn2lWizeacdTHJuAFwPHQ', 86.5], // 854 Pinewood Rd, Riverview, NB E1B 0W9
  ['NB', 45.26324, -66.073329, 'lRikDSY9XuiujrhYUK2m-A', 309.6], // 5 King St W, Saint John, NB E2L 1G2
  ['NB', 45.96021, -66.71159, 'UUJtn67dzsI8BpKajwc9SA', 323.5], // 77 Levine St, Fredericton, NB E3C 1R8
  ['NB', 47.651794, -65.622401, '4tdv0aRokfkSkFCCvxyGFA', 248.6], // 30 Bayshore Dr, Bathurst, NB E2A 6A5
  ['NB', 47.409616, -68.264178, 'cdEYqwkvh7P8LpK5sE1Xlg', 133.8], // 1265 Ch Monseigneur Lang, Saint-Basile, NB E7C 1Z3
  ['NB', 47.026628, -65.52069, 'N3VZJCSeVucjeD-q1E5W9g', 118.4], // 15 Gretna Green Dr, Miramichi, NB E1V 5V6
  ['NB', 45.109898, -67.090824, 'L7oyfxYIK-htDyqHv800jQ', 6.8], // 3803 NB-127, Bayside, NB E5B 2T2
  ['QC', 48.050505, -66.670036, 'X5ISIlMzdzOIZxOQczharQ', 170.7], // 159 Rue des Méandres, Municipalité de Pointe-à-la-Croix, QC G0C 1L0
  ['NL', 47.575914, -52.735067, 'V9HsaRqgbcFDa7VxZWjfkg', 335], // C-Core, 20a Morrissey Rd, St. John's, NL A1B 3V6
  ['NL', 47.544948, -52.751841, 'gz0YwAJpy7vq9gNEIz6QwQ', 265.2], // 161/2 Gulliver Pl, St. John's, NL A1E 4K6
  ['NL', 48.957219, -57.91042, '81r9rwVT6L769xstaAVb7g', 144.9], // X34Q+VR Corner Brook, NL
  ['NL', 48.947299, -54.612573, 'qaE3j00jad-SCP7XaUYBDw', 161], // 32 A Bennett Dr, Gander, NL A1V 1P9
  ['NL', 48.940903, -55.726231, 'CzjhUEwoHiH7lKpsL7VwRQ', 135.9], // NL-1, Bishop's Falls, NL A2B 1B4
  ['NL', 48.186473, -53.937224, 'Bgim1Xrhnm3l5CAc6l0Mhg', 74.3], // NL-231, Hickman's Harbour, NL A0C 1P0
  ['NL', 49.182207, -57.406673, '_YxbJoSwBMBJ-2VtKLjQVw', 145.4], // 99 High St, Deer Lake, NL A8A 1N5
  ['NL', 53.288968, -60.403187, 'IbxQ5K-yX-deadLoe7Qlxg', 94.9], // NL-500, Happy Valley-Goose Bay, NL A0P 1C0
  ['NL', 48.665216, -53.118038, 'wTDvW4WphrygglniIs5HOw', 177.4], // 104 Butler Crescent, Bonavista, NL A0C 1B0
  ['NL', 47.589119, -59.122134, 'Z0wKU3eAJv0jGW3PyyJUPA', 305.8], // NL-470, Channel-Port aux Basques, NL
  ['PE', 46.271842, -63.181836, 'mOCvPK8I5icbIS94vDx5pg', 46.9], // 187 Hurry Rd, Charlottetown, PE C1E 3C6
  ['PE', 46.443394, -63.779097, 'ik1AGKIDnwMfnN7PQpGssQ', 281], // 86 Legion Rd, Sherbrooke, PE C1N 4J8
  ['PE', 46.163715, -62.591057, '-zYqmdEpLi5fFb81efZ1sA', 257.6], // 892 PE-17, Montague, PE C0A 1R0
  ['PE', 46.818785, -64.147655, '5JiGnD2WzXp4_idkw5oSIg', 101.5], // 1122 Dock Rd, Elmsdale, PE C0B 1K0
  ['YT', 60.757953, -135.124212, 'D-F80VS0U1f5WSmMCsV7zA', 130.8], // 528 Grove St, Whitehorse, YT Y1A 5J8
  ['YT', 60.753012, -135.035547, 'DESs-nMzwKFltzpS0oPCvQ', 328.8], // Long Lake Rd, Whitehorse, YT Y1A 6N2
  ['YT', 64.07997, -139.450467, 's0WLYLsKch_wTEKzQjwQUw', 159], // Top of the World Hwy, Dawson City, YT Y0B 0A3
  ['YT', 60.054678, -128.823529, 'ujN4CBl3GYJ6JPF6v7hgnw', 349.4], // 61945 Alaska Hwy, Watson Lake, YT Y0A 1C0
  ['YT', 60.763459, -137.482066, '4OVnSVcyAa_ROpVy7pXkBQ', 337], // 130 Willow Acres Rd, Haines Junction, YT Y0B 1L0
  ['NT', 62.447595, -114.402993, '2KQPsLikwYeci2odzIoVVA', 234.8], // 550 Byrne Rd, Yellowknife, NT X1A 2N1
  ['NT', 62.463503, -114.297869, 'bk0BhnKrcj5hvwh73uB9Cw', 299.9], // Dettah Rd, Fort Smith, Unorganized, NT
  ['NT', 60.835118, -115.759591, '21anwVf2SOZA9VCBuMkbfA', 318.9], // 133 Reserve Hwy, Hay River, NT X0E 0R2
  ['NT', 68.338686, -133.677453, '62gvxe2Ry8kjNpYG-e9Llw', 264.2], // 88QF+F2 Inuvik, NT
  ['AB', 59.954887, -111.866785, 'QqZDiY4pi5jnChJlVXS1Rw', 305.7], // Pine Lake Rd, Wood Buffalo, AB T0P 1B0
  ['NU', 63.753028, -68.496402, '92IETRQhz2z643mwk_fW_w', 335.2], // 4044 Anuri St, Iqaluit, NU X0A 0H0
  ['NU', 69.13012, -104.992006, '586LKWUxDZclqheq4wYXNw', 235.1], // Ovayok Road, Cambridge Bay, NU X0B 0A1
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
  const mapId = new ObjectId(CANADA_ID)
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
        name: 'Canada',
        description: "Good ol' Canada eh, explore The Great White North!",
        previewImg: 'official23.jpg',
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
  await db
    .collection('locations')
    .insertMany(
      LOCATIONS.map(([, lat, lng, panoId, heading]) => ({
        mapId,
        lat,
        lng,
        countryCode: 'ca',
        panoId,
        heading,
        pitch: 0,
        zoom: 0,
      })),
    )

  console.log(`Seeded Canada map ${CANADA_ID} with ${LOCATIONS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
