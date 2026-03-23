export interface Artwork {
  id: string;
  title: string;
  medium: string;
  year: string;
  description: string;
  image: string;
  category: string;
  price: string;
}

export const ARTWORKS: Artwork[] = [
  {
    id: "1",
    title: "Golden Hour",
    medium: "Graphite on Paper",
    year: "2024",
    description: "A contemplative portrait capturing the fleeting warmth of afternoon light, rendered in meticulous graphite strokes that breathe life into every strand of hair and subtle expression.",
    image: "https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800&q=80",
    category: "Portrait",
    price: "₹4,500",
  },
  {
    id: "2",
    title: "Serenity",
    medium: "Digital Illustration",
    year: "2024",
    description: "Digital artwork exploring the peaceful intersection of human form and natural surroundings, blending hyperrealistic detail with painterly abstraction.",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=80",
    category: "Digital",
    price: "₹6,000",
  },
  {
    id: "3",
    title: "Timeless",
    medium: "Charcoal & Pastel",
    year: "2023",
    description: "A study in dualities — youth and age, shadow and light — rendered with expressive charcoal strokes softened by delicate pastel highlights.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
    category: "Portrait",
    price: "₹5,500",
  },
  {
    id: "4",
    title: "Fauna Study",
    medium: "Graphite on Paper",
    year: "2023",
    description: "Hyperrealistic animal portrait capturing the raw intelligence and quiet dignity of wildlife with obsessive attention to texture and tone.",
    image: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80",
    category: "Animal",
    price: "₹3,800",
  },
  {
    id: "5",
    title: "Two Souls",
    medium: "Pencil & Ink",
    year: "2024",
    description: "A couple portrait drawn with romantic softness — fine pencil work building layers of emotion, completed with delicate ink details.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
    category: "Couple",
    price: "₹7,200",
  },
];
