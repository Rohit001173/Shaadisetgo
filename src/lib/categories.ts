// ShaadiSetGo - Complete Wedding Categories & Subcategories
// All categories with icons and subcategories for Bihar & UP weddings

export interface SubCategory {
  id: string;
  name: string;
  nameHindi?: string;
}

export interface Category {
  id: string;
  name: string;
  nameHindi?: string;
  icon: string;
  color: string;
  description?: string;
  subcategories: SubCategory[];
}

export const weddingCategories: Category[] = [
  {
    id: 'decoration-setup',
    name: 'Decoration & Setup',
    nameHindi: 'सज्जा और सेटअप',
    icon: '🎨',
    color: '#E8437A',
    description: 'Complete wedding decoration services',
    subcategories: [
      { id: 'mandap-decoration', name: 'Mandap Decoration', nameHindi: 'मंडप सज्जा' },
      { id: 'stage-decoration', name: 'Stage Decoration', nameHindi: 'स्टेज सज्जा' },
      { id: 'flower-decoration', name: 'Flower Decoration', nameHindi: 'फूलों की सज्जा' },
      { id: 'entry-gate-decoration', name: 'Entry Gate Decoration', nameHindi: 'प्रवेश द्वार सज्जा' },
      { id: 'balloon-decoration', name: 'Balloon Decoration', nameHindi: 'गुब्बारे की सज्जा' },
      { id: 'lighting-decoration', name: 'Lighting Decoration', nameHindi: 'लाइटिंग सज्जा' },
      { id: 'theme-wedding-decoration', name: 'Theme Wedding Decoration', nameHindi: 'थीम वेडिंग सज्जा' },
      { id: 'haldi-decoration', name: 'Haldi Decoration', nameHindi: 'हल्दी सज्जा' },
      { id: 'mehendi-decoration', name: 'Mehendi Decoration', nameHindi: 'मेहंदी सज्जा' },
      { id: 'sangeet-stage-setup', name: 'Sangeet Stage Setup', nameHindi: 'संगीत स्टेज सेटअप' },
      { id: 'led-wall-setup', name: 'LED Wall Setup', nameHindi: 'LED वॉल सेटअप' },
      { id: 'artificial-flower-setup', name: 'Artificial Flower Setup', nameHindi: 'आर्टिफिशियल फ्लॉवर सेटअप' },
      { id: 'wedding-backdrop-design', name: 'Wedding Backdrop Design', nameHindi: 'वेडिंग बैकड्रॉप डिज़ाइन' },
    ],
  },
  {
    id: 'dj-music',
    name: 'DJ & Music',
    nameHindi: 'डीजे और संगीत',
    icon: '🎵',
    color: '#9C27B0',
    description: 'DJ, sound systems and live music for weddings',
    subcategories: [
      { id: 'dj-sound-system', name: 'DJ Sound System', nameHindi: 'डीजे साउंड सिस्टम' },
      { id: 'wedding-dj', name: 'Wedding DJ', nameHindi: 'वेडिंग डीजे' },
      { id: 'sangeet-dj', name: 'Sangeet DJ', nameHindi: 'संगीत डीजे' },
      { id: 'baraat-dj', name: 'Baraat DJ', nameHindi: 'बारात डीजे' },
      { id: 'dj-van', name: 'DJ Van', nameHindi: 'डीजे वैन' },
      { id: 'sound-system-rental', name: 'Sound System Rental', nameHindi: 'साउंड सिस्टम किराया' },
      { id: 'lighting-dj-setup', name: 'Lighting DJ Setup', nameHindi: 'लाइटिंग डीजे सेटअप' },
      { id: 'dhol-wala', name: 'Dhol Wala', nameHindi: 'ढोल वाला' },
      { id: 'band-baja', name: 'Band Baja', nameHindi: 'बैंड बाजा' },
      { id: 'live-band', name: 'Live Band', nameHindi: 'लाइव बैंड' },
    ],
  },
  {
    id: 'catering-food',
    name: 'Catering & Food',
    nameHindi: 'केटरिंग और खाना',
    icon: '🍽️',
    color: '#FF5722',
    description: 'Wedding catering and food services',
    subcategories: [
      { id: 'wedding-catering', name: 'Wedding Catering', nameHindi: 'वेडिंग केटरिंग' },
      { id: 'buffet-catering', name: 'Buffet Catering', nameHindi: 'बुफे केटरिंग' },
      { id: 'veg-catering', name: 'Veg Catering', nameHindi: 'वेज केटरिंग' },
      { id: 'non-veg-catering', name: 'Non Veg Catering', nameHindi: 'नॉन वेज केटरिंग' },
      { id: 'halwai-services', name: 'Halwai Services', nameHindi: 'हलवाई सर्विस' },
      { id: 'sweet-counter', name: 'Sweet Counter', nameHindi: 'मिठाई काउंटर' },
      { id: 'live-food-counter', name: 'Live Food Counter', nameHindi: 'लाइव फूड काउंटर' },
      { id: 'street-food-counter', name: 'Street Food Counter', nameHindi: 'स्ट्रीट फूड काउंटर' },
      { id: 'chaat-stall', name: 'Chaat Stall', nameHindi: 'चाट स्टाल' },
      { id: 'tea-coffee-stall', name: 'Tea Coffee Stall', nameHindi: 'चाय कॉफी स्टाल' },
      { id: 'juice-counter', name: 'Juice Counter', nameHindi: 'जूस काउंटर' },
    ],
  },
  {
    id: 'photography-videography',
    name: 'Photography & Videography',
    nameHindi: 'फोटोग्राफी और वीडियोग्राफी',
    icon: '📸',
    color: '#2196F3',
    description: 'Professional wedding photography and videography',
    subcategories: [
      { id: 'wedding-photography', name: 'Wedding Photography', nameHindi: 'वेडिंग फोटोग्राफी' },
      { id: 'pre-wedding-shoot', name: 'Pre Wedding Shoot', nameHindi: 'प्री वेडिंग शूट' },
      { id: 'candid-photography', name: 'Candid Photography', nameHindi: 'कैंडिड फोटोग्राफी' },
      { id: 'traditional-photography', name: 'Traditional Photography', nameHindi: 'ट्रेडिशनल फोटोग्राफी' },
      { id: 'wedding-videography', name: 'Wedding Videography', nameHindi: 'वेडिंग वीडियोग्राफी' },
      { id: 'drone-photography', name: 'Drone Photography', nameHindi: 'ड्रोन फोटोग्राफी' },
      { id: 'drone-videography', name: 'Drone Videography', nameHindi: 'ड्रोन वीडियोग्राफी' },
      { id: 'album-design', name: 'Album Design', nameHindi: 'एल्बम डिज़ाइन' },
      { id: 'cinematic-wedding-film', name: 'Cinematic Wedding Film', nameHindi: 'सिनेमैटिक वेडिंग फिल्म' },
    ],
  },
  {
    id: 'makeup-beauty',
    name: 'Makeup & Beauty',
    nameHindi: 'मेकअप और ब्यूटी',
    icon: '💄',
    color: '#E91E63',
    description: 'Bridal makeup and beauty services',
    subcategories: [
      { id: 'bridal-makeup', name: 'Bridal Makeup', nameHindi: 'ब्राइडल मेकअप' },
      { id: 'party-makeup', name: 'Party Makeup', nameHindi: 'पार्टी मेकअप' },
      { id: 'groom-makeup', name: 'Groom Makeup', nameHindi: 'ग्रूम मेकअप' },
      { id: 'hair-styling', name: 'Hair Styling', nameHindi: 'हेयर स्टाइलिंग' },
      { id: 'mehendi-artist', name: 'Mehendi Artist', nameHindi: 'मेहंदी आर्टिस्ट' },
      { id: 'nail-artist', name: 'Nail Artist', nameHindi: 'नेल आर्टिस्ट' },
      { id: 'salon-services', name: 'Salon Services', nameHindi: 'सैलून सर्विसेज' },
    ],
  },
  {
    id: 'tent-furniture',
    name: 'Tent House & Furniture',
    nameHindi: 'टेंट हाउस और फर्नीचर',
    icon: '🎪',
    color: '#795548',
    description: 'Tent, stage setup and furniture rental',
    subcategories: [
      { id: 'tent-house', name: 'Tent House', nameHindi: 'टेंट हाउस' },
      { id: 'stage-setup', name: 'Stage Setup', nameHindi: 'स्टेज सेटअप' },
      { id: 'chair-table-rental', name: 'Chair Table Rental', nameHindi: 'कुर्सी मेज किराया' },
      { id: 'sofa-rental', name: 'Sofa Rental', nameHindi: 'सोफा किराया' },
      { id: 'vip-sofa-setup', name: 'VIP Sofa Setup', nameHindi: 'VIP सोफा सेटअप' },
      { id: 'cooler-fan-rental', name: 'Cooler Fan Rental', nameHindi: 'कूलर फैन किराया' },
      { id: 'heater-rental', name: 'Heater Rental', nameHindi: 'हीटर किराया' },
      { id: 'carpet-setup', name: 'Carpet Setup', nameHindi: 'कार्पेट सेटअप' },
    ],
  },
  {
    id: 'wedding-entry-effects',
    name: 'Wedding Entry & Special Effects',
    nameHindi: 'वेडिंग एंट्री और स्पेशल इफेक्ट्स',
    icon: '✨',
    color: '#FF9800',
    description: 'Grand entry setups and special effects',
    subcategories: [
      { id: 'bride-entry-setup', name: 'Bride Entry Setup', nameHindi: 'दुल्हन एंट्री सेटअप' },
      { id: 'groom-entry-setup', name: 'Groom Entry Setup', nameHindi: 'दूल्हे की एंट्री सेटअप' },
      { id: 'cold-fireworks', name: 'Cold Fireworks', nameHindi: 'कोल्ड फायरवर्क्स' },
      { id: 'smoke-machine', name: 'Smoke Machine', nameHindi: 'स्मोक मशीन' },
      { id: 'co2-gun-entry', name: 'CO2 Gun Entry', nameHindi: 'CO2 गन एंट्री' },
      { id: 'flower-shower-machine', name: 'Flower Shower Machine', nameHindi: 'फ्लॉवर शॉवर मशीन' },
      { id: 'fog-entry-effect', name: 'Fog Entry Effect', nameHindi: 'फॉग एंट्री इफेक्ट' },
      { id: 'led-dance-floor', name: 'LED Dance Floor', nameHindi: 'LED डांस फ्लोर' },
    ],
  },
  {
    id: 'transport-vehicles',
    name: 'Transport & Vehicles',
    nameHindi: 'परिवहन और वाहन',
    icon: '🚗',
    color: '#3F51B5',
    description: 'Wedding cars and transport services',
    subcategories: [
      { id: 'luxury-car-rental', name: 'Luxury Car Rental', nameHindi: 'लग्जरी कार किराया' },
      { id: 'wedding-car-decoration', name: 'Wedding Car Decoration', nameHindi: 'वेडिंग कार सज्जा' },
      { id: 'horse-for-baraat', name: 'Horse for Baraat', nameHindi: 'बारात के लिए घोड़ा' },
      { id: 'baggi-rental', name: 'Baggi Rental', nameHindi: 'बग्गी किराया' },
      { id: 'vintage-car', name: 'Vintage Car', nameHindi: 'विंटेज कार' },
      { id: 'bus-rental', name: 'Bus Rental', nameHindi: 'बस किराया' },
      { id: 'guest-transport', name: 'Guest Transport', nameHindi: 'गेस्ट ट्रांसपोर्ट' },
    ],
  },
  {
    id: 'pandit-rituals',
    name: 'Pandit & Ritual Services',
    nameHindi: 'पंडित और रीति-रिवाज',
    icon: '🙏',
    color: '#FF9800',
    description: 'Wedding priests and ritual services',
    subcategories: [
      { id: 'pandit-ji', name: 'Pandit Ji', nameHindi: 'पंडित जी' },
      { id: 'wedding-ritual-specialist', name: 'Wedding Ritual Specialist', nameHindi: 'वेडिंग रिचुअल स्पेशलिस्ट' },
      { id: 'havan-samagri', name: 'Havan Samagri', nameHindi: 'हवन सामग्री' },
      { id: 'pooja-samagri', name: 'Pooja Samagri', nameHindi: 'पूजा सामग्री' },
      { id: 'astrologer', name: 'Astrologer', nameHindi: 'ज्योतिषी' },
    ],
  },
  {
    id: 'wedding-venue',
    name: 'Wedding Venue',
    nameHindi: 'वेडिंग वेन्यू',
    icon: '🏛️',
    color: '#009688',
    description: 'Wedding halls and venues',
    subcategories: [
      { id: 'banquet-hall', name: 'Banquet Hall', nameHindi: 'बैंक्वेट हॉल' },
      { id: 'marriage-hall', name: 'Marriage Hall', nameHindi: 'मैरिज हॉल' },
      { id: 'farmhouse-venue', name: 'Farmhouse Venue', nameHindi: 'फार्महाउस वेन्यू' },
      { id: 'outdoor-wedding-venue', name: 'Outdoor Wedding Venue', nameHindi: 'आउटडोर वेडिंग वेन्यू' },
      { id: 'hotel-wedding-venue', name: 'Hotel Wedding Venue', nameHindi: 'होटल वेडिंग वेन्यू' },
    ],
  },
  {
    id: 'guest-management',
    name: 'Guest Management',
    nameHindi: 'गेस्ट मैनेजमेंट',
    icon: '👥',
    color: '#607D8B',
    description: 'Staff and guest management services',
    subcategories: [
      { id: 'waiter-group', name: 'Waiter Group', nameHindi: 'वेटर ग्रुप' },
      { id: 'event-staff', name: 'Event Staff', nameHindi: 'इवेंट स्टाफ' },
      { id: 'security-guard', name: 'Security Guard', nameHindi: 'सिक्योरिटी गार्ड' },
      { id: 'parking-management', name: 'Parking Management', nameHindi: 'पार्किंग मैनेजमेंट' },
      { id: 'cleaning-staff', name: 'Cleaning Staff', nameHindi: 'क्लीनिंग स्टाफ' },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    nameHindi: 'मनोरंजन',
    icon: '🎭',
    color: '#9C27B0',
    description: 'Live entertainment for weddings',
    subcategories: [
      { id: 'orchestra-group', name: 'Orchestra Group', nameHindi: 'ऑर्केस्ट्रा ग्रुप' },
      { id: 'dance-group', name: 'Dance Group', nameHindi: 'डांस ग्रुप' },
      { id: 'singer', name: 'Singer', nameHindi: 'गायक' },
      { id: 'anchor-host', name: 'Anchor / Host', nameHindi: 'एंकर / होस्ट' },
      { id: 'magician', name: 'Magician', nameHindi: 'जादूगर' },
      { id: 'kids-entertainment', name: 'Kids Entertainment', nameHindi: 'किड्स एंटरटेनमेंट' },
      { id: 'comedy-performer', name: 'Comedy Performer', nameHindi: 'कॉमेडी परफॉर्मर' },
    ],
  },
  {
    id: 'wedding-essentials',
    name: 'Wedding Essentials',
    nameHindi: 'वेडिंग एसेंशियल्स',
    icon: '🎁',
    color: '#F44336',
    description: 'Wedding invitation, gifts and essentials',
    subcategories: [
      { id: 'invitation-cards', name: 'Invitation Cards', nameHindi: 'निमंत्रण कार्ड' },
      { id: 'digital-invitation', name: 'Digital Invitation', nameHindi: 'डिजिटल निमंत्रण' },
      { id: 'return-gifts', name: 'Return Gifts', nameHindi: 'रिटर्न गिफ्ट्स' },
      { id: 'wedding-gifts', name: 'Wedding Gifts', nameHindi: 'शादी के तोहफे' },
      { id: 'flower-mala', name: 'Flower Mala', nameHindi: 'फूलों की माला' },
      { id: 'garlands', name: 'Garlands', nameHindi: 'वरमाला' },
    ],
  },
];

// Helper functions
export function getAllSubcategories(): { categoryId: string; categoryName: string; subcategory: SubCategory }[] {
  const result: { categoryId: string; categoryName: string; subcategory: SubCategory }[] = [];
  
  weddingCategories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      result.push({
        categoryId: category.id,
        categoryName: category.name,
        subcategory,
      });
    });
  });
  
  return result;
}

export function getCategoryById(categoryId: string): Category | undefined {
  return weddingCategories.find(cat => cat.id === categoryId);
}

export function getSubcategoryById(subcategoryId: string): { category: Category; subcategory: SubCategory } | undefined {
  for (const category of weddingCategories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      return { category, subcategory };
    }
  }
  return undefined;
}

// Flat list of all categories for dropdowns
export const flatCategories = weddingCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  nameHindi: cat.nameHindi,
  icon: cat.icon,
  color: cat.color,
  subcategoryCount: cat.subcategories.length,
}));

// Total counts
export const totalCategories = weddingCategories.length;
export const totalSubcategories = weddingCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0);
