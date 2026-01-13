export const CITY_DATA: Record<
  string,
  {
    name: string;
    attractions: string[];
    coordinates?: {
      lat: number;
      lng: number;
    };
  }[]
> = {
  Maharashtra: [
    {
      name: 'Mumbai',
      attractions: [
        'Gateway of India',
        'Marine Drive',
        'Elephanta Caves',
        'Juhu Beach',
        'Bandra-Worli Sea Link'
      ],
      coordinates: { lat: 19.076, lng: 72.8777 }
    },
    {
      name: 'Pune',
      attractions: [
        'Shaniwar Wada',
        'Aga Khan Palace',
        'Sinhagad Fort',
        'Osho Ashram'
      ],
      coordinates: { lat: 18.5204, lng: 73.8567 }
    }
  ],

  Karnataka: [
    {
      name: 'Bengaluru',
      attractions: [
        'Lalbagh Botanical Garden',
        'Cubbon Park',
        'Bangalore Palace',
        'Vidhana Soudha'
      ],
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    {
      name: 'Mysuru',
      attractions: [
        'Mysore Palace',
        'Chamundi Hills',
        'Brindavan Gardens'
      ],
      coordinates: { lat: 12.2958, lng: 76.6394 }
    }
  ],

  Rajasthan: [
    {
      name: 'Jaipur',
      attractions: [
        'Hawa Mahal',
        'City Palace',
        'Amber Fort',
        'Jantar Mantar'
      ],
      coordinates: { lat: 26.9124, lng: 75.7873 }
    },
    {
      name: 'Udaipur',
      attractions: [
        'City Palace',
        'Lake Pichola',
        'Jag Mandir'
      ],
      coordinates: { lat: 24.5854, lng: 73.7125 }
    }
  ],

  Delhi: [
    {
      name: 'New Delhi',
      attractions: [
        'India Gate',
        'Qutub Minar',
        'Lotus Temple',
        'Red Fort'
      ],
      coordinates: { lat: 28.6139, lng: 77.209 }
    }
  ]
};
