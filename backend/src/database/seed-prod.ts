import { db } from "./db";
import { categories, products } from "./schema";
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
        "Over-ear Bluetooth headphones with active noise cancellation, 30-hour battery life, and spatial audio.",
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
    {
      name: "Portable Bluetooth Speaker Pro",
      description:
        "IPX7 waterproof wireless speaker delivering 360-degree sound, deep bass, and 12-hour battery performance.",
      price: "79.99",
      stock: 35,
      imageUrl:
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Studio Condenser USB Microphone",
      description:
        "Plug-and-play USB condenser microphone ideal for streaming, podcasting, and voiceovers.",
      price: "69.50",
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Ultra-Wide Gaming Monitor 34-Inch",
      description:
        "Curved 144Hz IPS display featuring 1ms response time, HDR10 support, and AMD FreeSync.",
      price: "449.00",
      stock: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "MagSafe Fast Wireless Power Bank",
      description:
        "10,000mAh magnetic power bank with pass-through charging and dual USB-C power delivery.",
      price: "39.99",
      stock: 60,
      imageUrl:
        "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Noise-Isolating In-Ear Earbuds",
      description:
        "True wireless earbuds with custom audio EQ, touch controls, and compact wireless charging case.",
      price: "59.99",
      stock: 45,
      imageUrl:
        "https://images.unsplash.com/photo-1590658006821-04f4008d5717?auto=format&fit=crop&w=800&q=80",
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
        "Soft fleece-lined pullover sweatshirt with ribbed cuffs and hem, available in neutral tones.",
      price: "49.99",
      stock: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Tailored Slim-Fit Chino Pants",
      description:
        "Versatile stretch-cotton chinos suitable for casual daily wear or smart-casual office settings.",
      price: "55.00",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Waterproof Outdoor Parka",
      description:
        "All-weather insulated jacket with removable hood, storm flap, and multiple thermal pockets.",
      price: "159.99",
      stock: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Vintage Analog Wristwatch",
      description:
        "Stainless steel case watch with genuine leather strap and Japanese quartz movement.",
      price: "110.00",
      stock: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Breathable Athletic Shorts",
      description:
        "Moisture-wicking training shorts with zip pockets and adjustable drawstring waistband.",
      price: "29.99",
      stock: 50,
      imageUrl:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Merino Wool Knit Beanie",
      description:
        "Ultra-soft 100% merino wool rib-knit beanie designed for superior warmth during cold seasons.",
      price: "24.50",
      stock: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80",
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
    {
      name: "Electric Gooseneck Water Kettle",
      description:
        "Precision temperature control kettle ideal for pour-over coffee and tea brewing.",
      price: "64.99",
      stock: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Chef Professional Santoku Knife",
      description:
        "High-carbon German steel 7-inch Santoku knife with ergonomic pakkawood handle.",
      price: "49.99",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Bamboo Fiber Cutting Board Set",
      description:
        "Set of 3 eco-friendly organic bamboo cutting boards with juice grooves and handle grips.",
      price: "29.50",
      stock: 35,
      imageUrl:
        "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "High-Speed Countertop Blender",
      description:
        "1200-watt professional blender for smoothies, frozen drinks, and soup purees.",
      price: "99.00",
      stock: 16,
      imageUrl:
        "https://images.unsplash.com/photo-1570222020538-2d88053a479a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Automatic Espresso Machine",
      description:
        "15-bar Italian pump espresso maker with built-in steam wand for cappuccinos and lattes.",
      price: "229.99",
      stock: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

// Generic fallback array for any other categories
const fallbackProductsTemplate = Array.from({ length: 10 }, (_, i) => ({
  nameSuffix: `Premium Item ${i + 1}`,
  price: (20 + i * 15).toFixed(2),
  stock: 10 + i * 3,
  imageUrl:
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
}));

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
  console.log("🌱 Starting expanded 10-product category seed process...");

  try {
    const allCategories = await db.select().from(categories);

    if (allCategories.length === 0) {
      console.log("⚠️ No categories found in database. Seed categories first!");
      return;
    }

    let totalInserted = 0;

    for (const category of allCategories) {
      const categorySlug = category.slug;

      const itemsToSeed =
        sampleProductsData[categorySlug] ||
        fallbackProductsTemplate.map((item) => ({
          name: `${category.name} ${item.nameSuffix}`,
          description: `High quality ${category.name.toLowerCase()} item built for durability and premium experience.`,
          price: item.price,
          stock: item.stock,
          imageUrl: item.imageUrl,
        }));

      for (let i = 0; i < itemsToSeed.length; i++) {
        const prod = itemsToSeed[i];
        const slug = generateSlug(prod.name);
        const sku = generateSKU(categorySlug, i);

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
          totalInserted++;
        }
      }
    }

    console.log(
      `✅ Seeding complete! Successfully added ${totalInserted} products across all categories.`,
    );
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
}

seedProducts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
