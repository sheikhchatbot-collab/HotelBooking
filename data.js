// Sample hotel data
const HOTELS = [
  {
    id: 1,
    name: "Arabian Sea Resort",
    city: "Karachi",
    country: "Pakistan",
    type: "Resort",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    reviews: 842,
    price: 110,
    hue: 195,
    amenities: ["WiFi", "Pool", "Breakfast", "Parking", "AC", "Beach"],
    description: "Beachfront resort with sea-view rooms, an infinity pool and a private stretch of sand.",
    rooms: [
      {
        id: "1a",
        name: "Standard Room",
        price: 110,
        capacity: 2,
        beds: "1 Queen bed"
      },
      {
        id: "1b",
        name: "Sea View Deluxe",
        price: 160,
        capacity: 3,
        beds: "1 King bed + sofa"
      },
      {
        id: "1c",
        name: "Family Suite",
        price: 240,
        capacity: 5,
        beds: "2 Queen beds"
      }
    ]
  },

  {
    id: 2,
    name: "Indus Heritage Inn",
    city: "Hyderabad",
    country: "Pakistan",
    type: "Boutique",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    reviews: 215,
    price: 55,
    hue: 28,
    amenities: ["WiFi", "Breakfast", "AC", "Parking"],
    description: "A restored colonial-era house in the heart of the city with traditional decor and warm hospitality.",
    rooms: [
      {
        id: "2a",
        name: "Classic Room",
        price: 55,
        capacity: 2,
        beds: "1 Double bed"
      },
      {
        id: "2b",
        name: "Heritage Suite",
        price: 90,
        capacity: 3,
        beds: "1 King bed"
      }
    ]
  },

  {
    id: 3,
    name: "Skyline Grand Hotel",
    city: "Lahore",
    country: "Pakistan",
    type: "Hotel",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    reviews: 1290,
    price: 95,
    hue: 262,
    amenities: ["WiFi", "Pool", "Gym", "Breakfast", "Parking", "AC"],
    description: "Modern high-rise hotel near Gulberg with rooftop dining and a full fitness centre.",
    rooms: [
      {
        id: "3a",
        name: "Superior Room",
        price: 95,
        capacity: 2,
        beds: "1 King bed"
      },
      {
        id: "3b",
        name: "Executive Room",
        price: 130,
        capacity: 3,
        beds: "1 King bed + sofa"
      },
      {
        id: "3c",
        name: "Presidential Suite",
        price: 320,
        capacity: 4,
        beds: "1 King + 1 Twin"
      }
    ]
  },

  {
    id: 4,
    name: "Pearl Continental",
    city: "Islamabad",
    country: "Pakistan",
    type: "Lodge",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    reviews: 560,
    price: 120,
    hue: 180,
    amenities: ["WiFi", "Breakfast", "Parking", "Gym"],
    description: "A comfortable luxury lodge in Islamabad with elegant rooms and modern facilities.",
    rooms: [
      {
        id: "4a",
        name: "Deluxe Room",
        price: 120,
        capacity: 2,
        beds: "1 King bed"
      },
      {
        id: "4b",
        name: "Executive Room",
        price: 170,
        capacity: 3,
        beds: "1 King bed + sofa"
      }
    ]
  },

  {
    id: 5,
    name: "Downtown Budget Stay",
    city: "Karachi",
    country: "Pakistan",
    type: "Hostel",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80",
    rating: 3.9,
    reviews: 388,
    price: 22,
    hue: 8,
    amenities: ["WiFi", "AC"],
    description: "Clean, simple and affordable rooms close to the business district and public transport.",
    rooms: [
      {
        id: "5a",
        name: "Dorm Bed",
        price: 22,
        capacity: 1,
        beds: "1 Bunk bed"
      },
      {
        id: "5b",
        name: "Private Room",
        price: 38,
        capacity: 2,
        beds: "1 Double bed"
      }
    ]
  },

  {
    id: 6,
    name: "Karakoram View Hotel",
    city: "Skardu",
    country: "Pakistan",
    type: "Hotel",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    reviews: 301,
    price: 85,
    hue: 215,
    amenities: ["WiFi", "Breakfast", "Parking"],
    description: "Mountain-facing rooms with panoramic views of the Karakoram range and a cosy fireplace lounge.",
    rooms: [
      {
        id: "6a",
        name: "Mountain Room",
        price: 85,
        capacity: 2,
        beds: "1 Queen bed"
      },
      {
        id: "6b",
        name: "Panorama Suite",
        price: 140,
        capacity: 4,
        beds: "1 King + 1 Twin"
      }
    ]
  },

  {
    id: 7,
    name: "Gwadar Pearl Resort",
    city: "Gwadar",
    country: "Pakistan",
    type: "Resort",
    image: "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    reviews: 176,
    price: 130,
    hue: 175,
    amenities: ["WiFi", "Pool", "Breakfast", "Beach", "AC", "Parking"],
    description: "Relaxed seaside resort with a private beach, water sports and fresh seafood restaurant.",
    rooms: [
      {
        id: "7a",
        name: "Garden Bungalow",
        price: 130,
        capacity: 2,
        beds: "1 King bed"
      },
      {
        id: "7b",
        name: "Beach Villa",
        price: 260,
        capacity: 6,
        beds: "3 Queen beds"
      }
    ]
  },

  {
    id: 8,
    name: "Old Town Boutique House",
    city: "Lahore",
    country: "Pakistan",
    type: "Boutique",
    image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    reviews: 412,
    price: 75,
    hue: 340,
    amenities: ["WiFi", "Breakfast", "AC"],
    description: "Intimate courtyard guesthouse a short walk from the Walled City and Badshahi Mosque.",
    rooms: [
      {
        id: "8a",
        name: "Courtyard Room",
        price: 75,
        capacity: 2,
        beds: "1 Queen bed"
      },
      {
        id: "8b",
        name: "Haveli Suite",
        price: 115,
        capacity: 3,
        beds: "1 King bed + daybed"
      }
    ]
  }
];

const ALL_AMENITIES = [
  "WiFi",
  "Pool",
  "Breakfast",
  "Parking",
  "Gym",
  "AC",
  "Beach"
];

const ALL_TYPES = [
  "Hotel",
  "Resort",
  "Boutique",
  "Lodge",
  "Hostel"
];

const TAX_RATE = 0.12;