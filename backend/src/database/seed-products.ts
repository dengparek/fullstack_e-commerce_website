import { db } from "./db";
import { categories, products } from "./schema"; // Import schema definitions
import { eq } from "drizzle-orm";

const sampleProductsData: Record<
  string,
  Array<{
    name: string;
    description: string;
    price: string;
    stock: number;
    imageUrl: string;
  }>
> = {
  electronics: [
    {
      name: "Wireless Noise-Canceling Headphones",
      description:
        "Over-ear bluetooth headphones with active noise cancellation, 30-hour battery life, and spatial audio.",
      price: "199.99",
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Smart Fitness Watch Ultra",
      description:
        "Water-resistant smartwatch featuring heart rate tracking, GPS navigation, and OLED retina display.",
      price: "149.50",
      stock: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "4K Ultra HD Action Camera",
      description:
        "Compact waterproof action camera with electronic image stabilization and wide-angle lens.",
      price: "129.00",
      stock: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Mechanical Gaming Keyboard",
      description:
        "RGB backlit mechanical keyboard with tactile blue switches and detachable USB-C braided cable.",
      price: "89.99",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Ergonomic Wireless Mouse",
      description:
        "Precision optical wireless mouse designed for long hours of comfortable productivity.",
      price: "45.00",
      stock: 50,
      imageUrl:
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    },
  ],
  fashion: [
    {
      name: "Classic Denim Jacket",
      description:
        "Timeless trucker-style denim jacket crafted from 100% durable cotton with chest pockets.",
      price: "79.99",
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Urban Lightweight Sneakers",
      description:
        "Breathable mesh running sneakers built with cushioned memory foam insoles for daily comfort.",
      price: "89.50",
      stock: 35,
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Minimalist Leather Backpack",
      description:
        "Sleek full-grain leather backpack featuring a padded 15-inch laptop sleeve and brass hardware.",
      price: "120.00",
      stock: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Polarized Aviator Sunglasses",
      description:
        "Classic gold-frame sunglasses with UV400 polarized lenses for maximum sun protection.",
      price: "35.00",
      stock: 45,
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Cotton Crewneck Sweatshirt",
      description:
        "Soft fleece-lined pullover sweatshirt with ribbed cuffs and hem, available in versatile neutral tones.",
      price: "49.99",
      stock: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "home-kitchen": [
    {
      name: "Pour-Over Coffee Maker",
      description:
        "Heat-resistant borosilicate glass coffee dripper with a reusable stainless steel mesh filter.",
      price: "34.99",
      stock: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1517668808822-9a2c1b8295b9?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Stainless Steel Air Fryer",
      description:
        "5.8-quart digital air fryer with 8 touch presets and non-stick dishwasher-safe basket.",
      price: "119.99",
      stock: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Ceramic Cookware Set (10-Piece)",
      description:
        "Non-stick eco-friendly ceramic pots and pans set suitable for induction, gas, and electric stoves.",
      price: "189.00",
      stock: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Smart LED Desk Lamp",
      description:
        "Dimmable LED lamp featuring 5 color modes, built-in wireless phone charger, and auto timer.",
      price: "42.50",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Aromatherapy Essential Oil Diffuser",
      description:
        "300ml ultrasonic cool mist diffuser with 7 ambient LED light colors and whisper-quiet operation.",
      price: "28.00",
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

// Default fallback items for any additional category found in your database
const fallbackProducts = [
  {
    name: "Premium Quality Item A",
    price: "29.99",
    stock: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Deluxe Essential Item B",
    price: "49.99",
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Pro Series Product C",
    price: "79.99",
    stock: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Smart Edition Item D",
    price: "99.99",
    stock: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Compact Daily Item E",
    price: "19.99",
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
  },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSKU(categorySlug: string, index: number): string {
  const prefix = categorySlug.slice(0, 3).toUpperCase();
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${index + 1}`;
}

export async function seedProducts() {
  console.log("🌱 Starting product database seeding...");

  try {
    // 1. Fetch existing categories
    const allCategories = await db.select().from(categories);

    if (allCategories.length === 0) {
      console.log(
        "⚠️ No categories found in database. Please seed categories first!",
      );
      return;
    }

    console.log(`📂 Found ${allCategories.length} categories.`);

    let insertedCount = 0;

    for (const category of allCategories) {
      const categorySlug = category.slug;

      // Determine product list to use (or use fallback templates)
      const productsToSeed =
        sampleProductsData[categorySlug] ||
        fallbackProducts.map((p, idx) => ({
          name: `${category.name} - ${p.name}`,
          description: `High quality ${category.name.toLowerCase()} product crafted with high standards.`,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
        }));

      for (let i = 0; i < productsToSeed.length; i++) {
        const prod = productsToSeed[i];
        const slug = generateSlug(prod.name);
        const sku = generateSKU(categorySlug, i);

        // Check if product with slug already exists
        const [existing] = await db
          .select()
          .from(products)
          .where(eq(products.slug, slug))
          .limit(1);

        if (!existing) {
          await db.insert(products).values({
            name: prod.name,
            slug,
            sku,
            description: prod.description,
            price: prod.price,
            stock: prod.stock,
            imageUrl: prod.imageUrl,
            categoryId: category.id,
            isActive: true,
          });
          insertedCount++;
        }
      }
    }

    console.log(
      `✅ Seeding complete! Successfully added ${insertedCount} new products.`,
    );
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
}

// Execute directly if run via CLI
seedProducts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
