// Seeds the official "Europe" map. Locations cover 45 countries and territories, from Iceland and the Arctic
// to Malta, Gibraltar and the Black Sea (cities, suburbs, small towns, highways, farmland and mountains), weighted
// roughly by population. Each one is an official outdoor Google panorama, confirmed to be in the expected country
// by reverse geocoding and checked visually.
// Safe to re-run: replaces the locations, keeps play stats.
// Usage: MONGO_URI=... DB_NAME=... node scripts/seed-europe.js
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

const EUROPE_ID = '6185e0217b54baf63473a543'

// [countryCode, lat, lng, panoId, heading] - lat/lng is the panorama's position
const LOCATIONS = [
  ['gb', 51.487023, -0.18108, 'BPcDaIo3TQf4TjBI9tb5UQ', 188.2], // 2 Milborne Grove, London SW10 9SN, UK
  ['gb', 51.460438, -0.096258, 'haV-Ll5B-ekVYuRjd4GUow', 229.4], // 15 Haredale Rd, London SE24 0AF, UK
  ['gb', 53.519307, -2.177382, 'D9zkR-IeLQQB9o5ZxEtMYQ', 41], // 19 Enderby Rd, Manchester M40 0EN, UK
  ['gb', 52.504996, -1.799653, '4Zh1b8qzhgh6HBOs23sgzQ', 250.8], // 13 Shawsdale Rd, Birmingham B36 8LY, UK
  ['gb', 55.987405, -3.18875, 'dY2qR0b4o7Og4MVW3g1z7Q', 28.8], // 9 Western Harbour View, Leith, Edinburgh EH6 6PG, UK
  ['gb', 55.901264, -4.20266, 'oiNJGztz6gBQDQqVXO8e-w', 231.8], // 28 Forfar Cres, Bishopbriggs, Glasgow G64 1AL, UK
  ['gb', 51.487985, -3.175189, 'eWPfv7LBhNc8ngjgrWYEYw', 260.2], // 12 Glynrhondda St, Cardiff CF24 4AN, UK
  ['gb', 54.535515, -5.916035, 'bUB9s1jNVbRDOe8eUsP6Yg', 145.9], // 17 Mill Rd W, Belfast BT8 8HH, UK
  ['gb', 57.459887, -4.118084, 'blEG6S6KIiX3ZzQAISqq8w', 33.7], // FV5J+XQ Westhill, UK
  ['gb', 50.135928, -5.596675, 'CawGU9uxHEeFGebJXWXe3g', 304.5], // Trevean Cottage, Newbridge, Penzance TR20 8PB, UK
  ['gb', 53.974606, -1.06503, 'qLpSVlEzjrzK9p6zC9ESTw', 249.2], // 1 Templemead, Heworth, York YO31 9LQ, UK
  ['gb', 52.571194, 1.296385, 'EAcPI5uvkcPlodL2aTOxrw', 292.4], // 114 Norwich Rd, Stoke Holy Cross, Norwich NR14 8QJ, UK
  ['gb', 52.417244, -4.055733, 'PbX_ZhVcLLHm5Lp9JDQYaw', 217.3], // Bryn Goronwy, 42 Heol Alun, Waun Fawr, Aberystwyth SY23 3BB, UK
  ['gb', 54.407093, -3.156651, '4cuFHfYDTq8CsZ_8AQSwgw', 132.4], // Wrynose Pass, Broughton-in-Furness LA20 6EQ, UK
  ['gb', 56.848078, -5.096271, 'AcIK_xDn9wMI0Auf2Ofnhg', 180.3], // Serendipity, Locheil Cres, Fort William PH33 7LY, UK
  ['ie', 53.320476, -6.276227, 'ohAocuMyXaEBn9KxTrNj8Q', 296.8], // 3 Leinster Rd W, Rathmines, Dublin 6, D06 N827, Ireland
  ['ie', 51.854916, -8.499926, 'ooG4b9D5TwwkeVoIZZxUHA', 316], // San Theresa, Ashgrove, Cork, Ireland
  ['ie', 53.219947, -9.033094, 'EE8AyGCu8AuLMs8ZqztGKg', 222], // The Old School House, Tawin West, Oranmore, Co. Galway, Ireland
  ['ie', 54.640326, -8.153093, 'Sx9zL8NzicRaSlqmvnN9Xg', 355.7], // JRRW+4Q Dunuisce, County Donegal, Ireland
  ['ie', 52.060095, -9.562799, 'TOf9uLfWzzmmrrMY2VKrPQ', 207.7], // 3C6P+2V Mahony’s Point, County Kerry, Ireland
  ['fr', 48.836885, 2.316398, 'qvednrmcHQ8nJy0PcLiOWg', 153.4], // Square du Cardinal Wyszynski, Rue Vercingétorix, 75014 Paris, France
  ['fr', 48.818331, 2.34035, 'd9slQ2R3-sJ1fwe6CHL73w', 288.6], // 9 B Bd Jourdan, 75014 Paris, France
  ['fr', 45.810234, 4.880601, 'sBrzvSIVeAj4TpDyiVUcdA', 241.3], // 621 Chem. du Champ de Lière, 69140 Rillieux-la-Pape, France
  ['fr', 43.294464, 5.385906, '5-vGhStbMqDdstbVsEj85w', 214.5], // Place J.Jaures, 13005 Marseille, France
  ['fr', 44.801298, -0.597263, 'EP24E1iWAgJOH7IiBOlg_w', 339.3], // 7 Av. de l’Université, 33400 Talence, France
  ['fr', 43.590431, 1.490829, 'sOGtYBOiHB38QB-FAqfG_A', 13.1], // Julien, 31500 Toulouse, France
  ['fr', 47.179846, -1.526439, 'vadCIyFmGPflsRkkQVFEyw', 136.7], // 21 Chem. Bleu, 44400 Rezé, France
  ['fr', 48.623671, 7.696554, 'IT8SP8Y6mbIovtRRsMqUIA', 15.8], // 14 Rue du Fort Foch, 67207 Niederhausbergen, France
  ['fr', 50.567263, 3.074697, 'OV5hBOmDJTLlmTNbmEuTmg', 191.3], // A1, 59175 Vendeville, France
  ['fr', 48.410117, -4.417813, 'T1tUYmiMZXjNTMYaBqaE3Q', 208.1], // 7 Rue Rouget de Lisle, 29490 Guipavas, France
  ['fr', 45.800573, 3.105669, '2GyHY-ofL-nHCNLAX9aBig', 338.8], // 93 Rue sous les Vignes, 63100 Clermont-Ferrand, France
  ['fr', 45.893882, 1.266503, '5QH2z8G4L20EZUf0wtve7w', 76.5], // 33 Rue René Char, 87280 Limoges, France
  ['fr', 47.266437, 5.013128, 'cmaCXKh846k6V5mygLBwQg', 299.7], // 2 Chem. de Longvic, 21160 Perrigny-lès-Dijon, France
  ['fr', 43.720561, 7.258385, 'q8ozgjXSq6K3FjyeYdezbw', 229.2], // 9 Av. Guy de Maupassant, 06100 Nice, France
  ['fr', 45.905163, 6.885326, '9TCOfiaeqzKvqR_OOY607Q', 109.2], // Route Sans Nom, 74400 Chamonix-Mont-Blanc, France
  ['fr', 49.465752, 1.086714, '4wC9B_4AP0AgLMqR1cUAdA', 248.5], // 1 Grande Rue, 76130 Mont-Saint-Aignan, France
  ['fr', 41.874567, 8.783061, '6jFxjH68c3xS4avc2BrdxA', 322.7], // 5670 Bd Marie-Jeanne Bozzi, 20166 Grosseto-Prugna, France
  ['fr', 49.237498, 4.046514, 's2NvcmTP5OHVzz8-qkc84A', 113.2], // 11 Rue Albert Thomas, 51100 Reims, France
  ['fr', 42.744299, 2.934141, 'CR8KrcibHVv0vhtmT-_3SA', 40.2], // 763 La Guardiola, 66380 Pia, France
  ['es', 40.451854, -3.759805, 'vjmu9QXh1xv9Yw4_tObOKw', 314.8], // Cam. Cerro del Águila, 6, Moncloa - Aravaca, 28023 Madrid, Spain
  ['es', 40.409978, -3.674877, 'yxreC5i0_00BDbzZGlJ36g', 334.4], // C. de Antonio Bienvenida, 1, Retiro, 28007 Madrid, Spain
  ['es', 41.407512, 2.225078, 'PNula5NPiyOzc8yTmFTQEA', 158.9], // Moll de la Vela, Sant Martí, Barcelona, Spain
  ['es', 37.380905, -5.953768, 'ScduIsVwDpIuGbIkCPLSdA', 341.8], // C. Carlos Marx, 32, 41006 Sevilla, Spain
  ['es', 39.461355, -0.331214, 'Bt3pJlHFa6nWwB4btKYQbg', 269.9], // Sc Puerto Concesion, 1A, Poblats Marítims, 46024 València, Valencia, Spain
  ['es', 43.25807, -2.919896, '5JyZBPQvS5sYvt7a26yHWA', 91.8], // Iturribide Kalea, 5, Ibaiondo, 48006 Bilbao, Bizkaia, Spain
  ['es', 41.623683, -0.966594, 'ZwG-tWCgDbly6yV-P9QLpw', 144.5], // Catedral De Santiago / Fuente De Neptuno, Casablanca, 50022, Zaragoza, Spain
  ['es', 36.743996, -4.35493, 'jpnkLm7taxL3NdEtieoy8A', 267.2], // PJVW+H2 Málaga, Spain
  ['es', 43.380799, -8.43688, 'IGQOJM9ewVGXm49I99jrPA', 37.8], // Av Fernando Suárez García, 15011 A Coruña, Spain
  ['es', 41.016016, -5.646834, 'JTKQ5Iebw0V6Q27EFOSbbA', 42.6], // Av. Cabrerizos, 37184 Villares de la Reina, Salamanca, Spain
  ['es', 37.195407, -3.612136, 'Q1W21nDhju8QYrqWDmHVqQ', 72.3], // C. Estocada, 6, Beiro, 18014 Granada, Spain
  ['es', 38.891514, -6.962739, '74gCf4RSbPK3ASIMrJLztw', 18.8], // Vía Sin Nombre, 06007 Badajoz, Spain
  ['es', 39.023015, -1.842076, 'DlhMLdCZQ_PNlxYlxo6mAA', 219.9], // Cam. de Albacete a Miralcampo, 02005 Albacete, Spain
  ['es', 43.341106, -5.87565, 'nGDqoyQdnERJwhFRrfKuLQ', 62.4], // Av RICHARD GRANDIO, s/n, 33193 Oviedo, Asturias, Spain
  ['es', 39.589656, 2.58469, 'H402POANRR-FKunAGIsNXg', 126.4], // Carrer Binicaubell, 143, Ponent, 07013 Palma, Illes Balears, Spain
  ['es', 42.338156, -3.701815, 'TZH6X9ebTtMtaES5AnNqqg', 88.9], // Calle Madrid, n1, 09001 Burgos, Spain
  ['pt', 38.727162, -9.193202, 'sy3j8PeAjKBOGzgf-rPFKA', 154.2], // Cruz Oliveiras, Lisboa, Portugal
  ['pt', 41.178754, -8.612076, 'aEMUiEOSTxuUOnx-L2Sn6w', 279.3], // Bairro do Carriçal 274, Porto, Portugal
  ['pt', 37.034564, -7.914848, 'lMLIzIgSsu1GS1OzSnI0EA', 128.5], // Cam. 4242, Faro, Portugal
  ['pt', 38.611769, -7.942693, 'dnSWWLjm8uo-KjELDITwhg', 282], // Quinta de S. Pedro, Portugal
  ['pt', 41.766312, -6.768779, '8GIZJlAgsoKqDm6hm1vxnA', 98.6], // Q68J+GF Samil, Portugal
  ['pt', 40.151468, -8.415877, 'GHcyZ32HcqN9t4N8ablwiA', 158.2], // Estr. Pereiros 170, Castelo Viegas, Portugal
  ['de', 52.515516, 13.323223, 'irH34B_4svFCgvU1kCvstw', 255.7], // Marchstraße 12-14, 10587 Berlin-Bezirk Charlottenburg-Wilmersdorf, Germany
  ['de', 52.545373, 13.44077, '094Fedq7-sUqwkg43su8qQ', 257.5], // Schieritzstraße 24, 10409 Berlin-Bezirk Pankow, Germany
  ['de', 48.188748, 11.613037, 'CuP8EIdyILo719FkqJrCGQ', 174.1], // Zinnienstraße 6, 80939 München-Schwabing-Freimann, Germany
  ['de', 53.563075, 10.050279, 'EDTZ7Elui3gjY9AY1F12fQ', 193.7], // Marienthaler Str. 99, 20535 Hamburg-Wandsbek, Germany
  ['de', 50.934176, 6.862809, 'SML5FX62dlOZMAe_Wf-jSA', 178.2], // Sudetenweg 48A, 50858 Köln-Lindenthal, Germany
  ['de', 50.149423, 8.621152, '4sD85Kou7RwmN3CziDR2LA', 268.5], // K814 32, 60488 Frankfurt am Main-Frankfurt-Mitte-West, Germany
  ['de', 48.781434, 9.099043, 'NlqvxT4X87-pzfmgbtUxpw', 174.2], // Oberer Kirchhaldenweg, 70197 Stuttgart-West, Germany
  ['de', 51.321033, 12.366642, 'fV4gGAvszvlJizztDgklug', 223.7], // Kurt-Eisner-Straße 5A, 04275 Leipzig-Süd, Germany
  ['de', 51.083214, 13.758202, '-z---TFvwrCdgAo991cYDA', 313.8], // Magazinstraße 9-11, 01099 Dresden-Klotzsche, Germany
  ['de', 52.428212, 9.708662, 'fe6mbImZ5H8mMLp1hT8i7A', 201.4], // Alt-Vinnhorst 82D, 30419 Hannover, Germany
  ['de', 49.408646, 11.070093, 'yrHzAWwyAWgPlXYh-HQNsQ', 90.2], // Finkenbrunn 169, 90469 Nürnberg-Süd, Germany
  ['de', 54.306613, 10.028906, '3nQrxexLMT9oiiMYM-EeMQ', 232.2], // A210, 24239 Achterwehr, Germany
  ['de', 48.028367, 7.851927, 'RokP5zR-oWAJg3UTZSHXxw', 2], // Robert-Bunsen-Straße 1A, 79108 Freiburg im Breisgau-Nord, Germany
  ['de', 54.086974, 12.188604, 'pIpuyxg1yCZ-Y1S4akagWQ', 288.6], // Albert-Schulz-Straße 13, 18055 Rostock, Germany
  ['de', 50.997724, 10.961726, 'mvpNUVPHYID0_UM9Et2krg', 37.4], // Marbacher Ch, 99100 Erfurt-Salomonsborn, Germany
  ['de', 49.723722, 6.663708, 'pXdbDYyDgaApUadQys50Ew', 128.3], // Straße Ohne Straßennamen, 54296 Trier, Germany
  ['de', 48.557924, 13.416413, 'Cx1H5Tusrzvh6PCcxPI-lA', 274.1], // Pionierstraße 2, 94036 Passau, Germany
  ['it', 41.920257, 12.547732, 'nOG2Oo7LAN3Se9K5VtUb8Q', 222.3], // Via di Pietralata, 320 /e, 00158 Roma RM, Italy
  ['it', 41.935488, 12.497492, 'XGbdlXzy67WgMnzpQI03mg', 243.9], // Moschea, 00199 Roma RM, Italy
  ['it', 45.429785, 9.117143, 'qqOzAINv63w2G9JmDmBMKQ', 79], // Via Nearco, 16, 20090 Buccinasco MI, Italy
  ['it', 40.82759, 14.24881, '1EjWW-dYyejnhBIAD4ctnQ', 312.6], // Via Eldorado, 18, 80132 Napoli NA, Italy
  ['it', 45.046475, 7.628075, 'ZO61EniGIvkj8FDi3S0r4w', 306.7], // Via Barnaba Panizza, 7, 10137 Torino TO, Italy
  ['it', 43.732713, 11.275455, 'MWdjY14zAqqM4nYfPWFL4Q', 146.2], // Via dell’Uccellarone, 10, 50012 Bagno a Ripoli FI, Italy
  ['it', 44.512959, 11.369009, '8aaV2CPL9R49R-DQ2mcXdQ', 134.6], // Parcheggio Nord, Via Ondina Valla, 38, 40127 Bologna BO, Italy
  ['it', 45.4885, 12.236006, 'tcSKhRGxMxHQj3NfdC1nAw', 334.7], // Via Giovanni Felisati, 67, 30171 Venezia VE, Italy
  ['it', 41.099061, 16.904574, 'zcnYF327dyto1YafbBdyFg', 196.2], // Rocca (Ecopoli), 70126 Bari BA, Italy
  ['it', 38.140945, 13.345866, '7qzZYE3io0eD0Ue7n-6vnA', 110.8], // Via F. Cordova, 74, 90143 Palermo PA, Italy
  ['it', 37.523165, 15.116303, 'oDkUXGU7SMCLdr5lnjXYKw', 170], // Viale Ruggero di Lauria, 145, 95126 Catania CT, Italy
  ['it', 39.193371, 9.059888, 'ozQ38xhpm12CoRHa93mKFA', 113.7], // S.da Statale 195 Sulcitana, 19, 09123 Cagliari CA, Italy
  ['it', 46.502124, 11.359975, 'nPgR2YN9qxeg3In_C_QuNQ', 287.4], // Via Monte Tondo, 3, 39100 Bolzano BZ, Italy
  ['it', 44.391921, 8.951663, 'hV7NEpteEV4dI4kqJQ6asA', 266.3], // Giardini Gilberto Govi, Via Mario Cappello, 16145 Genova GE, Italy
  ['it', 43.108876, 12.383501, 'B-a_55LhvyuTC8q69Q32xA', 183.8], // Via S. Prospero, 2, 06123 Perugia PG, Italy
  ['it', 38.090916, 15.694799, 'vIDWfR4UkPO6MWqjji8y2Q', 92.2], // Via Domenico Martino, 64, 89133 Reggio Calabria RC, Italy
  ['it', 42.430803, 14.275131, 'MqlYAaWrRzZP_viORsCS6w', 211.9], // Via Sangro, 1, 66023 Francavilla al Mare CH, Italy
  ['nl', 52.374099, 4.834245, 'G_6YSu9bHOwJ6yIGlYsSsg', 15.5], // Johan Broedeletstraat 37, 1064 AA Amsterdam, Netherlands
  ['nl', 51.951027, 4.558119, 'GLmuIqYGITgfDIVo7J_8vg', 0.9], // Watermanweg 301, 3067 GA Rotterdam, Netherlands
  ['nl', 53.21725, 6.574991, 'CtUVbXqBJEK6RYFrzNTNDA', 231.4], // Damsterdiep 10, 9711 SK Groningen, Netherlands
  ['nl', 50.848723, 5.770415, 'vd44DvLFr-i0q6hmqa9qOw', 73.2], // Bemelerberg 5B, 6268 NA Bemelen, Netherlands
  ['nl', 52.538393, 6.115816, 'MbMA526sSMkH8TicXM_oNg', 33.6], // Brinkhoekweg 55, 8034 PB Zwolle, Netherlands
  ['be', 50.806493, 4.416475, 'z_6FMz1YKkuUzho44457Bg', 270], // Av. des Cailles 44, 1170 Watermael-Boitsfort, Belgium
  ['be', 51.214095, 4.46349, 'hnsqk8uAHJSX_avNuon6rQ', 114.5], // Deurne Sterckshof, 2100 Antwerpen, Belgium
  ['be', 50.61575, 5.674045, '50YXN_InzJ7TcX_nDXh3iw', 184.3], // Av. des Martyrs 75, 4620 Fléron, Belgium
  ['be', 51.174565, 3.166321, '0u3xC-kMgj9aNzI6P9hNRQ', 16.9], // Diksmuidse Heerweg 443, 8200 Brugge, Belgium
  ['be', 49.985002, 5.804471, 'mPJHcGdFQuKsWlRrlF9Gng', 274.5], // N84, 6600 Bastogne, Belgium
  ['lu', 49.644119, 6.147895, '57--wop_xcBJdDQ6YrW9ZA', 317.3], // 89 Mnt de Dommeldange, 1419 Dommeldange Luxembourg
  ['mc', 43.738346, 7.420493, 'OyjR3WC-34xEvGzkT37haQ', 195.7], // 5b Bd de Suisse, 98000 Monaco
  ['li', 47.143302, 9.515296, '8PjcL2PN1XJiQPWF_X_-Jg', 228.7], // Forellenweg 21, 9490 Vaduz, Liechtenstein
  ['ad', 42.524962, 1.520592, 'FRJU5eWrnmFukMsG4m8dtA', 293.9], // CG-3, AD400 La Massana, Andorra
  ['sm', 43.949469, 12.449759, 'LPfkZp8b13E0bS2xO269oA', 192.3], // Via Ca’ Bartoletto, 11A, 47893 Cailungo, San Marino
  ['ch', 47.384336, 8.563745, 'JQ2nx7JudnziyDCPdLn7TQ', 179.5], // Orellistrasse 7, 8044 Zürich, Switzerland
  ['ch', 46.163354, 6.139082, 'Z9hZc_RdHeqgK9lCdkrzNA', 40.4], // Chem. du Champ-Carré 28, 1256 Troinex, Switzerland
  ['ch', 46.89302, 7.403337, 'muWlMiXBTcnmZUnS9R6U0w', 108.9], // Gaselweidstrasse 28, 3144 Gasel, Switzerland
  ['ch', 45.941892, 8.964298, 'DeFCaI1lUl9TSTSwcj5PSw', 211.5], // 2 20, 6816 Bissone, Switzerland
  ['ch', 46.866323, 9.537629, 'UVwRtkEC5K00y56cXdNPLA', 240.4], // Carmennaweg 83, 7000 Chur, Switzerland
  ['ch', 46.633251, 7.908507, '9oeLyLrcBJUfDRKm0XqzHQ', 148.5], // Boden 15A, 3815 Gündlischwand, Switzerland
  ['at', 48.221171, 16.343219, 'Ai8hfof-QeRoHM1hWu7yxA', 135.7], // Währinger Gürtel 33/5, 1180 Wien, Austria
  ['at', 47.829355, 13.003522, '06h20pDG_nx2GKF9Zxy51A', 171.9], // B155 117, 5020 Salzburg, Austria
  ['at', 47.270124, 11.359889, 'JqAnyW-QKFCC4X5bgu_8ug', 93.6], // Schneeburggasse 211, 6020 Innsbruck, Austria
  ['at', 47.03189, 15.374511, 'mW81sdimPLtHiGlR2YvIZA', 236.7], // Kehlbergstraße 152, 8054 Graz, Austria
  ['at', 48.311336, 14.26334, 'EDCXSf89nH8UgE32V_DuXg', 299.2], // Windflachweg 2, 4040 Linz, Austria
  ['at', 46.62772, 14.235574, '6Q-nqHh0q0lNzkrVfN7aMg', 35.8], // Buchenweg 8, 9201 Krumpendorf am Wörthersee, Austria
  ['dk', 55.678959, 12.466754, 'u_HNGRF8Ywb416jbq4-04g', 110.7], // Minervavej 9, 2610 Rødovre, Denmark
  ['dk', 56.104419, 10.187473, 'ah9ccPP6_N45eH96FnekLw', 142.8], // Nordlige Bjergevej 9, 8270 Aarhus, Denmark
  ['dk', 55.424594, 10.384091, 'Kh4QDN3PyMJv_5jDkAlX1g', 10], // Havnegade 82, 5000 Odense, Denmark
  ['dk', 57.039766, 9.882648, 'bLMI40gs6d24yDRuC232EQ', 247.3], // Strøybergsvej 92, 9000 Aalborg, Denmark
  ['dk', 55.473566, 8.45645, 'Kttko_3RzV00jHDZ6lFDgA', 108], // Finsensgade 35, 6700 Esbjerg, Denmark
  ['fo', 61.993789, -6.794763, 'YCgmsH7wY4mLmfiqOV3pdg', 91.9], // 108 Við Klingurstjørn, Argir 160, Faroe Islands
  ['no', 59.951459, 10.814938, 'LCcmFXyCnYK-OjpH794TXg', 5.1], // Østreheimsveien 28A, 0590 Oslo, Norway
  ['no', 60.369042, 5.368537, 'jTD6Q_g9Mn72LKeDBv92mA', 188.4], // Sollien 18, 5096 Bergen, Norway
  ['no', 63.429247, 10.277544, 'esWi180ZKXyQNrHD2O28OA', 80], // Tømmerdalsveien 368, 7020 Trondheim, Norway
  ['no', 59.008112, 5.721054, 'qnGHf0tHUbEpVxFBvBXKpw', 328.9], // Skeiehagen 76, 4083 Hundvåg, Norway
  ['no', 69.639934, 18.923073, 'Ab4pFti8Ige91VU7E0M6Tg', 183.7], // Henrik Wergelands veg 16, 9007 Tromsø, Norway
  ['no', 67.283556, 14.423334, 'CI1g_DlZVFh04ccPNuy4Kw', 14.6], // Thalleveien 14, 8076 Bodø, Norway
  ['no', 61.104015, 10.39004, 'xgqLtFQqwV8ilDvT1gJNbA', 100.6], // Saksumdalsvegen 465, 2608 Lillehammer, Norway
  ['no', 58.141527, 8.054294, 'z69SP2cwiTTAxDZRWY5pPw', 210.6], // Sømsveien 88, 4637 Kristiansand, Norway
  ['no', 62.509378, 6.06743, 'ppJPd_ja3iMpWE0cybli_w', 4.4], // FV5957 1080, 6052 Giske, Norway
  ['no', 69.989045, 23.281632, 'j32PWnCIHUxJvr52Oa8KXg', 34.7], // Linekroken 19, 9515 Alta, Norway
  ['se', 59.334927, 18.022264, 'vNrwC-o3JBa8B9I0rAO_tw', 14.5], // S:t Görans sjukhus, 112 19 Stockholm, Sweden
  ['se', 57.763305, 11.926188, 'y6uA120xS0Npq9NHDHwHrA', 150], // Petters Hage 33, 417 46 Göteborg, Sweden
  ['se', 55.562797, 12.944025, '5OKGbs23oODQazNLv9WqOQ', 350.2], // Blåsebergavägen 46, 216 35 Limhamn, Sweden
  ['se', 59.884309, 17.620065, 'KKVDrPIMWfztnZGoBdLJpQ', 172.8], // Bärbygatan 24, 753 37 Uppsala, Sweden
  ['se', 63.151873, 14.679339, 'zXgKigqxbKuKGpnfv7a7bA', 353.7], // Landgången 2, 831 61 Östersund, Sweden
  ['se', 63.771585, 20.261863, '-KRS1izf8aM3d6wdnNJBHQ', 175.4], // Degernäs 230, 905 80 Umeå, Sweden
  ['se', 67.850494, 20.224527, 'uPFkJXlWpcVoV4p4WmptZw', 121], // 34, 981 31 Kiruna, Sweden
  ['se', 59.366285, 13.514474, 'RZqCliDpvC_0Z7cVfGPThQ', 339.2], // Kanikenäset 29, 652 13 Karlstad, Sweden
  ['se', 56.683048, 16.360319, 'wVfUm-Euz7jUEU19YkIIQA', 243.8], // Svinövägen 14, 392 36 Kalmar, Sweden
  ['se', 62.432671, 17.395192, 'ZmrYs1efcL_-MdFHkNhVOg', 114.8], // Alnöbron, Sweden
  ['fi', 60.181329, 24.904892, 'Wu80WFeqdD7CXI-PnAOA5w', 220.9], // Rajasaari Koirapuisto, Rajasaarenpenger 9, 00250 Helsinki, Finland
  ['fi', 61.541566, 23.826616, 'FBlApVJdpWpNUI0n2_v04Q', 106.9], // Hirviniementie 250, 33680 Tampere, Finland
  ['fi', 60.471298, 22.18317, 'l333NHIIurdD0_6IyO7M6g', 34.4], // Siirinraitti 7, 21260 Raisio, Finland
  ['fi', 64.990145, 25.324252, 'SAI28Sbh0_gsynlHo9rFuQ', 28.4], // Varjakantie 228, 90470 Oulu, Finland
  ['fi', 66.554946, 25.827201, 'yjazT8iaDdFYpRbVuUCBAA', 6.6], // Lentokentäntie 1, 96930 Rovaniemi, Finland
  ['fi', 62.898897, 27.693861, '_BMs9QnNLKK55w--aBlrsw', 140.4], // Juhani Ahon katu 2, 70500 Kuopio, Finland
  ['fi', 62.586577, 29.732284, 'yjwIL5YaDTdE1jJ6HTFaeA', 277.3], // Luostaritie 92, 80220 Joensuu, Finland
  ['fi', 63.058687, 21.593713, 'apwZGFn1PEuyzYHS5vRtCA', 320.7], // Böljanintie 44, 65410 Vaasa, Finland
  ['is', 64.156097, -21.865477, 'JGVEaXfFETuNdXjg3HuToA', 315.9], // Skarfagarðar 6, 104 Reykjavík, Iceland
  ['is', 65.644544, -18.089257, 'dB_Gu4o9J-U3MXs0-0YHCw', 354.3], // Kjarnaskógur, Akureyri, Iceland
  ['is', 63.419477, -18.94545, 'DoO7U07ZXk3zgcG0ajE3Yw', 288], // 1, 871, Iceland
  ['is', 65.290177, -14.51871, 'tVQrU3k6cXaWFkBE2vCEVg', 334.7], // Egilssel, 701, Iceland
  ['ee', 59.449046, 24.81439, 'CcnqGUGd1ILJRIQFtUkjdg', 34.5], // Mäe tn 3a, 13628 Tallinn, Estonia
  ['ee', 58.402202, 26.729778, 'QVgMwQkyQOzD3x7mlFHGsg', 307.7], // Mõisajärve tn 7, Raadi, 60534 Tartu maakond, Estonia
  ['ee', 58.420922, 24.43765, 'NFT6Yz89mW-sTO_C8OJ0Vw', 333.7], // Ojakalda tee 39, Lemmetsa, 88311 Pärnu maakond, Estonia
  ['lv', 56.955144, 24.129267, 'AA9CnkoNClRDorw8gP_jqQ', 78.8], // Krišjāņa Barona iela 60, Centra rajons, Rīga, LV-1011, Latvia
  ['lv', 55.846552, 26.576323, 'CNJzC-JMwDpO_-DYdYHWMw', 12.3], // RHWG+JG Cīrulīši, Tabores pagasts, Augšdaugavas novads, Latvia
  ['lv', 56.556445, 21.042558, 'fZOKuZh8fUahVMY5ZKqhvQ', 232.5], // Viršu iela 7, Liepāja, LV-3402, Latvia
  ['lt', 54.656135, 25.199543, 'Ne2zze8IGzJCh2g_xjV0Yw', 63.2], // Bukčių g. 56, Vilnius, 04127 Vilniaus m. sav., Lithuania
  ['lt', 54.850604, 23.887976, 'RiZpyt02jd1yGDZD5Rb2rA', 109.5], // Šermukšnių g. 33, 53273 Teleičiai, Lithuania
  ['lt', 55.685657, 21.113478, 'MPg1J9pM4LSs1VKhOy9oJw', 145.2], // 167, 93100 Klaipėda, Lithuania
  ['pl', 52.201045, 20.999792, 'tuh4aPd5aqzLid6XeCwDrQ', 101.1], // Kulskiego 01, 02-507 Warszawa, Poland
  ['pl', 50.067038, 19.930011, 'oUliBtM5aO2Gx0uOM8dMaw', 282.5], // Stefana Batorego 19, 31-135 Kraków, Poland
  ['pl', 54.341284, 18.641076, '8oZxmAPtqpUFoytS77OLGw', 81.5], // Zaroślak 30, 80-811 Gdańsk, Poland
  ['pl', 51.092469, 17.132677, 'u8nPc4UDYer4NTppfQqTmg', 15.2], // Opatowicka 130, 52-028 Wrocław, Poland
  ['pl', 52.425865, 16.916827, 'ZZZwhp-aNFOFUxzmQwsrxw', 92.6], // Maczka 17, 60-660 Poznań, Poland
  ['pl', 51.771817, 19.506959, 'vWnf0ehRxPqUOnFhybsvZw', 150.4], // Czechosłowacka 4, 92-216 Łódź, Poland
  ['pl', 51.220165, 22.598918, '5Rsa78lP_ac4z4VLXCj59g', 166.6], // 6HCX+3H Lublin, Poland
  ['pl', 53.130894, 23.165098, 'bDz9IHtvOsZ0ACx2pnnIPg', 245.5], // Medical University of Białystok, Legionowa 1, 15-099 Białystok, Poland
  ['pl', 53.433088, 14.556418, '9twKEziK1LjHCztGEdWZAw', 53.1], // Plac Rodła 8, 70-419 Szczecin, Poland
  ['pl', 50.002416, 22.061485, 'P2c5K4QgKmRiPhXWFhUb7w', 318.8], // Jerzego Kukuczki 32, 35-330 Rzeszów, Poland
  ['pl', 49.326768, 19.93719, 'eeliPY0BGWia91zlzcuWgw', 273.3], // Ligasówka 104, 34-521 Ząb, Poland
  ['cz', 50.101904, 14.438181, 'ytDXMQH1dwwqWzMdi674TQ', 22.1], // Bubenská 1598/8c, 170 00 Praha 7-Holešovice, Czechia
  ['cz', 49.200903, 16.69459, 'msRuQ2wTL3roB1usNMNKCQ', 282.6], // Muzeum dopravy, 628 00 Brno-Brno-Líšeň, Czechia
  ['cz', 49.867131, 18.266086, 'irZqQS-LnZ6XrwXxqU4gFA', 312.1], // Pod Landekem 64, 725 29 Ostrava-Petřkovice, Czechia
  ['cz', 48.925061, 14.438484, '4FdsALi5Fap7QQw1bO9q6g', 10.1], // Boršov nad Vltavou 27, 373 82 Boršov nad Vltavou, Czechia
  ['cz', 50.736505, 15.048196, 'UWnj7jamJlN0ptrznNfv4A', 359.5], // U Dráhy 413, Doubí, 463 12 Liberec, Czechia
  ['sk', 48.161014, 17.108061, 'IEhbWovXP37VAV8QtB8SRw', 191.6], // Vančurova 1700/13, 831 01 Bratislava-Nové Mesto, Slovakia
  ['sk', 48.714875, 21.203422, 'SzTs12OZKhvvT5RPOoOcyg', 172.6], // Na kope 273/83, 040 16 Košice-Myslava, Slovakia
  ['sk', 49.171768, 18.711096, 'HbTaxyFTBUg6Y3GSVYVMwg', 45.4], // Na pleš 723, 013 11 Lietavská Lúčka, Slovakia
  ['hu', 47.51633, 18.998947, '3Y6wcATCpSAhvT6ml_-aWg', 282.2], // Budapest, Szilágyi Erzsébet fasor 24, 1125 Hungary
  ['hu', 47.517323, 21.650954, 'gkce5H_k6K3g73yyw4UBxg', 236.1], // Debrecen, Karabély St 2, 4030 Hungary
  ['hu', 46.293826, 20.08176, '7fbyuRdkd6KeikoKXCSmNQ', 47.6], // 73VJ+GP Szeged, Hungary
  ['hu', 46.107124, 18.200207, 'xY6i-V2Nrv8uPQtoK-ykYQ', 332.8], // Pécs, Lapisi Way, 7635 Hungary
  ['hu', 47.652977, 17.600699, 'hBS_uXrq__2o3wHJxuFfEQ', 32.5], // Győr, Európai utak 75, 9012 Hungary
  ['si', 46.001885, 14.480277, '_wgFfNpKyOLleI1y9JJ1EQ', 93.4], // Črna vas 243, 1000 Ljubljana, Slovenia
  ['si', 46.529804, 15.691555, 'xX0Z0YiMpyrvICIfcy4-sg', 52.1], // Jarčeva ulica 55, 2000 Maribor, Slovenia
  ['hr', 45.810831, 15.930112, '71ugtEzDfMR6nxxdWROPwQ', 9.5], // Zagrebačka cesta 60, 10000, Zagreb, Croatia
  ['hr', 43.51716, 16.456196, 'RDgaZ3gxSS5GL6dHPUZVew', 156.4], // Karlovačka ul. 4, 21000, Split, Croatia
  ['hr', 45.373584, 14.510638, 'K9mKh_h9__uMCeUrzBIqXg', 270.6], // Kikovica 6, 51218, Soboli, Croatia
  ['hr', 45.552471, 18.643818, 'mv3Ow72HJfsAVpUvHMzU5w', 244.4], // Kolodvorska ul. 148-B, 31000, Osijek, Croatia
  ['hr', 42.672488, 18.131629, 'uErqWUgThWXPCpnVv-H3Hg', 278.1], // Ul. Rožat Donji 15, 20236, Rožat, Croatia
  ['rs', 44.752582, 20.470877, 'jUuhzwF59fnVakK7Ofhc8w', 17.3], // Plitvička 35a, Београд, Serbia
  ['rs', 45.283451, 19.820033, 'dCuRH7tedsMhRgM_4bv8kA', 275.5], // Klisanski put 8А, Novi Sad, Serbia
  ['rs', 43.271436, 21.925489, 'K9E5LtVWfKWwhq-FjvJ0nw', 135.1], // Победе 157, Габровац, Serbia
  ['me', 42.405303, 19.290985, 'LwqhQHGuEJy9moPvjJ_l-g', 243.1], // Plantaže 13. jul (A), Podgorica, Montenegro
  ['me', 42.438796, 18.822984, 'uf967xvvU3UsbxrstqJu6w', 136], // CRQF+858, Erakovići, Montenegro
  ['al', 41.332434, 19.786001, 'qiiNPWY-yR0_JwChbIu4pw', 17.9], // 8QMP+3M4, Tiranë, Albania
  ['al', 42.06383, 19.43807, 'PQ-QKYj3mA2s7yILsim_gg', 71.4], // 3C7P+FV8, Shkodër 4001, Albania
  ['al', 40.488664, 19.517501, 'aQgyxaVGUhIWseC3P6eBhA', 222.2], // Rrugë Pa Emër, Albania
  ['mk', 42.021058, 21.464321, 'QoJIgFCUMCysRumAVBqREw', 340.2], // Rrugë Pa Emër, Shkupi 1000, North Macedonia
  ['mk', 41.069173, 20.800574, 'TYT44rzjd6tI96Ci-V5pNA', 265.8], // 3R92+M6 Sveti Stefan, North Macedonia
  ['bg', 42.670866, 23.290205, 'ETcbEGqP5YU4dFZRKqUAlA', 288.6], // ж.к. Красно село - кв. Борово, Solun St 45, 1680 София, Bulgaria
  ['bg', 42.106965, 24.728743, 'TMDXc9qSCLdQ0ug-xUrpFg', 38.2], // 196 Овощарски институт, Yuzhen, 4004 Plovdiv, Bulgaria
  ['bg', 43.258317, 27.927224, 'PKe_N0LCIsVNl-PLz5Dy6g', 357.6], // Pŭt Bez Ime, Varna, Bulgaria
  ['bg', 42.553732, 27.474859, '-yrKsg9r_srdbhr0W69k7Q', 149.1], // HF3F+FW Burgas, Bulgaria
  ['bg', 43.029779, 25.597384, 'FqaRYF0NDdfvgyIM0o-Dbw', 98.1], // 5, 5030 Debelets, Bulgaria
  ['ro', 44.432276, 26.139155, 'xcr717Y7lCpClPjzTI2Omg', 227], // Bulevardul Basarabia nr. 2, București, Romania
  ['ro', 46.754189, 23.595934, '_JmteXR1fz5SxnxMLCovNA', 331.5], // Calea Turzii 136, 400347 Cluj-Napoca, Romania
  ['ro', 45.72121, 21.19713, 'CIIq_MyeW4cVOCakOND2gg', 232.4], // Strada Sulina 3, 300516 Timișoara, Romania
  ['ro', 47.200445, 27.539082, 'NwgeUi5bZoYFnaffjM71-Q', 132.2], // Tudor Vianu nr. 2A, 700490 Iași, Romania
  ['ro', 44.160807, 28.608627, 'gq2OhxAjkl0kE3K7YRoFdw', 150.6], // Bulevardul Aurel Vlaicu 96, 900007 Constanța, Romania
  ['ro', 45.596178, 25.566371, 'L7yqMvPHkMQt5NDquAuqgA', 259.1], // HHW8+FG Brașov, Romania
  ['ro', 45.808601, 24.098785, 'ucnqmTRuWtODZs0OGzk40A', 328.4], // Calea Șurii Mici, Sibiu, Romania
  ['ro', 47.624275, 26.203292, 'drTaDSfwhTAnqj6kIDRGzw', 213.2], // Strada Prefect Dimitrie Cojocaru 112, 727528 Sfântu Ilie, Romania
  ['gr', 37.995203, 23.692517, 'xCQ2TDUFrknD31vYGyOEAw', 49.8], // Par. Leoforou Kifisou 174, Egaleo 122 42, Greece
  ['gr', 40.581666, 22.940487, 'h_w4kB_uEvV-mAFDilfVYg', 329.9], // HWJR+M5 Kalamaria Municipality, Greece
  ['gr', 38.217601, 21.718604, 'jyBD6mGFGbKZyiHeTip3_w', 34.8], // Akti Dimeon 89, Patra 263 33, Greece
  ['gr', 39.640777, 20.858548, 'bAM2OIQ54SIVqCFoE1WZQg', 269.1], // Aristoteli 33, Ioannina 452 21, Greece
  ['gr', 35.339855, 25.114197, 'N2Fi9-rodHVO9C3H7IKboQ', 124.8], // Machis Kritis 113, Iraklio 713 03, Greece
  ['gr', 39.68306, 22.453452, 'GIuAhZ2YneReR0vxKs6jPQ', 266.9], // PEO Athinon Thessalonikis, Larisa 415 00, Greece
  ['gr', 37.019626, 22.146076, '1uwIwBISylGr1tmbhGGT5Q', 345.5], // Navarinou 260, Kalamata 241 00, Greece
  ['gr', 40.850746, 25.803241, '1WJNSA-NQl9L7RuREwxtCg', 281.6], // VR22+9X, Alexandroupoli 681 00, Greece
  ['mt', 35.907776, 14.507084, 'bAfut-CIDK5l7EFUsNso3g', 260.1], // 36 Tigné Seafront, Tas-Sliema, Malta
  ['mt', 36.05456, 14.23725, 'b4Lg03-tamk0Xrr8iR5gVA', 185.6], // 363P+PX6, Triq L Imghallem, Ir-Rabat Għawdex, Malta
  ['tr', 41.049285, 29.021649, 'au4jTcYEgEhQdjpQ-fAs8A', 98.2], // Mecidiye, Aladoğan Sk. No:16, 34347 Beşiktaş/İstanbul, Türkiye
  ['tr', 41.713996, 26.505657, 'hFPaEOjhduLW7ML-qjF5gA', 29.7], // İly.İlt.-Ekmekçi-Karabulut, 22130 Ekmekçi/Edirne Merkez/Edirne, Türkiye
  ['ua', 50.482756, 30.528178, 'ywZvfYzWwhP4-EledKLKzw', 140.9], // Elektrykiv St, 26, Київ, Ukraine, 02000
  ['ua', 49.873596, 24.077611, 'EgC_5BlUyE2hhUPwzh_raA', 175], // V3FH+C2 Lviv, Lviv Oblast, Ukraine
  ['ua', 46.477247, 30.761489, 'DbR3DSRkSagHtNV6_5Z1IA', 191.2], // Ланжероновская арка, Пляж Ланжерон, Odesa, Odes’ka oblast, Ukraine, 65000
  ['ua', 48.605649, 22.272653, '9Sd3w3X3F0D4WFviEjIcmA', 194.5], // Bohomol’tsya St, 22, Ужгород, Закарпатська область, Ukraine, 88000
  ['ua', 48.276467, 25.971209, 'igiXD1Z5c_8aSFDn6gy2sg', 317.4], // Serhiia Vatrycha St, 26, Чернівці, Чернівецька область, Ukraine, 58000
  ['ru', 55.758219, 37.65752, 'mbE07GsD2gB6_S8h8jS0jg', 215.6], // Zemlyanoy Val St, 24 стр. 4, Москва, Russia, 101000
  ['ru', 59.940584, 30.340821, 'wFzTThwOHq45KdHrEG5H0w', 149.7], // Fontanka River Embankment, 20, Санкт-Петербург, Russia, 191028
  ['ru', 55.829108, 49.084453, 'HXkVqxRPn9Qt0pli8Ej0Rg', 8], // Ulitsa Volgogradskaya, д. 3, Казань, Респ. Татарстан, Russia, 420080
  ['ru', 54.723836, 20.496024, 'Bt4p14kiBkM7Faewojt48w', 184.2], // Ulitsa Chaykovskogo, 13, Калининград, Калининградская обл., Russia, 236022
  ['ru', 69.005926, 33.06227, '4YpuNbLMCc-LnwYSsH2bmg', 337], // ул. Гск, 185 корпус 1, Murmansk, Murmanskaya oblast’, Russia, 183040
  ['gi', 36.13859, -5.354715, '4wu583X6w2MnqhNcnBECEQ', 154.9], // 15 Bomb House Ln, Gibraltar GX11 1AA, Gibraltar
  ['im', 54.14209, -4.468264, '2FVug8omdgPGH9_TUEg3Xw', 32], // 4GRJ+RC7, Douglas, Isle of Man
  ['je', 49.172897, -2.11426, 'aTHKiPbMf19ogFCDRJS9GA', 92], // 1 La Rue Gosset, St Helier, Jersey JE2 3NX, Jersey
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
  const mapId = new ObjectId(EUROPE_ID)
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
        name: 'Europe',
        description: 'From Nordic fjords to Mediterranean coasts, explore Europe!',
        previewImg: 'official16.jpg',
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

  console.log(`Seeded Europe map ${EUROPE_ID} with ${LOCATIONS.length} locations in ${DB_NAME}`)
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
