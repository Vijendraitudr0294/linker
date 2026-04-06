import { type CatalogItem, type ItemType } from "@/stores/catalogStore";

export interface MockService {
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: ItemType;
  tags: string[];
  duration?: string;
  schedule?: string;
  location?: string;
  external_url?: string;
}

export const MOCK_CATEGORIES = [
  "Restaurant",
  "Yoga Instructor",
  "Gym Instructor",
  "School Teacher",
  "Dance Teacher",
  "Real Estate",
  "Beautician",
  "Yacht & Car Rental",
  "Digital Creator"
];

export const MOCK_SERVICES: Record<string, MockService[]> = {
  "Restaurant": [
    {
      title: "Signature Truffle Pasta",
      description: "Homemade tagliatelle with fresh black truffles and parmesan cream.",
      price: 28,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1528733918455-5a59687cedf0?w=800&q=80",
      category: "Main Course",
      item_type: "food",
      tags: ["Signature", "Vegetarian"]
    },
    {
      title: "Wagyu Beef Burger",
      description: "American Wagyu, caramelized onions, gruyere, and truffle aioli.",
      price: 24,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
      category: "Main Course",
      item_type: "food",
      tags: ["Bestseller"]
    },
    {
      title: "Crispy Calamari",
      description: "Tender calamari rings with spicy marinara and lemon zest.",
      price: 16,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
      category: "Appetizers",
      item_type: "food",
      tags: ["Seafood"]
    },
    {
      title: "Burrata & Heirloom Tomato",
      description: "Creamy burrata, balsamic glaze, and fresh basil.",
      price: 18,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9ebc4a5?w=800&q=80",
      category: "Appetizers",
      item_type: "food",
      tags: ["Vegetarian", "Fresh"]
    },
    {
      title: "Roasted Salmon",
      description: "Miso-glazed salmon with asparagus and fingerling potatoes.",
      price: 32,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
      category: "Main Course",
      item_type: "food",
      tags: ["Healthy", "Omega-3"]
    },
    {
      title: "Lobster Bisque",
      description: "Rich and creamy with chunks of fresh lobster.",
      price: 14,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
      category: "Soups",
      item_type: "food",
      tags: ["Classic"]
    },
    {
      title: "Caesar Salad",
      description: "Romaine hearts, sourdough croutons, and house-made dressing.",
      price: 15,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80",
      category: "Salads",
      item_type: "food",
      tags: ["Light"]
    },
    {
      title: "Filet Mignon",
      description: "8oz center-cut, red wine reduction, and mashed potatoes.",
      price: 45,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800&q=80",
      category: "Main Course",
      item_type: "food",
      tags: ["Premium"]
    }
  ],
  "Yoga Instructor": [
    {
      title: "Vinyasa Flow",
      description: "A dynamic practice connecting breath with movement.",
      price: 20,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["All Levels"],
      duration: "60 min",
      schedule: "Mon/Wed/Fri 7:00 AM",
      location: "Studio 1"
    },
    {
      title: "Private Coaching",
      description: "One-on-one session tailored to your specific goals.",
      price: 80,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80",
      category: "Private",
      item_type: "service",
      tags: ["Personalized"],
      duration: "75 min",
      schedule: "By Appointment",
      location: "In-home or Studio"
    },
    {
      title: "Hatha Yoga",
      description: "Classical yoga postures with focus on alignment.",
      price: 18,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Beginner Friendly"],
      duration: "60 min",
      schedule: "Tue/Thu 6:00 PM",
      location: "Studio 2"
    },
    {
      title: "Meditation & Mindfulness",
      description: "Guided meditation for mental clarity and stress relief.",
      price: 15,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80",
      category: "Wellness",
      item_type: "service",
      tags: ["Mental Health"],
      duration: "30 min",
      schedule: "Daily 8:00 AM",
      location: "Online"
    },
    {
      title: "Yin Yoga",
      description: "Deep stretching focused on connective tissues.",
      price: 22,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Relaxation"],
      duration: "90 min",
      schedule: "Sunday 4:00 PM",
      location: "Warm Studio"
    },
    {
      title: "Prenatal Yoga",
      description: "Safe and gentle yoga for expectant mothers.",
      price: 25,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80",
      category: "Specialized",
      item_type: "service",
      tags: ["Pregnancy"],
      duration: "60 min",
      schedule: "Saturday 10:00 AM",
      location: "Studio A"
    },
    {
      title: "Ashtanga Primary Series",
      description: "A structured and rigorous traditional yoga system.",
      price: 25,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1593164841804-09852f8516fb?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Advanced"],
      duration: "90 min",
      schedule: "Mon/Wed 6:00 AM",
      location: "Studio 1"
    },
    {
      title: "Pranayama (Breathwork)",
      description: "Techniques for controlling the breath and life force.",
      price: 15,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1524860769472-246b6afea403?w=800&q=80",
      category: "Wellness",
      item_type: "service",
      tags: ["Breathing"],
      duration: "45 min",
      schedule: "Friday 5:30 PM",
      location: "Zen Room"
    }
  ],
  "Gym Instructor": [
    {
      title: "Personal Training (Single)",
      description: "1-on-1 personalized high-intensity strength training.",
      price: 65,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      category: "Personal Training",
      item_type: "service",
      tags: ["1-on-1"],
      duration: "60 min",
      schedule: "By Appointment",
      location: "Main Gym"
    },
    {
      title: "HIIT Boot Camp",
      description: "High-intensity interval training for maximum calorie burn.",
      price: 25,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&q=80",
      category: "Classes",
      item_type: "service",
      tags: ["Intense"],
      duration: "45 min",
      schedule: "Mon-Fri 6:00 PM",
      location: "Turf Area"
    },
    {
      title: "Body Transformation Plan",
      description: "12-week customized program with nutrition and workout guide.",
      price: 299,
      price_label: "/program",
      image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      category: "Programs",
      item_type: "service",
      tags: ["Results Driven"],
      duration: "12 weeks",
      schedule: "Daily Tasks",
      location: "App-based"
    },
    {
      title: "Powerlifting Fundamentals",
      description: "Master the Squat, Bench, and Deadlift with proper form.",
      price: 40,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      category: "Classes",
      item_type: "service",
      tags: ["Strength"],
      duration: "90 min",
      schedule: "Saturday 11:00 AM",
      location: "Lifting Platforms"
    },
    {
      title: "Nutrition Coaching",
      description: "Macro-based meal planning and weekly check-ins.",
      price: 120,
      price_label: "/month",
      image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
      category: "Wellness",
      item_type: "service",
      tags: ["Healthy Lifestyle"],
      duration: "Monthly",
      schedule: "Weekly Calls",
      location: "Online"
    },
    {
      title: "Small Group Training",
      description: "Train with 3-4 friends and share the cost.",
      price: 35,
      price_label: "/person",
      image_url: "https://images.unsplash.com/photo-1518611012118-2969c63b03b8?w=800&q=80",
      category: "Personal Training",
      item_type: "service",
      tags: ["Social"],
      duration: "60 min",
      schedule: "By Appointment",
      location: "Studio B"
    },
    {
      title: "Speed & Agility Training",
      description: "Ideal for student-athletes looking to improve performance.",
      price: 30,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
      category: "Specialized",
      item_type: "service",
      tags: ["Athletes"],
      duration: "60 min",
      schedule: "Tue/Thu 4:00 PM",
      location: "Outdoor Track"
    },
    {
      title: "Boxing for Fitness",
      description: "Learn boxing basics while getting an incredible workout.",
      price: 30,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
      category: "Classes",
      item_type: "service",
      tags: ["Cardio"],
      duration: "60 min",
      schedule: "Wed/Fri 7:00 PM",
      location: "Ring Area"
    }
  ],
  "School Teacher": [
    {
      title: "Elementary Math Tutoring",
      description: "One-on-one session covering basics from addition to fractions.",
      price: 40,
      price_label: "/hour",
      image_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      category: "Mathematics",
      item_type: "service",
      tags: ["Grades 1-5"],
      duration: "60 min",
      schedule: "After Schools",
      location: "Online / Library"
    },
    {
      title: "Creative Writing Workshop",
      description: "Unlock your imagination and improve story structure.",
      price: 25,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      category: "Language Arts",
      item_type: "service",
      tags: ["Creative"],
      duration: "90 min",
      schedule: "Saturday 10:00 AM",
      location: "Classroom C"
    },
    {
      title: "Algebra Mastery",
      description: "Dedicated support for HS Algebra 1 and 2.",
      price: 50,
      price_label: "/hour",
      image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      category: "Mathematics",
      item_type: "service",
      tags: ["High School"],
      duration: "60 min",
      schedule: "Mon/Wed 4:00 PM",
      location: "Online"
    },
    {
      title: "Science Fair Mentoring",
      description: "Help with project design, experiment, and display board.",
      price: 60,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      category: "Science",
      item_type: "service",
      tags: ["Project Based"],
      duration: "60 min",
      schedule: "By Appointment",
      location: "Classroom D"
    },
    {
      title: "Reading Comprehension",
      description: "Techniques for analyzing texts and understanding themes.",
      price: 35,
      price_label: "/hour",
      image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      category: "Language Arts",
      item_type: "service",
      tags: ["Literacy"],
      duration: "60 min",
      schedule: "Tue/Thu 3:30 PM",
      location: "Online"
    },
    {
      title: "SAT/ACT Prep Pack",
      description: "10 sessions covering math, reading, and writing sections.",
      price: 450,
      price_label: "/package",
      image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
      category: "Test Prep",
      item_type: "service",
      tags: ["College Bound"],
      duration: "10 hours",
      schedule: "Weekends",
      location: "Center"
    },
    {
      title: "Spanish Level 1",
      description: "Basics of Spanish grammar, vocabulary, and conversation.",
      price: 30,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1542810634-7bc2cfee98ec?w=800&q=80",
      category: "Languagues",
      item_type: "service",
      tags: ["Introductory"],
      duration: "60 min",
      schedule: "Mon/Wed 5:00 PM",
      location: "Online"
    },
    {
      title: "Homework Help Bundle",
      description: "Drop-in access for help with any subject.",
      price: 100,
      price_label: "/week",
      image_url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
      category: "Academic Support",
      item_type: "service",
      tags: ["Flexibility"],
      duration: "Daily 1 hr",
      schedule: "Mon-Fri 3-6 PM",
      location: "Online Cafe"
    }
  ],
  "Dance Teacher": [
    {
      title: "Contemporary Foundations",
      description: "Fluid movement techniques and emotional expression.",
      price: 22,
      price_label: "/class",
      image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Expressive"],
      duration: "75 min",
      schedule: "Tue/Thu 7:00 PM",
      location: "Studio A"
    },
    {
      title: "Hip Hop Choreography",
      description: "Learn high-energy sets to the latest top hits.",
      price: 20,
      price_label: "/class",
      image_url: "https://images.unsplash.com/photo-1535525153412-5a42439a25ad?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Energy"],
      duration: "60 min",
      schedule: "Fri 6:30 PM",
      location: "Main Floor"
    },
    {
      title: "Wedding Dance Package",
      description: "Custom choreography for your first dance.",
      price: 350,
      price_label: "/package",
      image_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      category: "Private",
      item_type: "service",
      tags: ["Couple"],
      duration: "5 Sessions",
      schedule: "By Appointment",
      location: "Private Studio"
    },
    {
      title: "Ballet Basics",
      description: "Classical technique, poise, and barre work for adults.",
      price: 25,
      price_label: "/class",
      image_url: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Traditional"],
      duration: "90 min",
      schedule: "Mon 6:00 PM",
      location: "Barre Room"
    },
    {
      title: "Latin Social Dance",
      description: "Salsa and Bachata basics for social events.",
      price: 18,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1524117074681-31bd4bb22ad3?w=800&q=80",
      category: "Social",
      item_type: "service",
      tags: ["Fun"],
      duration: "60 min",
      schedule: "Sat 8:00 PM",
      location: "Lounge"
    },
    {
      title: "Jazz Funk",
      description: "Sassy and technical fusion style.",
      price: 20,
      price_label: "/class",
      image_url: "https://images.unsplash.com/photo-1542125387-c71274d94f0a?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Stylized"],
      duration: "60 min",
      schedule: "Wed 7:30 PM",
      location: "Studio B"
    },
    {
      title: "Heels Class",
      description: "Confidence and lines in character heels.",
      price: 25,
      price_label: "/class",
      image_url: "https://images.unsplash.com/photo-1504933350103-e840ede978d4?w=800&q=80",
      category: "Specialized",
      item_type: "service",
      tags: ["Empowerment"],
      duration: "75 min",
      schedule: "Friday 8:00 PM",
      location: "Studio A"
    },
    {
      title: "Kids Creative Dance",
      description: "Intro to movement and rhythm for ages 4-7.",
      price: 18,
      price_label: "/class",
      image_url: "https://images.unsplash.com/photo-1502780696051-c04907a42473?w=800&q=80",
      category: "Group Classes",
      item_type: "service",
      tags: ["Youth"],
      duration: "45 min",
      schedule: "Sat 9:00 AM",
      location: "Classroom"
    }
  ],
  "Real Estate": [
    {
      title: "Home Buying Consultation",
      description: "Free initial meeting to discuss your roadmap to home ownership.",
      price: 0,
      price_label: "Free",
      image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
      category: "Consulting",
      item_type: "service",
      tags: ["Introductory"],
      duration: "45 min",
      schedule: "Mon-Fri 9am-6pm",
      location: "Office / Zoom"
    },
    {
      title: "Classic Suburban Home",
      description: "4 Bed, 2.5 Bath with large backyard and modern kitchen.",
      price: 450000,
      price_label: "Asking Price",
      image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      category: "Listings",
      item_type: "physical",
      tags: ["Suburban"],
      location: "Oakwood Estates"
    },
    {
      title: "Modern Mini-Loft",
      description: "Sleek studio in the heart of the downtown arts district.",
      price: 2800,
      price_label: "/month",
      image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      category: "Rentals",
      item_type: "physical",
      tags: ["Urban"],
      location: "The Matrix Building"
    },
    {
      title: "Comparative Market Analysis",
      description: "Detailed report on what your home is worth today.",
      price: 0,
      price_label: "Complimentary",
      image_url: "https://images.unsplash.com/photo-1460472178825-95140c962999?w=800&q=80",
      category: "Services",
      item_type: "service",
      tags: ["Sellers"],
      duration: "48 hr turnaround"
    },
    {
      title: "Property Management",
      description: "Full-service management for your rental properties.",
      price: 10,
      price_label: "/rent amount",
      image_url: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80",
      category: "Services",
      item_type: "service",
      tags: ["Investors"],
      schedule: "Full Time"
    },
    {
      title: "Lakeside Cottage",
      description: "Picturesque 2-bedroom vacation home with private dock.",
      price: 325000,
      price_label: "Asking Price",
      image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
      category: "Listings",
      item_type: "physical",
      tags: ["Vacation"],
      location: "Crystal Lake"
    },
    {
      title: "Investment Portfolio Review",
      description: "Analyzing your current holdings for ROI optimization.",
      price: 150,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1454165833267-028cc21e7674?w=800&q=80",
      category: "Consulting",
      item_type: "service",
      tags: ["Analysis"],
      duration: "90 min",
      schedule: "Weekly"
    },
    {
      title: "Staging Consultation",
      description: "How to prepare your home for the fastest, top-dollar sale.",
      price: 250,
      price_label: "/consult",
      image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      category: "Services",
      item_type: "service",
      tags: ["Design"]
    }
  ],
  "Beautician": [
    {
      title: "Classic Manicure",
      description: "Shaping, cuticle care, massage, and polish.",
      price: 35,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
      category: "Nails",
      item_type: "service",
      tags: ["Essential"],
      duration: "45 min",
      schedule: "Mon-Sat 10am-8pm",
      location: "Nail Lounge"
    },
    {
      title: "Signature Glow Facial",
      description: "Deep cleanse, exfoliation, and hydration mask.",
      price: 95,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
      category: "Skincare",
      item_type: "service",
      tags: ["Radiance"],
      duration: "60 min",
      schedule: "By Appointment",
      location: "Spa Room 1"
    },
    {
      title: "Full Set Volume Lashes",
      description: "Individually applied extensions for a lush look.",
      price: 150,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1582213192372-af51f7bb9ca6?w=800&q=80",
      category: "Eyes",
      item_type: "service",
      tags: ["Glamour"],
      duration: "2 hours",
      schedule: "Tue-Sun"
    },
    {
      title: "Balayage Hair Color",
      description: "Sun-kissed highlights with natural transition.",
      price: 220,
      price_label: "Starting at",
      image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80",
      category: "Hair",
      item_type: "service",
      tags: ["Trending"],
      duration: "3-4 hours",
      location: "Salon Chair 4"
    },
    {
      title: "Women's Master Cut",
      description: "Customized haircut including wash and blowout.",
      price: 85,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
      category: "Hair",
      item_type: "service",
      tags: ["Precision"],
      duration: "60 min",
      schedule: "Daily"
    },
    {
      title: "Eyebrow Microblading",
      description: "Semi-permanent tattooing for perfect brows.",
      price: 450,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1522338258041-ed5941952e1c?w=800&q=80",
      category: "Eyes",
      item_type: "service",
      tags: ["Long Lasting"],
      duration: "2.5 hours"
    },
    {
      title: "Chemical Peel",
      description: "Medical-grade resurfacing for smooth skin texture.",
      price: 120,
      price_label: "/session",
      image_url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=800&q=80",
      category: "Skincare",
      item_type: "service",
      tags: ["Anti-aging"],
      duration: "45 min"
    },
    {
      title: "Bridal Makeup Trial",
      description: "In-depth consultation to find your wedding day look.",
      price: 100,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1481325544412-f995839403d8?w=800&q=80",
      category: "Makeup",
      item_type: "service",
      tags: ["Wedding"],
      duration: "90 min"
    }
  ],
  "Yacht & Car Rental": [
    {
      title: "Luxury Sunreef Yacht",
      description: "70ft catamaran with 4 cabins, professional crew, and chef service.",
      price: 2500,
      price_label: "/day",
      image_url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80",
      category: "Yachts",
      item_type: "boat",
      tags: ["Luxury", "Full Crew"],
      location: "Miami Marina"
    },
    {
      title: "Lamborghini Huracán Evo",
      description: "V10 engine, 640 HP. Experience the ultimate Italian supercar.",
      price: 1200,
      price_label: "/day",
      image_url: "https://images.unsplash.com/photo-1532581133596-9f87aac09411?w=800&q=80",
      category: "Exotic Cars",
      item_type: "car",
      tags: ["Supercar", "Fast"],
      duration: "24 Hours"
    },
    {
      title: "Vintage Porsche 911",
      description: "Classic 1970s air-cooled beauty for a scenic drive.",
      price: 450,
      price_label: "/day",
      image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      category: "Classic Cars",
      item_type: "car",
      tags: ["Vintage", "Manual"],
      location: "Coastline"
    },
    {
      title: "Party Pontoon Boat",
      description: "Perfect for family gatherings and lake parties. Seats 12.",
      price: 150,
      price_label: "/hour",
      image_url: "https://images.unsplash.com/photo-1605281317010-fe5ffe798156?w=800&q=80",
      category: "Boats",
      item_type: "boat",
      tags: ["Family", "Affordable"],
      duration: "Min 2 hrs"
    },
    {
      title: "Rolls-Royce Ghost",
      description: "The pinnacle of luxury. Chauffeur driven for special events.",
      price: 1500,
      price_label: "/day",
      image_url: "https://images.unsplash.com/photo-1631215539289-63799639f5f0?w=800&q=80",
      category: "Luxury Sedans",
      item_type: "car",
      tags: ["Weddings", "Executive"],
      duration: "8 Hours"
    },
    {
      title: "Sailing Catamaran",
      description: "Eco-friendly sailing experience for small groups.",
      price: 800,
      price_label: "/day",
      image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
      category: "Yachts",
      item_type: "boat",
      tags: ["Eco", "Quiet"],
      location: "Harbor"
    },
    {
      title: "Ferrari 488 Spider",
      description: "Convertible supercar for the ultimate thrill.",
      price: 1400,
      price_label: "/day",
      image_url: "https://images.unsplash.com/photo-1592193660027-29202523dc4e?w=800&q=80",
      category: "Exotic Cars",
      item_type: "car",
      tags: ["Convertible", "Iconic"],
      duration: "24 Hours"
    },
    {
      title: "Jet Ski Rental",
      description: "Latest Yamaha Waverunners for high-speed water fun.",
      price: 100,
      price_label: "/hour",
      image_url: "https://images.unsplash.com/photo-1552308995-2eba2058ece1?w=800&q=80",
      category: "Water Sports",
      item_type: "boat",
      tags: ["Exciting", "Solo/Pair"],
      location: "Beach Club"
    }
  ],
  "Digital Creator": [
    {
      title: "How I grew to 1M+ on TikTok",
      description: "My top secret strategies for viral growth and audience retention in 2024. Read the full post here on my profile.",
      price: null,
      price_label: "Read Free",
      image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
      category: "Blog",
      item_type: "blog",
      tags: ["Growth", "Viral"]
    },
    {
      title: "Creator Presets Pack",
      description: "Get my signature look with 15+ Lightroom presets for mobile and desktop.",
      price: 29,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
      category: "Digital Products",
      item_type: "digital",
      tags: ["Photography", "Edit"]
    },
    {
      title: "Limited Edition 'BIOTRA' Tee",
      description: "Ultra-soft heavyweight cotton oversized tee with custom embroidery.",
      price: 45,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      category: "Merchandise",
      item_type: "physical",
      tags: ["Fashion", "Drops"]
    },
    {
      title: "Instagram Post: Brand Deal",
      description: "Check out my latest collaboration with TechGear Pro.",
      price: null,
      price_label: "Social",
      image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
      category: "Content",
      item_type: "social",
      tags: ["Embed", "Collaboration"],
      external_url: "https://instagram.com/p/C_abc123"
    },
    {
      title: "Brand Partnership eBook",
      description: "The ultimate guide to landing your first $5k brand deal as a micro-influencer.",
      price: 49,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
      category: "Digital Products",
      item_type: "digital",
      tags: ["Business", "Monetization"]
    },
    {
      title: "Creator Discord Access",
      description: "Join our private community of 500+ top-tier creators for daily networking.",
      price: 15,
      price_label: "/month",
      image_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
      category: "Community",
      item_type: "service",
      tags: ["Networking", "Discord"]
    },
    {
      title: "Custom LUTS Pack",
      description: "Cinema-grade color grading presets for your travel vlogs and short films.",
      price: 35,
      price_label: "",
      image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      category: "Digital Products",
      item_type: "digital",
      tags: ["Editing", "Video"]
    },
    {
      title: "Podcast Guest Slot",
      description: "Feature your story on the 'BIOTRA Vision' podcast series reaching 50k+ listeners.",
      price: 250,
      price_label: "/episode",
      image_url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
      category: "Services",
      item_type: "service",
      tags: ["Exposure", "Podcast"]
    }
  ]
};
