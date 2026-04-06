
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const userId = 'c5533185-717b-41fc-ae68-59bb6399d301';

const categories = [
  { type: 'video', label: 'Video', sub: 'Tutorials', icon: 'Video' },
  { type: 'reel', label: 'Shorts', sub: 'Quick Tips', icon: 'Clapperboard' },
  { type: 'news', label: 'News', sub: 'Tech Updates', icon: 'Newspaper' },
  { type: 'recipe', label: 'Recipes', sub: 'Quick Meals', icon: 'UtensilsCrossed' },
  { type: 'music', label: 'Music', sub: 'New Releases', icon: 'Music' },
  { type: 'post', label: 'Posts', sub: 'Daily Thoughts', icon: 'MessageSquare' },
];

interface MockItem {
  user_id: string;
  profile_user_id: string;
  title: string;
  description: string;
  price: number | null;
  price_label: string;
  image_url: string;
  category: string;
  item_type: string;
  external_url: string;
  allow_order_form: boolean;
  tags: string[];
  sort_order: number;
}

const mockItems: MockItem[] = [];

for (const cat of categories) {
  for (let i = 1; i <= 8; i++) {
    let external_url = '';
    let image_url = '';
    
    if (cat.type === 'video' || cat.type === 'reel') {
      external_url = i % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : 'https://www.youtube.com/shorts/5v59M9V9G9s';
      image_url = `https://images.unsplash.com/photo-${1600000000000 + (cat.type.length * i * 1000)}?auto=format&fit=crop&w=800&q=80`;
    } else if (cat.type === 'music') {
      external_url = 'https://open.spotify.com/track/4cOdzh0s2UDvYmXG9eP7B9';
      image_url = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80`;
    } else {
      external_url = 'https://example.com/article-' + i;
      image_url = `https://images.unsplash.com/photo-${1500000000000 + (cat.type.length * i * 500)}?auto=format&fit=crop&w=800&q=80`;
    }

    mockItems.push({
      user_id: userId,
      profile_user_id: userId,
      title: `${cat.label} #${i}: Master ${cat.sub}`,
      description: `This is a comprehensive ${cat.label.toLowerCase()} about the latest trends in ${cat.sub}. Learn everything you need to know about this topic in our latest walkthrough. Professional tips, tricks, and behind-the-scenes content included.`,
      price: null,
      price_label: 'Free',
      image_url: image_url,
      category: `${cat.label} > ${cat.sub}`,
      item_type: cat.type,
      external_url: external_url,
      allow_order_form: false,
      tags: [cat.type, cat.sub.toLowerCase()],
      sort_order: mockItems.length
    });
  }
}

async function seed() {
  console.log('Seeding mock data for user:', userId);
  const { data, error } = await supabase.from('catalog_items').insert(mockItems);
  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log('Successfully seeded 48 mock items.');
  }
}

seed();
