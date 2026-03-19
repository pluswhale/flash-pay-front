export interface TransferCity {
  id: string
  name: string
}

export interface TransferCountry {
  id: string
  name: string
  shortName: string
  flag: string
  currency: string
  currencyCode: string
  iconGradient: string
  cities: TransferCity[]
}

export const TRANSFER_COUNTRIES: TransferCountry[] = [
  {
    id: 'th',
    name: 'Thailand',
    shortName: 'Thailand',
    flag: '🇹🇭',
    currency: 'Thai Baht',
    currencyCode: 'THB',
    iconGradient: 'from-blue-600 via-white to-red-600',
    cities: [
      { id: 'bkk', name: 'Bangkok' },
      { id: 'hkt', name: 'Phuket' },
      { id: 'cnx', name: 'Chiang Mai' },
      { id: 'ptt', name: 'Pattaya' },
      { id: 'kbi', name: 'Krabi' },
      { id: 'koh', name: 'Koh Samui' },
    ],
  },
  {
    id: 'id',
    name: 'Bali, Indonesia',
    shortName: 'Bali',
    flag: '🇮🇩',
    currency: 'Indonesian Rupiah',
    currencyCode: 'IDR',
    iconGradient: 'from-red-600 to-white',
    cities: [
      { id: 'dps', name: 'Denpasar' },
      { id: 'sem', name: 'Seminyak' },
      { id: 'ubu', name: 'Ubud' },
      { id: 'cng', name: 'Canggu' },
      { id: 'nusa', name: 'Nusa Dua' },
    ],
  },
  {
    id: 'ae',
    name: 'UAE',
    shortName: 'UAE',
    flag: '🇦🇪',
    currency: 'UAE Dirham',
    currencyCode: 'AED',
    iconGradient: 'from-green-700 to-red-600',
    cities: [
      { id: 'dxb', name: 'Dubai' },
      { id: 'auh', name: 'Abu Dhabi' },
      { id: 'shj', name: 'Sharjah' },
      { id: 'ajm', name: 'Ajman' },
    ],
  },
  {
    id: 'cn',
    name: 'China',
    shortName: 'China',
    flag: '🇨🇳',
    currency: 'Chinese Yuan',
    currencyCode: 'CNY',
    iconGradient: 'from-red-600 to-yellow-500',
    cities: [
      { id: 'bjs', name: 'Beijing' },
      { id: 'sha', name: 'Shanghai' },
      { id: 'can', name: 'Guangzhou' },
      { id: 'szx', name: 'Shenzhen' },
      { id: 'ctu', name: 'Chengdu' },
    ],
  },
  {
    id: 'ru',
    name: 'Russia',
    shortName: 'Russia',
    flag: '🇷🇺',
    currency: 'Russian Ruble',
    currencyCode: 'RUB',
    iconGradient: 'from-white via-blue-600 to-red-600',
    cities: [
      { id: 'mow', name: 'Moscow' },
      { id: 'led', name: 'St. Petersburg' },
      { id: 'ekb', name: 'Yekaterinburg' },
      { id: 'nsk', name: 'Novosibirsk' },
      { id: 'kzn', name: 'Kazan' },
    ],
  },
  {
    id: 'tr',
    name: 'Turkey',
    shortName: 'Turkey',
    flag: '🇹🇷',
    currency: 'Turkish Lira',
    currencyCode: 'TRY',
    iconGradient: 'from-red-600 to-red-800',
    cities: [
      { id: 'ist', name: 'Istanbul' },
      { id: 'anl', name: 'Ankara' },
      { id: 'ayt', name: 'Antalya' },
      { id: 'izm', name: 'Izmir' },
    ],
  },
  {
    id: 'ge',
    name: 'Georgia',
    shortName: 'Georgia',
    flag: '🇬🇪',
    currency: 'Georgian Lari',
    currencyCode: 'GEL',
    iconGradient: 'from-red-500 to-white',
    cities: [
      { id: 'tbs', name: 'Tbilisi' },
      { id: 'bat', name: 'Batumi' },
      { id: 'kut', name: 'Kutaisi' },
    ],
  },
  {
    id: 'kz',
    name: 'Kazakhstan',
    shortName: 'Kazakhstan',
    flag: '🇰🇿',
    currency: 'Kazakhstani Tenge',
    currencyCode: 'KZT',
    iconGradient: 'from-sky-400 to-yellow-400',
    cities: [
      { id: 'alm', name: 'Almaty' },
      { id: 'nqz', name: 'Astana' },
      { id: 'shym', name: 'Shymkent' },
    ],
  },
]

export const TRANSFER_CURRENCIES = [
  { code: 'USD', name: 'US Dollar',         flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',               flag: '🇪🇺' },
  { code: 'RUB', name: 'Russian Ruble',      flag: '🇷🇺' },
  { code: 'USDT', name: 'Tether (USDT)',     flag: '₮'  },
  { code: 'BTC',  name: 'Bitcoin',           flag: '₿'  },
  { code: 'ETH',  name: 'Ethereum',          flag: 'Ξ'  },
  { code: 'THB',  name: 'Thai Baht',         flag: '🇹🇭' },
  { code: 'AED',  name: 'UAE Dirham',        flag: '🇦🇪' },
  { code: 'CNY',  name: 'Chinese Yuan',      flag: '🇨🇳' },
  { code: 'TRY',  name: 'Turkish Lira',      flag: '🇹🇷' },
  { code: 'GEL',  name: 'Georgian Lari',     flag: '🇬🇪' },
]
