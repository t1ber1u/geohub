// Seeds the official "Asia" map. Locations cover 31 countries and territories, from Japan, Siberia and Mongolia to
// Indonesia, India and the Arabian Gulf (cities, suburbs, small towns, highways, farmland and mountains), weighted
// roughly by population and Street View coverage. China, Pakistan, Iran and most of Central Asia have little or no
// official coverage, so they are absent. Each location is an official outdoor Google panorama, confirmed to be in the
// expected country by reverse geocoding and checked visually.
// Safe to re-run: replaces the locations, keeps play stats.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed-asia.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const ASIA_ID = '6185e03b7b54baf63473a544'

// [countryCode, lat, lng, panoId, heading] - lat/lng is the panorama's position
const LOCATIONS = [
  ['jp', 35.69952, 139.594284, 'o_H3aCt1AHvM8G4YO-xEWg', 42.6], // 2-chōme-18-15 Shōan, Suginami City, Tokyo 167-0054, Japan
  ['jp', 35.671309, 139.683471, '3fwfDrLQnFsRQepGDE4c4A', 132.3], // Japan, 〒151-0062 Tokyo, Shibuya, Motoyoyogichō, 14−３ 和興ビル
  ['jp', 35.678119, 139.619498, 'Rhp4Gxpot2AtYLGVnfPM3g', 222.9], // 1-chōme-1-25 Takaidohigashi, Suginami City, Tokyo 168-0072, Japan
  ['jp', 35.637984, 139.706253, 'BxNYm2grILNmY__aCtfkQQ', 344], // Nakazato Bridge, Nakazatobashi Brdg., 2-chōme-19 Mita, Meguro City, Tokyo 153-0062, Japan
  ['jp', 34.639694, 135.472647, 'KV-Es5Twqit_vpUU-eg2NA', 86.8], // 5-chōme-3-1 Hirao, Taishō-ku, Osaka, 551-0012, Japan
  ['jp', 34.712212, 135.451487, 'KTi-8tdwEYimHM8VkP86iA', 289.5], // 2 Chome-13 Chibune, Nishiyodogawa Ward, Osaka, 555-0013, Japan
  ['jp', 35.035046, 135.741473, '9RTEaJTDWt9yRq2USBn9Og', 94.5], // 43 Kitagenbachō, Kamigyo Ward, Kyoto, 602-8308, Japan
  ['jp', 35.150488, 136.871184, 'I-l_RyfQ6qrMKB-8A13khg', 263.6], // 2-chōme-52 Nagarachō, Nakagawa Ward, Nagoya, Aichi 454-0815, Japan
  ['jp', 43.015587, 141.394402, 'bw4Ry3rNSdzdjSjIsurS7w', 298.4], // Japan, 〒062-0041 Hokkaido, Sapporo, Toyohira Ward, Fukuzumi 1 Jō, 4-chōme−9−８ グリーンヒルハイツ
  ['jp', 33.6417, 130.414513, 'No4RHE6eLAh4l9taYNvPgA', 40.3], // 4-chōme-14-32 Hakozakifutō, Higashi Ward, Fukuoka, 812-0051, Japan
  ['jp', 34.348658, 132.446214, 'GegA2w1ppNYIpqR3yNYqsg', 273.3], // 4-chōme-1-1 Dejima, Minami Ward, Hiroshima, 734-0013, Japan
  ['jp', 38.319793, 140.850497, 'cUG4hTbTudKdDpuG2cPc9w', 39.2], // Tadashi-5-1 Furuuchi, Izumi Ward, Sendai, Miyagi 981-3123, Japan
  ['jp', 36.564056, 136.71576, 'Rvel1r0-Ouv7uEhXJvurUw', 156.2], // Ni-119 Makimachi, Kanazawa, Ishikawa 920-0827, Japan
  ['jp', 36.599283, 138.240117, 'SabQW5TACKGTKHeinatJYA', 186], // ２１５６-イ Wakahokawada, Nagano, 381-0103, Japan
  ['jp', 31.566879, 130.614304, 'kabr9-yznocA1_7Xg7qamw', 242.3], // 23 Nojirichō, Kagoshima, 891-1541, Japan
  ['jp', 26.194417, 127.658882, 'HUQFJNFIE6v9nUB84ppHFQ', 64.4], // 2-chōme-5 Akamine, Naha, Okinawa 901-0154, Japan
  ['jp', 40.768009, 140.748455, 'KAR_TR9MLWXjeJVDbPXj1w', 283.6], // Sugaya-169-3 Shinmachino, Aomori, 030-0135, Japan
  ['jp', 33.861702, 132.826679, 'sDXWQrQW3Rf-O47jsmV-aQ', 135.3], // Dōro, Matsuyama, Ehime, Japan
  ['jp', 42.96057, 144.400252, 'AowdEa6lKCG22IzoqgYdBg', 91.2], // 1-chōme-6-12 Okotsu, Kushiro, Hokkaido 085-0811, Japan
  ['jp', 39.742987, 140.14692, 'U32z8HUSTXq5bHjpXdGxLw', 280.9], // Furumichi-73 Yanagida, Akita, 010-0825, Japan
  ['jp', 33.584933, 133.592634, '_yxYBtmR9BuQmoVbS0xd_g', 98.5], // 1675-12 Nunoshida, Kochi, 781-5101, Japan
  ['jp', 36.180782, 137.948809, 'P-MRLYCNMhF0C9qnP4AghA', 164.1], // 7570-2 Sasaga, Matsumoto, Nagano 399-0033, Japan
  ['jp', 37.914936, 139.01166, 'FtPosOQhLoGY9JahvZDbdw', 273.7], // 1083 Sekiya, Chuo Ward, Niigata, 951-8134, Japan
  ['jp', 41.815167, 140.702791, 'JsmmbZ_AqYb4e_wkc4loGw', 349.5], // 7-chōme-3-30 Nanaehama, Hokuto, Hokkaido 049-0111, Japan
  ['jp', 34.990998, 138.341451, 'UmjBXSdXEzPH36_kos4axQ', 145.2], // 2-chōme-20-43 Takyō, Aoi Ward, Shizuoka, 421-1214, Japan
  ['jp', 36.131837, 137.178431, 'q3ig1DMRmkqXTLhuBcFFbQ', 64.5], // 506 Kiyomichō Mikkamachi, Takayama, Gifu 506-0102, Japan
  ['jp', 31.893719, 131.380575, 'Ontq96CorNAwXfkjVmWKmQ', 21.4], // Japan, 〒880-0931 Miyazaki, Furujōchō, 柳町５１５７−１
  ['kr', 37.577201, 126.957378, '5LFQtWLaJTG9P5cT5Br2xg', 341.2], // South Korea, Seoul, Muak-dong, 105 인왕산아이파크아파트
  ['kr', 37.542702, 126.938831, 'xX8iJoH3fTlPM4mZ7ICQQA', 74.7], // 494-55 Yonggang-dong, Mapo-gu, Seoul, South Korea
  ['kr', 37.613332, 127.012895, '6t-3X3RvHMbfop8UtesmMw', 131.6], // 산17-227 Jeongneung-dong, Seongbuk District, Seoul, South Korea
  ['kr', 35.133372, 129.101084, 'I29rTcE4ibFwnxAf39_RHA', 71], // 1630-9 Daeyeon-dong, Nam-gu, Busan, South Korea
  ['kr', 35.886221, 128.590944, 'ynJFkmInfgzhGij5ZM9AFA', 293.7], // 107-1 Chimsan-ro, Buk-gu, Daegu, South Korea
  ['kr', 35.077417, 126.860792, 'fODmU-O20FSW44KGYFic-w', 156], // 산22-5 Suwon-ri, Nampyeong-eup, Naju, Jeollanam-do, South Korea
  ['kr', 36.300098, 127.386927, 'BdnCXUFz1GJi9_Ltx6rIsg', 347.3], // 433-85 Sajeong-dong, Jung-gu, Daejeon, South Korea
  ['kr', 37.764101, 128.938585, 'JXPGj0SLmEZdGJZx12wlag', 118.4], // 246-1 Byeongsan-dong, Gangneung, Gangwon-do, South Korea
  ['kr', 33.447299, 126.488392, 'uR4akzbw9V3YoeBRlCv8aQ', 139.3], // 680-23 Yeon-dong, Cheju, Jeju-do, South Korea
  ['kr', 35.814536, 127.075813, 'N9L-qDcRV_vS90AfIYJI3A', 118.9], // 538 Sangnim-dong, Wansan-gu, Jeonju, Jeonbuk State, South Korea
  ['kr', 36.564089, 128.645804, 'HNX9zKT_smqQxgvN9mm9OQ', 275.1], // 산107-1 Hoegok-ri, Pungsan-eup, Andong, Gyeongsangbuk-do, South Korea
  ['kr', 35.476391, 129.282905, '2-gHriDOp_CG9jJ6KE6ixQ', 89.3], // 산54-10 Dongcheon-ri, Cheongnyang-eup, Ulju-gun, Ulsan, South Korea
  ['kr', 37.87967, 127.728371, '4T7KlSRmwwBKtEWFf7T9yQ', 298.8], // 62-1 Geumgang-ro, Chuncheon, Gangwon-do, South Korea
  ['tw', 25.037146, 121.607554, 'r0WC8S-9SQWpCNeTY7yHBw', 223.5], // Wèi Mìng Míng De Dào Lù, Jiuru Village, Nangang District, Taipei City, Taiwan 115
  ['tw', 24.989843, 121.538176, 'g3ndYLGOxUux6nOUGoBnyA', 101], // No. 13號三樓, Lane 17, Yuying St, 景美里文山區臺北市 Taiwan 116
  ['tw', 24.12002, 120.619517, 'sm4IdbxTdVlOTz-fzS3YAQ', 5.2], // No. 20, Zhongzhang Rd, 鎮平里南屯區臺中市 Taiwan 408
  ['tw', 23.982115, 121.564409, 'eQa6hs87cHVWyqPQuBduug', 196.5], // No. 223, Qingbei 1st St, 慶豐村吉安鄉花蓮縣 Taiwan 973
  ['tw', 23.028516, 120.267292, 'jBCeczLfaXBg_E77h-1QIw', 214.1], // 710, Taiwan, Tainan City, Yongkang District, Yongming Village, 中山北路264巷11弄326號
  ['tw', 22.779019, 121.178584, 'GxR2iM8vxdJy8tGsr94efQ', 189.7], // No. 1390號, Section 2, Jilin Rd, 富岡里臺東市臺東縣 Taiwan 950
  ['tw', 22.637511, 120.341205, 'MQuEyQyK79FceFVgZR9qeQ', 269.8], // No. 2, Lane 16, Yangming Rd, 寶華里三民區台灣 Taiwan 807
  ['hk', 22.350173, 114.115242, '07LHM9isKfd496RRTXalNg', 54], // 9427+7V, Kwai Chung, New Territories, Hong Kong
  ['hk', 22.316864, 114.155087, 'jBRAEw-BJlzVHVBs-yTW9w', 173.5], // Hoi Fai Road Garden, Hoi Fai Rd, Tai Kok Tsui, Kowloon, Hong Kong
  ['mo', 22.196622, 113.563287, 'IwnJV-ThJR0Z7yj_Rg-E6Q', 277.1], // Pte. da Amizade, Macao
  ['mn', 47.881828, 106.862925, 'ojYbVnU590trz0S2QuR6xg', 174.2], // VVM6+3HJ, HUD - 24 khoroo, Ulaanbaatar 17080, Mongolia
  ['mn', 49.444505, 105.939595, 'Fjdt_8gjgzNnHkRz5_RlLA', 86.4], // CWVR+Q9J, Darkhan, Darkhan-Uul, Mongolia
  ['mn', 47.202957, 102.847168, 'G81_5WguLHzYS-uQUDF2zw', 357.8], // 6R3W+5V Kharkhorin, Mongolia
  ['ph', 14.622889, 120.961844, 'vyDzzUt-sJV0zzbJ1UFwJg', 24.9], // JXF6+5P9, Tondo, Manila, Metro Manila, Philippines
  ['ph', 14.591045, 120.954159, 'twcihOSiZGYmESYbzJImAQ', 174], // HXR3+CMJ, Port Area, Manila, Metro Manila, Philippines
  ['ph', 14.590115, 120.977393, 'JS5PI7Wpas6u938kOr0zRQ', 163.3], // 718 Sta. Potenciana Street, Intramuros, Manila, 1002 Metro Manila, Philippines
  ['ph', 10.306493, 123.939579, 'xfc_Vx-QcNCbLS0rGa7Xrg', 19.8], // 8W4Q+HP8, Lapu-Lapu, Cebu, Philippines
  ['ph', 7.193493, 125.484155, 'f-9XRMX1k8WgMFqqRHx4Kg', 11], // 5FRM+JX, Calinan District, Davao City, Davao del Sur, Philippines
  ['ph', 16.418614, 120.564259, 'rA7G_CLltzSnWl_gLoh3Zg', 247.5], // CH97+P9C, Baguio, Benguet, Philippines
  ['ph', 10.667474, 122.589212, 'rhhX9TXjTRZhFsqxaolDQA', 30], // MH8Q+XPV, Jordan, Guimaras, Philippines
  ['ph', 9.750303, 118.771892, 'hcd1C8AvSopMUmpC1F6fDA', 151.9], // QQ2C+4PV Sommer House Building, Hartman Rd, Puerto Princesa City, Palawan, Philippines
  ['ph', 8.465214, 124.655562, 'gXyxJo68Ss88kzGNYpwiEg', 306.5], // FM84+25W, Cagayan De Oro City, Misamis Oriental, Philippines
  ['ph', 13.144339, 123.703828, 'Vmc5xLCPoyX6COP3MAekyA', 106.4], // 4PV3+MGQ, Daraga, Albay, Philippines
  ['ph', 18.144419, 120.559258, 'CmWl8t_oNGkaYG7t7YMAWA', 301.8], // 4HV5+QP San Nicolas, Ilocos Norte, Philippines
  ['ph', 11.227534, 125.025889, 'j57RPGbTvg4YDuXdcCOTAg', 143.2], // Daniel Z. Romualdez Airport, San Jose, Tacloban City, 6500 Leyte, Philippines
  ['ph', 10.734986, 122.962991, 'H5WyA9kq1p6RR_wfOSnj4g', 253.1], // PXM7+X5M, Talisay, Negros Occidental, Philippines
  ['ph', 6.07195, 125.148669, 'hIdzDg7ph3G9p2Ab34O3jg', 183.3], // 34CX+RFG, General Santos City (Dadiangas), South Cotabato, Philippines
  ['th', 13.78803, 100.493363, 'CJox-lRZ1zOtmiDs-l6xeA', 15.6], // 230 Sirindhorn Alley, แขวงบางพลัด บางพลัด กรุงเทพมหานคร 10700, Thailand
  ['th', 13.719213, 100.534996, 'SZWyL1CsfyUETyLz5ks7gQ', 318.2], // 563 Naradhiwas Rajanagarindra 9 Alley, แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพมหานคร 10120, Thailand
  ['th', 13.762841, 100.434719, 'essA03xDMO3G8lPQl6dOvw', 194.6], // 41 ถนน พุทธมณฑลสาย 1 Khwaeng Bang Ramat, Khet Taling Chan, Krung Thep Maha Nakhon 10170, Thailand
  ['th', 18.831021, 98.977282, 'BQJtCe6Jcvo-rFKJTDDKmQ', 228.2], // ศุภาลัยพาร์ควิวล์ Chotana Rd, Tambon Chang Phueak, Amphoe Mueang Chiang Mai, Chang Wat Chiang Mai 50300, Thailand
  ['th', 7.886385, 98.438833, 'kg8ajAxpL3p5qak0SivA8Q', 146.9], // Thepprathan Rd, ตำบล รัษฎา อำเภอเมืองภูเก็ต ภูเก็ต 83000, Thailand
  ['th', 16.430054, 102.787585, 'L7g0Bu2zu09ZTGy7lw4uHw', 224.9], // CQHP+QPV, Ban Ped Sub-district, Mueang Khon Kaen District, Khon Kaen 40000, Thailand
  ['th', 17.351126, 102.787701, 'sfQZubZUbOP1O_X_dtO3nw', 145.8], // 9Q2P+8MH, Ban Chan, Mueang Udon Thani District, Udon Thani 41000, Thailand
  ['th', 7.015065, 100.519533, 'gUpOQ2mmqmyYmSEJzwykLg', 235.5], // 2G89+6WF, Kho Hong, Hat Yai District, Songkhla 90110, Thailand
  ['th', 14.985374, 102.048722, 'ma1Ib0JbfCx9S4ZMw8CzLw', 251.7], // Wat Khon Chum, 486 ซอยหน้า Tambon Pru Yai, Amphoe Mueang Nakhon Ratchasima, Chang Wat Nakhon Ratchasima 30000, Thailand
  ['th', 19.964621, 99.828642, '9IdxmxwTDt2gn4zi8f02gA', 238.4], // Tanon Tee Maimi Shue, Tambon Ban Du, Amphoe Mueang Chiang Rai, Chang Wat Chiang Rai 57100, Thailand
  ['th', 12.9286, 100.868099, 'Uj_mKGDilBk1T7kTj-3-Bg', 203.2], // WVH9+C6 Pattaya City, Bang Lamung District, Chon Buri, Thailand
  ['th', 15.277698, 104.879948, 'Ohc6JKmdHfeHebOvDOClBA', 186.6], // 82 ถนน สายกลางหมู่บ้านสาริน 10 Tambon Rai Noi, เมือง Chang Wat Ubon Ratchathani 34000, Thailand
  ['th', 14.033624, 99.566172, '3hw2Up5ouokzXmywf7fTJA', 170.7], // 5, Tambon Pak Phraek, Amphoe Mueang Kanchanaburi, Chang Wat Kanchanaburi 71000, Thailand
  ['th', 9.166761, 99.285888, 'opCab-LxPoI7QeDPdWYGLw', 85.5], // Tanon Tee Maimi Shue, Tambon Bang Sai, Amphoe Mueang Surat Thani, Chang Wat Surat Thani 84000, Thailand
  ['th', 15.64747, 100.108861, 'CyVVH7WS9wix__IYrnys1w', 159.8], // J4X5+2FW, Klang Daet, Mueang Nakhon Sawan District, Nakhon Sawan 60000, Thailand
  ['th', 18.278594, 99.541395, 'WEIRrBMNKyOwKfzoKp02Pw', 74.3], // 7GHR+PX, Mueang Lampang District, Lampang 52000, Thailand
  ['kh', 11.600518, 104.910226, 'b2Rcm6YrnEUTXGH2ZQkTJQ', 294.2], // f95 Street 907, Phnom Penh, Cambodia
  ['kh', 13.389707, 103.879287, '7Jo004dDslxgcJYe9X3wKA', 256.2], // Apsara Rd, Krong Siem Reap, Cambodia
  ['kh', 13.101268, 103.227121, 'EXFRCPrTDhNbsW-RcrA4gw', 286.8], // Street 609, Cambodia
  ['kh', 10.600244, 103.558706, 'V2AmS2iGbtw_Wujfd4T7gw', 86.3], // JH25+5X2, Preah Sihanouk, Cambodia
  ['la', 17.977899, 102.62035, 'lQe5CoKxnryT_mQ8cIvtSA', 16.3], // XJHC+762, Vientiane, Laos
  ['la', 19.862978, 102.128232, '8KHQhi2z6lJguy4_zeGPvQ', 206.6], // 13, ຫຼວງພະບາງ, Laos
  ['la', 15.105945, 105.855588, 'USDduU8rsFDMtDtiSQKxKw', 177.1], // 4V44+798, No.38 Road, ປາກເຊ, Laos
  ['vn', 21.05414, 105.885569, 'kYKWbn-64O1hph33dD6iLw', 191.9], // 3/Đ. Nguyễn Văn Cừ/9 667, Tổ 16, Bồ Đề, Hà Nội, Vietnam
  ['vn', 10.861682, 106.639932, 'RVumt8S5-Eu1EgB1Un5aOw', 152.1], // 111A Đ. Nguyễn Thị Đặng, Tân Thới Hiệp, Hồ Chí Minh, Vietnam
  ['vn', 16.013545, 108.185128, 'wTirhvALC7mqrc_EgbKkGw', 196.6], // K12 Trường Sơn, Cẩm Lệ, Đà Nẵng, Vietnam
  ['my', 3.132941, 101.719539, 'FYT0fqDS7-b7LWiw7SxeHA', 296.6], // Ppr Laksamana 2 (A), Maluri, 55100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia
  ['my', 3.133084, 101.62738, 'ucE0G3jC6-a6LH6-wgu58Q', 267.4], // 52, Jalan SS 20/4, Damansara Kim, 47400 Petaling Jaya, Selangor, Malaysia
  ['my', 3.098264, 101.674898, 'g2SHPfbMLBKAzZbydxIhsQ', 174.3], // 11, Old Klang Rd, 58100 Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia
  ['my', 1.467842, 103.779736, 'm3yRMPEhRyqOQRlUn94hMQ', 288.1], // Sekolah Menengah Foon Yew, Taman Stulang Laut, 80300 Johor Bahru, Johor, Malaysia
  ['my', 5.936495, 116.053974, 'TCauqDuoCR6dQfjleNsSig', 204.3], // W3P3+9J, 88200 Kota Kinabalu, Sabah, Malaysia
  ['my', 1.510983, 110.39142, 'rJvKGU5XRJpO13-lZFsJuQ', 177.5], // 12, Jalan Canna, Northbank Commercial, 93350 Kuching, Sarawak, Malaysia
  ['my', 4.569662, 101.0348, 'o9BugmUEkmT_DLic5qWguQ', 273.7], // 42, Hala Kledang 6, Bukit Kledang Indah, 31450 Ipoh, Perak, Malaysia
  ['my', 3.813533, 103.370465, 'nnOcQnVixQEHUh1vNGmgbA', 65.9], // 3, Jalan Sim Lin, 25050 Kuantan, Pahang, Malaysia
  ['my', 6.079474, 102.246092, 'K1IdJBsla3Cx31NpOuItew', 324.7], // 1713j, Jalan Pasir Hor, Kampung Padang Enggang, 15100 Kota Bharu, Kelantan, Malaysia
  ['my', 4.36642, 114.015441, 'DcIyXTo24WusTLSIsgjXKw', 77], // 9288+H5 Kampung Lopeng Tengah, Miri, Sarawak, Malaysia
  ['my', 2.692785, 101.952645, 'REsrv9WBvRKGd_0_PQ5lxQ', 65.6], // 2768, Jalan Merbok 9, Taman Sea, 70100 Seremban, Negeri Sembilan, Malaysia
  ['my', 6.093811, 100.420493, 'A2mZ023l1wOfyBnzj1UNKQ', 6], // Jln. Alor Melintang, Kampung Teluk Kandit, Alor Setar, Kedah, Malaysia
  ['my', 2.229853, 102.272001, 'Y5ikmHYkhrvT7Qpo641ynA', 154.1], // 10, Jalan PPPS 1, Bukit Baru, 75150 Melaka, Malaysia
  ['my', 5.293373, 100.294011, 'JA2dQejj1u54IdOZPv4J2w', 228.5], // 77VV+8G, Bayan Lepas, Penang, Malaysia
  ['sg', 1.320883, 103.845116, 'I2xcq4mvVmR0IxxvbO3c7A', 256.2], // 11 Sinaran Dr, Singapore 307506
  ['sg', 1.308872, 103.795567, 'KyG8ywq3BtJHgB_pz1-flg', 72.8], // 2 Holland Cl, Holland Avenue Hill, Singapore
  ['id', -6.217646, 106.895005, 'CSvhpqCQozgNaUZ916GadA', 124.5], // Sbr. Ps. Deprok 1, Cipinang Muara, Kecamatan Jatinegara, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta, Indonesia
  ['id', -6.214359, 106.831713, 'Ube9RSdZ-zvv5sagQbuerQ', 240.5], // Jl. H. R. Rasuna Said No.3, RT.3/RW.1, Karet, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12710, Indonesia
  ['id', -6.251336, 106.802447, 'hBZ3_IrnM6S-B9lAtCR05w', 315], // Jl. Wijaya No.5, RT.5/RW.7, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160, Indonesia
  ['id', -7.278528, 112.796424, 'l8NVJ3gBGcRKcrmxqVRS9A', 228.4], // PQCW+JHJ, Keputih, Sukolilo, Surabaya, East Java 60117, Indonesia
  ['id', -6.887417, 107.567374, 'D7-QQvMecbweFC20oIsBtQ', 2.1], // Jl. Gn. Batu Dalam II No.164a, Pasirkaliki, Kec. Cimahi Utara, Kota Cimahi, Jawa Barat 40514, Indonesia
  ['id', -7.807432, 110.425745, 'CbXkXj1h2SSMgUDADYk3gg', 210.4], // 5CVG+28F, Jl. Wijaya Kusuma Sendangtirto Noyokerten No.65, Mojokerten, Sendangtirto, Kec. Berbah, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55573, Indonesia
  ['id', 3.560609, 98.676502, '-t2b6NeXRAtJRjFyyLVJSQ', 319], // HM5G+XRW, Suka Damai, Medan Polonia, Medan City, North Sumatra 20159, Indonesia
  ['id', -8.64021, 115.162993, 'Msx90ixj-B7F7XmmyyCNBQ', 175.8], // 9557+W37, Jl. Bedugul Canggu, Kerobokan Kaja, Kec. Kuta Utara, Kabupaten Badung, Bali 80361, Indonesia
  ['id', -5.137335, 119.426829, 'k_jcHch7DnFaASWvUi54Jg', 322.5], // Jl. Maccini Gusung No.42, Maccini Gusung, Kec. Makassar, Kota Makassar, Sulawesi Selatan 90144, Indonesia
  ['id', -6.94465, 110.472608, 'rG1I2FdtS85Zj8gdmStXxQ', 8.3], // 3F3C+QXG, Trimulyo, Sayung, Kec. Sayung, Kabupaten Demak, Jawa Tengah 50118, Indonesia
  ['id', -2.954157, 104.747588, '3rl-v_pVelRNs5nWBmIJhw', 110.3], // Lorong Zuriah No.14, Talang Aman, Kec. Kemuning, Kota Palembang, Sumatera Selatan 30127, Indonesia
  ['id', -1.199063, 116.851518, 'ITrdzo7oc_9fMqo-9FBa2Q', 246], // Perumahan Graha Indah No.13, Batu Ampar, Kec. Balikpapan Utara, Kota Balikpapan, Kalimantan Timur 76136, Indonesia
  ['id', 1.501769, 124.881899, '7BIDI93XoqsdZpoNPkAkFA', 242.2], // GV2J+JPQ, Kairagi Dua, Mapanget, Manado City, North Sulawesi, Indonesia
  ['id', -0.963604, 100.424839, 'HtS9dY0-mNUktxRqAKhqvw', 57.7], // 2CPF+JXH, Jl. Kp. Jua, Kp. Jua Nan XX, Kec. Lubuk Begalung, Kota Padang, Sumatera Barat 25156, Indonesia
  ['id', -8.585232, 116.154886, 'POlTIgGwfupW-qBiIHJZtA', 161.2], // Darul Aman, Jl. Pertanian No.10, Selagalas, Kec. Sandubaya, Kota Mataram, Nusa Tenggara Bar. 83236, Indonesia
  ['id', -7.997866, 112.638791, 'mArA0SUdLuli785M4JSxsg', 17], // Perumahan Klapa, Jl. Mayjen Sungkono Gg. VI No.1 Blok F8, Buring, Kec. Kedungkandang, Kota Malang, Jawa Timur 65136, Indonesia
  ['id', -0.046434, 109.314014, 'dKD6meFyljxvDMXrU222ew', 81], // Gg. Raden Soekrisno Residence No.7, Sungai Bangkong, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat 78113, Indonesia
  ['id', -10.220992, 123.591366, 'Tpme0zpCDCG4pKp9uFAxqQ', 316.1], // QHHR+GGW, Fatukoa, Maulafa, Kupang City, East Nusa Tenggara, Indonesia
  ['id', -6.588162, 106.866902, 'RDglWKfCgdUCW8o8t6viCg', 228.1], // CV68+HX8, Cijayanti, Babakan Madang, Bogor Regency, West Java 16810, Indonesia
  ['id', 5.579399, 95.352062, '10aFy-MI8dtCyDXlbe1A9A', 258.5], // H9H2+QQ3, Jeulingke, Syiah Kuala, Banda Aceh City, Aceh, Indonesia
  ['in', 28.65009, 77.220982, 'z6xLzZajjR-x8PlGcsv-Eg', 13.7], // 60, Shradhanand Marg, Chabdi Bazar, Shah Ganj, Sadar Bazar, New Delhi, Delhi, 110006, India
  ['in', 28.605435, 77.220836, 'llbjqYkjDEG64xIBoJwS2A', 273.5], // 11, Motilal Nehru Marg, Man Singh Road Area, New Delhi, Delhi 110011, India
  ['in', 28.644751, 77.193762, '1HoqBYceW5gvaoz7aFrmag', 236.4], // Aakash Tower, 8, Pusa Rd, Block 17 A, WEA, Karol Bagh, Delhi, 110005, India
  ['in', 19.02394, 72.903044, 'c8-vgXlLm8nPIURUQrXSnw', 234.9], // 2WF3+HCQ, Vishnu Nagar, Chembur, Mumbai, Maharashtra 400074, India
  ['in', 19.092286, 72.827284, 'OgkOd5KKWZDqwoWAunqnew', 234.3], // Lovedale Apartment, Dayawati Modi Marg, Chandrabai Nagar, Juhu, Mumbai, Maharashtra 400049, India
  ['in', 19.093728, 72.916306, 'u4lWR9dI5nm4rqVBZZRVTg', 75.5], // Ajmera Sikova, 610, Ashok Silk Lane Rd, opp. Damodar Park, Nityanand Nagar, Ghatkopar West, Mumbai, Maharashtra 400086, India
  ['in', 12.933734, 77.583954, 'E6xY-t52PVIGN0Ci-Lgq1w', 81.3], // 150, 9th Main Rd, opposite Cloudnine Hospital, Jaya Nagar 1st Block, Jayanagar 3rd Block, Jayanagar, Bengaluru, Karnataka 560011, India
  ['in', 13.111987, 80.297038, 'PY_h3L9JQ35OZ6PiS5RB6g', 15.6], // 8/132, East Madha Church Street, Panaimarathotti, Pudumanaikuppam, Royapuram, Chennai, Tamil Nadu 600013, India
  ['in', 22.535921, 88.358436, 'n4tARcWVJRpRBvNLao-HPQ', 324.6], // 6A/B, Rainey Park, Rowland Row, Ballygunge, Kolkata, West Bengal 700019, India
  ['in', 17.380713, 78.485678, 'A-0aZVFevJXUNt5yqbF98g', 285], // 4-8-102, NH 65, Esamiya Bazaar, Koti, Hyderabad, Telangana 500001, India
  ['in', 18.493194, 73.85924, 'YYKguxR2srvcOvvP4YxJbQ', 129.3], // FVV5+9J5 Raghuveer Society, 23, Vedmaharshi Pandit Satvalkar Path, Mukund Nagar, Pune, Maharashtra 411037, India
  ['in', 22.99236, 72.562763, 'BKeuN-baRLobh-fKANsoCw', 194.6], // XHR7+WQ, Sendulpur, Khodiyarnagar, Behrampura, Ahmedabad, Gujarat 382405, India
  ['in', 26.897814, 75.793548, 'pSDVksVACauGg39hHsoglA', 283.9], // Pinnacle Fs Realty, 1705, Sahakar Marg, Jyothi Nagar, Lalkothi, Jaipur, Jaipur Nagar Nigam Area, Rajasthan 302001, India
  ['in', 26.827124, 80.962797, 'HXrghHkRJF_T0bO-hQwlOw', 125.5], // RXG7+V3J, Dilkusha Marg, Neil Lines, Cantonment, Lucknow, Uttar Pradesh 226002, India
  ['in', 9.967474, 76.309149, 'kdHFQHCPjPTJTsA1ePIFvg', 232.6], // X885+XMH Elamkulam Bridge, SH15, Vyttila, Ernakulam, Kochi, Keralam 682019, India
  ['in', 30.78033, 76.743364, 'X8uGxzoo45qYihJ7ZGaC_w', 98.5], // QPJV+48 DLF Mullanpur, Chandigarh, Punjab, India
  ['in', 23.217448, 77.386519, 'dO2S3lyZt4-M-UGuH-D3tg', 27.4], // B172, near Government school, Naya Basera, Kotra Sultanabad, Bhopal, Madhya Pradesh 462003, India
  ['in', 26.128286, 91.761961, 'nmdBrgPuMKjQ8LjpeLsaTg', 159.1], // A-332, Sawkuchi, Guwahati, Assam 781019, India
  ['in', 25.3338, 82.909551, 'VYC0l5i6YCPLlW1V22BXQw', 285.6], // 3119, Parajanpur, Varanasi, Maheshpur, Uttar Pradesh 221107, India
  ['in', 21.14959, 79.105096, 'Fqs3nH_5Y5NMzQd2gNr4eQ', 12.6], // 44X4+R2R, Chhota Loharpura, Gandhibagh, Nagpur, Maharashtra 440032, India
  ['in', 11.056114, 76.933112, 'DH_ZvAtGzMuD3ASPSvkuyQ', 41.4], // 13/13B, Balaji Gardens, Kavandam, Pappanaickenpalayam, Coimbatore, Tamil Nadu 641029, India
  ['in', 31.050139, 77.185916, 'ufrcqM4AN8RthrxNmv5viA', 329.1], // Junga Rd., Shimla, Himachal Pradesh 171013, India
  ['in', 20.276357, 85.860308, 'bKKSVXdRyITSQfgWPgC7NA', 330], // 555, Jharapada, Bhubaneswar, Odisha 751006, India
  ['in', 22.71962, 75.791439, 'grY2Uyd1rk4WiXvJFnItVA', 292.2], // PQ9R+RH Kordia Barda, Madhya Pradesh, India
  ['in', 31.581389, 74.860121, 'xXyvsdVzewJGK0PhAMhBpw', 47.1], // HVJ6+H2 Iban Khurd, Punjab, India
  ['in', 12.275973, 76.624616, 'mwjRqzt9ivvdVHLP_G_lVA', 217.2], // 1158, 1st Main Rd, Aravinda Nagar, Vivekananda Nagar, Mysuru, Karnataka 570034, India
  ['in', 17.666806, 83.210436, 'rZiJhSXEhtOdfdJReIjMYg', 214.9], // M686+W52, Pedagantyada, Gajuwaka, Andhra Pradesh 530044, India
  ['in', 25.561758, 85.102567, 'AyrN4yfQMZbKT_Ai3ZBv1A', 151.6], // H462+WR2, Hasanpura Main Rd, Beur, Patna, Bihar 800032, India
  ['in', 30.375401, 78.017561, '81UaTHnZdsHzHrK3m2XMdw', 196.9], // 92G9+C4G, Santala Devi Rd, Ghangora, Dehradun, Uttarakhand 248003, India
  ['in', 24.598357, 73.746509, 'Nty7mOGKFAl_acVcowk2pA', 292.2], // HPXW+7HP, Sukher Rd, Pratap Nagar, Rebariyon Ka Gurha, Rajasthan 313001, India
  ['lk', 6.889188, 79.854177, 'k-JFohUglBYwd2xXgE5beQ', 321.5], // 34 Ramya Rd, Colombo 00400, Sri Lanka
  ['lk', 7.258771, 80.624723, 'KQKD5zsmBtwb1FUdYF9XlA', 163.5], // 7J5F+PQ8, Sri Lanka
  ['lk', 6.041629, 80.26643, 'yuK3hQ64V93Td7MZMH_9fw', 3.8], // 27R8+HPQ, Galle, Sri Lanka
  ['lk', 9.639815, 79.988724, 'LJUJ1wu9GEU0-l4mhhzcjA', 47.5], // Jaffna-Pannai-Kayts Rd, Sri Lanka
  ['lk', 6.894098, 80.747391, '6ndiJogaSP3jS5ZnxYczNw', 6.5], // VPVX+C25, Rd, Lindula, Sri Lanka
  ['bd', 23.850591, 90.389829, 'JC9K5UGXdarZxC-Cc10adA', 8.9], // V92Q+6P5, Dhaka, Bangladesh
  ['bd', 22.350948, 91.767079, 'ERMQfChn7jI9l81CcCVAUA', 309.6], // 9Q29+C42, Chattogram, Bangladesh
  ['np', 27.660459, 85.338375, 'Y6DzQx8fFhobgEWYwNkiWg', 66], // M86Q+732, Bagmati Province 44700, Nepal
  ['np', 28.199863, 83.983744, 'PlXtf0215FBn8ImV3PCaEg', 239.8], // 6X2M+5F3, Pokhara, Gandaki Province 33700, Nepal
  ['bt', 27.418124, 89.624806, 'WmhPcWWYMtscAlXVhQ1qlA', 344.7], // CJ9G+GM, Bhutan
  ['bt', 27.457093, 89.393751, 'bowT6OvhSKFWwnnjLxb3CQ', 206.6], // F94V+RG Paro, Bhutan
  ['kz', 43.257549, 76.921192, '5DB34C1-SSfMeSZUCj-ExA', 325.6], // Gogol St 128/27, Алматы 050000, Kazakhstan
  ['kz', 51.2017, 71.49697, 'UYVXGgMKMVMgpnmQ9wGWCQ', 212.5], // Maşina-kölıktık park jäne öndırıstık seh, 020000 Astana, Kazakhstan
  ['kz', 42.332673, 69.650634, 'ngqMB-dF_eu_XoLWm5uf0g', 260.5], // 8MM2+5M7, Shymkent, Kazakhstan
  ['kz', 49.788322, 73.085322, 'OR6fDGOw25uZQ5jajwX-gg', 207.6], // Новоселов 351, Karaganda 100000, Kazakhstan
  ['kz', 50.312235, 57.127862, 'aCo5qT7Bc2Ql9vJ8nF-V3w', 260.9], // 846G+PVF Шанхай, Ulitsa Chekalina, Актобе, Kazakhstan
  ['kz', 49.951413, 82.608274, '7VQhS-_XrwKYUtzmrJ4MPA', 143.6], // Protozanov St 83, 070000, Өскемен 070000, Kazakhstan
  ['kz', 52.291254, 76.969174, 'SukQ0Dhqw9fw_L38u4tVAQ', 279.1], // Lermontov St 119, Павлодар 140000, Kazakhstan
  ['kz', 42.87065, 71.436216, 'r1dhJOzX7LGoVl5QeHuFtQ', 205.9], // Тектурмас Горная 73, Taraz, Kazakhstan
  ['kg', 42.846453, 74.540317, 'V-olzXmPTN5j6xMGIc8FzA', 207.6], // RGWR+F57, Bishkek, Kyrgyzstan
  ['kg', 40.526359, 72.787974, 'l8jeqImZD-9JqfvpmX-v0w', 6.8], // 118/1 Amir Temur St, Ош, Kyrgyzstan
  ['kg', 42.486227, 78.407349, 'XLhboDxnM9KS7Tgm3SC6ww', 206.7], // 217 A363, Каракол, Kyrgyzstan
  ['ru', 54.985319, 82.928154, '8THfWNdorcYrg6g1OAcYzg', 359.9], // Ulitsa Traktornaya, 2Б, Новосибирск, Новосибирская обл., Russia, 630087
  ['ru', 56.873962, 60.603643, 'G8HvzUgDPSHX4UbfFeFJVw', 243.7], // Artinskaya Ulitsa, 12В, Екатеринбург, Свердловская обл., Russia, 620017
  ['ru', 55.998166, 92.832394, 'KJEx0zTlVT2WVEftPa5wRw', 291.6], // XRXJ+7X Krasnoyarsk, Krasnoyarsk Krai, Russia
  ['ru', 52.284446, 104.246866, 'eGFkzNn4IreYyUAda3h8Kg', 70.1], // 4-Ya Zheleznodorozhnaya Ulitsa, 23Д, Иркутск, Иркутская обл., Russia, 664005
  ['ru', 43.16901, 131.913979, '2xSHrBSJd8Vp0nZSaU-DZw', 117], // Ulitsa Kirova, 111, Владивосток, Приморский край, Russia, 690068
  ['ru', 48.42734, 135.100459, 'Fg1FmEufPSk7fT8hR9o18A', 255.5], // Ulitsa Morozova Pavla Leont’yevicha, 82А, Khabarovsk, Khabarovskiy kray, Russia, 680023
  ['ru', 55.026284, 73.348112, 'usV3Nt1dRV6J32MfQ53aOA', 242.9], // Ulitsa Dunayskaya 9-Ya, 24, Омск, Омская обл., Russia, 644012
  ['ru', 56.442934, 84.906607, 'yjoc1G-IhuBhSeBB1TnJpA', 197.6], // Neizvestnaya Doroga, Tomskaya oblast’, Russia, 634028
  ['ru', 51.847618, 107.66236, 'ip3NuOH4ZlewYMJW5JxPeQ', 246.7], // Zagustayskaya Ulitsa, 195, Улан-Удэ, Респ. Бурятия, Russia, 670045
  ['ru', 61.993803, 129.710959, 'YFGVLw-DLwVsjEtfTUFIvA', 222.6], // Ulitsa Chernyshevskogo, 102, Якутск, Респ. Саха (Якутия), Russia, 677007
  ['ru', 53.365823, 83.72539, '4ZACnKzYwJqpAzIMpr58og', 124.1], // Ulitsa Kamenskaya, 1, Барнаул, Алтайский край, Russia, 656053
  ['ru', 57.156103, 65.621987, 'taTXfRdQCTuvu10tVQkE6w', 225.6], // Ulitsa Sudostroiteley, 28, Тюмень, Тюменская обл., Russia, 625034
  ['ru', 52.020439, 113.532461, 'KdtlHJVu9Mt0R75E_IKZeQ', 184.6], // ul. Lenina, 1, Чита, Забайкальский край, Russia, 672010
  ['ge', 41.702135, 44.749148, 'k8O4eh-srDMx-hx5_hFrJg', 155.6], // Kus Tba Steet, თბილისი, Georgia
  ['ge', 41.620828, 41.608576, 'vk0kdU3yTaMQYOOPLAB8Eg', 123.4], // JJ94+VQ, Batumi, Georgia
  ['ge', 42.214878, 42.687769, 'tTbCtWsQ3IRKZe4Z5hpfsQ', 229.8], // Kutaisi-Geguti-Sakulia-Bashi-Ianeti, გეგუთი, Georgia
  ['tr', 39.889602, 32.911424, '7ULg9rFuwP12mkpek6NJzA', 283.6], // Yukarı İmrahor Camii, Ege, 06270 Mamak/Ankara, Türkiye
  ['tr', 38.460296, 27.110564, 'Z8CQtEve-QSWZ-UQlOm7HQ', 66.3], // Bahriye Üçok, Berin Taşan Sk No:56, 35600 Karşıyaka/İzmir, Türkiye
  ['tr', 36.877875, 30.646238, 'J_4Rx8jTgjtXkdKcCwzUjg', 156.2], // Toros, 802. Sk. 2 B, 07070 Bahtılı Köyü Köyü/Konyaaltı/Antalya, Türkiye
  ['tr', 37.920334, 32.519778, '3guT4-0YqVy2L0RoJdhXgw', 143.2], // Horozluhan OSB, Çevreli Sk. No:6, 42110 Selçuklu/Konya, Türkiye
  ['tr', 41.003894, 39.696089, 'iD23CJjkQAbnYQH9Rk4Lbg', 74.3], // Fatih, Devlet Sahil Yolu Cd. No:305, 61030 Trabzon Merkez/Trabzon, Türkiye
  ['tr', 38.733005, 35.515411, 'eEa4msJkKx3XlBYevh3I9A', 241.6], // Tuna Life Center Avm, Mimarsinan, Batman Sk. No:15 iç kapı No:50, 38020 Kocasinan/Kayseri, Türkiye
  ['tr', 37.973926, 40.260059, 'tC4I8YwpeLMKXpKOPFI6NA', 172.5], // Yukarıkılıçtaşı, Diyarbakır-Erenli Yolu, 21200 Sur/Diyarbakır, Türkiye
  ['tr', 39.955355, 41.298515, '0Vd7bqb-jdbyDRpLD3tvqQ', 118.5], // X74X+4C Yakutiye/Erzurum, Türkiye
  ['tr', 40.190048, 29.123043, '0pkQzSAmwHaL67f2Z_bKrw', 145.8], // Mimarsinan, 2. Kaçar Sk. No:13, 16310 Yıldırım/Bursa, Türkiye
  ['tr', 37.083476, 37.430498, 'dqVPTXbr4LYo33Q949EkMQ', 342.9], // Sanayi, 60011. Cd. No:21/A, 27110 Şehitkamil/Gaziantep, Türkiye
  ['tr', 41.281626, 36.350019, 'VkBZ_p_bJ_g9SFyNW5jfog', 62.7], // Kılıçdede, Atatürk Bl. No:43, 55060 İlkadım/Samsun, Türkiye
  ['tr', 38.459457, 43.437386, 'DTzzne53KnLfseq7BHityg', 308.9], // Bakraçlı, İsimsiz Yol, 65250 İpekyolu/Van, Türkiye
  ['tr', 36.947199, 35.288411, 'YMa4lw1OqVYCxw3-0zqiSQ', 271.5], // Camuzcu, İsimsiz Yol, 01355 Seyhan/Adana, Türkiye
  ['il', 31.768421, 35.146156, 'CQJRhpcJUX1DwWPjaX8UPw', 188], // 396, Jerusalem, Israel
  ['il', 32.108348, 34.777215, 'fjzkp7kbFflvWVm3LF6oxw', 81.4], // 4Q5G+HW, Tel Aviv-Yafo, Israel
  ['il', 32.762353, 35.016395, '2rQWW1qeO0MObBuRn-8CKQ', 114.3], // Haifa University/Eshkol A Building, Haifa, Israel
  ['il', 29.567973, 34.879392, 'pVyhLbGNqTn_wJJJuyvSfQ', 90.2], // Israel National Trail, Israel
  ['il', 31.292264, 34.826853, 'o4nt6q8QGGnEtfjrTVmHZg', 77.8], // 40, Be’er Sheva, Israel
  ['jo', 31.922649, 35.911626, 'rFdz77Mfi3LgufElqJrVrQ', 261.8], // WWC6+WFV, Al-Quds St., عمّان، Jordan
  ['jo', 29.563557, 35.082174, 'z5wxZ70hM8-MyWiZP1hhbw', 185.8], // Aqaba Hwy, العقبة، Jordan
  ['jo', 32.59875, 35.85798, 'NmGanBOq4TZvOhphZZnivA', 7.2], // HVX5+G4J غرين لاند غازي الحموري (Green land), قرب اثار, Irbid, Jordan
  ['lb', 33.897975, 35.559202, '2K-O3Z1GVV3u_ZwsfBGUzg', 16.5], // VHX5+7Q7, Baouchriyeh, Lebanon
  ['ae', 25.189688, 55.239113, 'geg26PK_r7-fyNbhOaeTiQ', 296.8], // 88 Al Athar Street - جميرا الثالثة - جميرا - دبي - United Arab Emirates
  ['ae', 25.212175, 55.307781, '8rTCH1eKNJtJE5Js57fqOg', 308.6], // Zaa’beel Palace St - زعبيل الأولى - زعبيل - دبي - United Arab Emirates
  ['ae', 24.179093, 55.742443, 'IOWwo9Tka2Uf_143_2MC8w', 356.4], // 5PHR+R8V - Shiab Al Ashkhar - Zoo - Abu Dhabi - United Arab Emirates
  ['ae', 25.127145, 56.272285, 'wiqHXF1901qKUAfhNf14zQ', 158.8], // Shk. Khalifa Bin Zayed St - كِدْنَه - إمارة الفجيرة - United Arab Emirates
  ['ae', 25.782447, 55.930695, 'XmCwF8p3yCtItSGEsicSBg', 216.5], // QWJJ+W4W - Ras Al Khaimah - United Arab Emirates
  ['ae', 24.395281, 54.581808, 'AnHBq88Zzp3cSf8JsrjHig', 350.2], // 9HWJ+7W4 Parking lot - Khalifa City - مدينة خليفة ج - Abu Dhabi - United Arab Emirates
  ['qa', 25.259298, 51.586602, 'lyDACljs1v35REuDfqiJXg', 318.2], // 7H5P+RRC, Doha, Qatar
  ['om', 23.60413, 58.422997, 'rFvGUyNIPW6KNpQfIk3wlg', 102], // JC3F+M5 Muscat, Oman
  ['cy', 35.178907, 33.341434, '1YR1ucNAzGLiBG5rOP30JQ', 233.1], // Georgiou Papaverkiou 3, Λευκωσία 1107, Cyprus
  ['cy', 34.648893, 32.996762, 'dT8zAHH7es4urSDpfroh-g', 323], // JXXX+W3C, Limassol 3046, Cyprus
  ['cy', 34.976964, 33.642898, 'db8r_J3TYU409NexjwR3tg', 222.6], // XJGV+Q5 Oroklini, Cyprus
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
  const mapId = new ObjectId(ASIA_ID)
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
        name: 'Asia',
        description: "From Tokyo's neon streets to Himalayan valleys, explore Asia!",
        previewImg: 'official2.jpg',
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
    LOCATIONS.map(([countryCode, lat, lng, panoId, heading]) => ({
      mapId,
      lat,
      lng,
      countryCode,
      panoId,
      heading,
      pitch: 0,
      zoom: 0,
    })),
  )

  console.log(`Seeded Asia map ${ASIA_ID} with ${LOCATIONS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
