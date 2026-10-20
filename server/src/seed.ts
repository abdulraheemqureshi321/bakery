import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from './config/db';
import { Member } from './models/Member';
import { Setting } from './models/Setting';
import { Category } from './models/Category';
import { Product } from './models/Product';
import { generateReferralCode } from './utils/helpers';

const SALT_ROUNDS = 12;

const defaultSettings = [
  // Store Info
  { key: 'store_name', value: 'SoulTalk Pastry', label: 'Store Name', group: 'store', type: 'string' as const, isPublic: true },
  { key: 'store_address', value: '123 Baker Street, Bangsar, 59100 Kuala Lumpur, Malaysia', label: 'Store Address', group: 'store', type: 'string' as const, isPublic: true },
  { key: 'store_phone', value: '+60123456789', label: 'Store Phone', group: 'store', type: 'string' as const, isPublic: true },
  { key: 'store_opening_hours', value: 'Tuesday - Sunday: 9:00 AM - 8:00 PM (Closed Mondays)', label: 'Opening Hours', group: 'store', type: 'string' as const, isPublic: true },
  { key: 'whatsapp_number', value: '60123456789', label: 'WhatsApp Number', group: 'store', type: 'string' as const, isPublic: true },

  // Brand
  { key: 'brand_logo', value: '', label: 'Brand Logo URL', group: 'brand', type: 'string' as const, isPublic: true },
  { key: 'brand_primary_color', value: '#D4708F', label: 'Primary Color', group: 'brand', type: 'string' as const, isPublic: true },
  { key: 'brand_secondary_color', value: '#F5E6CC', label: 'Secondary Color', group: 'brand', type: 'string' as const, isPublic: true },
  { key: 'brand_font', value: 'Outfit', label: 'Brand Font', group: 'brand', type: 'string' as const, isPublic: true },

  // Localization
  { key: 'default_country_code', value: '+60', label: 'Default Country Code', group: 'localization', type: 'string' as const, isPublic: false },
  { key: 'currency', value: 'MYR', label: 'Currency', group: 'localization', type: 'string' as const, isPublic: true },
  { key: 'currency_symbol', value: 'RM', label: 'Currency Symbol', group: 'localization', type: 'string' as const, isPublic: true },

  // Pickup
  { key: 'pickup_time_slots', value: ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'], label: 'Pickup Time Slots', group: 'fulfillment', type: 'array' as const, isPublic: true },
  { key: 'pickup_lead_hours', value: 24, label: 'Pickup Lead Time (hours)', group: 'fulfillment', type: 'number' as const, isPublic: true },

  // Delivery
  { key: 'delivery_enabled', value: true, label: 'Delivery Enabled', group: 'fulfillment', type: 'boolean' as const, isPublic: true },
  { key: 'delivery_fee_rules', value: { flat: 12, freeAbove: 120 }, label: 'Delivery Fee Rules', group: 'fulfillment', type: 'json' as const, isPublic: true },
  { key: 'delivery_areas', value: ['Kuala Lumpur', 'Petaling Jaya', 'Subang Jaya', 'Mont Kiara', 'Bangsar'], label: 'Delivery Areas', group: 'fulfillment', type: 'array' as const, isPublic: true },

  // Payment
  { key: 'enabled_payment_methods', value: ['pay_in_store', 'cash_on_delivery'], label: 'Enabled Payment Methods', group: 'payment', type: 'array' as const, isPublic: true },

  // Points (Phase 5)
  { key: 'points_earn_ratio', value: 1, label: 'Points Earned Per RM Spent', group: 'points', type: 'number' as const, isPublic: true },
  { key: 'points_redeem_ratio', value: 0.01, label: 'RM Value Per Point Redeemed', group: 'points', type: 'number' as const, isPublic: true },
  { key: 'points_min_redeem', value: 100, label: 'Minimum Points to Redeem', group: 'points', type: 'number' as const, isPublic: true },
  { key: 'points_max_redeem_per_order', value: 500, label: 'Max Points Redeemable Per Order', group: 'points', type: 'number' as const, isPublic: true },
  { key: 'points_max_order_share_percent', value: 50, label: 'Max Order Share Payable by Points (%)', group: 'points', type: 'number' as const, isPublic: true },
  { key: 'points_credit_event', value: 'order_completed', label: 'When Points are Credited', group: 'points', type: 'string' as const, isPublic: true },

  // Referral (Phase 6)
  { key: 'referral_trigger', value: 'first_order', label: 'Referral Reward Trigger (registration / first_order)', group: 'referral', type: 'string' as const, isPublic: true },
  { key: 'referral_reward_type', value: 'points', label: 'Referrer Reward Type (points / voucher / both)', group: 'referral', type: 'string' as const, isPublic: true },
  { key: 'referral_reward_value', value: 50, label: 'Referrer Reward Points', group: 'referral', type: 'number' as const, isPublic: true },
  { key: 'referral_reward_voucher_code', value: '', label: 'Referrer Reward Voucher Code', group: 'referral', type: 'string' as const, isPublic: true },
  { key: 'referral_referee_reward_type', value: 'points', label: 'Referee Reward Type (points / voucher / both / none)', group: 'referral', type: 'string' as const, isPublic: true },
  { key: 'referral_referee_reward_value', value: 25, label: 'Referee Reward Points', group: 'referral', type: 'number' as const, isPublic: true },
  { key: 'referral_referee_reward_voucher_code', value: '', label: 'Referee Reward Voucher Code', group: 'referral', type: 'string' as const, isPublic: true },
];

async function seed() {
  console.log('🌱 Starting Phase 2 seed...\n');

  await connectDB();

  // Clear existing collections
  await Member.deleteMany({});
  await Setting.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  // 1. Seed admin user
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  let adminReferralCode = generateReferralCode();
  while (await Member.findOne({ referralCode: adminReferralCode })) {
    adminReferralCode = generateReferralCode();
  }

  const admin = await Member.create({
    name: 'Admin',
    phone: '+60100000000',
    email: 'admin@soultalkpastry.com',
    passwordHash: adminPassword,
    role: 'admin',
    referralCode: adminReferralCode,
    status: 'active',
  });
  console.log(`✅ Admin created: ${admin.email} / admin123`);

  // 2. Seed sample members
  const memberData = [
    { name: 'Alice Tan', phone: '+60121111111', email: 'alice@example.com', pointsBalance: 120 },
    { name: 'Bob Lee', phone: '+60122222222', email: 'bob@example.com', pointsBalance: 250 },
    { name: 'Carol Wong', phone: '+60123333333', pointsBalance: 50 },
  ];

  for (const m of memberData) {
    const password = await bcrypt.hash('member123', SALT_ROUNDS);
    let code = generateReferralCode();
    while (await Member.findOne({ referralCode: code })) {
      code = generateReferralCode();
    }
    await Member.create({
      ...m,
      passwordHash: password,
      referralCode: code,
    });
  }
  console.log(`✅ ${memberData.length} sample members created`);

  // 3. Seed settings
  for (const s of defaultSettings) {
    await Setting.findOneAndUpdate(
      { key: s.key },
      { $set: s },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ ${defaultSettings.length} settings seeded`);

  // 4. Seed categories
  const categoriesData = [
    {
      name: 'Celebration Cakes',
      slug: 'celebration-cakes',
      description: 'Handcrafted signature whole cakes for birthdays, anniversaries and milestones.',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Custom Creations',
      slug: 'custom-creations',
      description: 'Bespoke cakes with tailored flavor profiles, personalized greeting plaques and custom sizes.',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Party Bags & Favors',
      slug: 'party-bags',
      description: 'Individually curated gift bags, party boxes, and celebration pastry packs.',
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Petit Pastries & Éclairs',
      slug: 'petit-pastries',
      description: 'French bite-sized desserts, artisan éclairs, tartlets, and delicate macarons.',
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Artisanal Breads & Tea Bakes',
      slug: 'artisanal-breads',
      description: 'Flaky brioche, savory tea breads, and authentic French morning delicacies.',
      sortOrder: 5,
      isActive: true,
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const doc = await Category.create(cat);
    createdCategories[cat.slug] = doc._id;
  }
  console.log(`✅ ${categoriesData.length} categories seeded`);

  // 5. Seed 8-10 sample products (including customizable cake & Party Bags)
  const productsData = [
    {
      name: 'Signature Velvet Bloom Cake',
      slug: 'signature-velvet-bloom-cake',
      price: 128,
      category: createdCategories['custom-creations'],
      description:
        'Our crown jewel. Tender red velvet and Madagascar vanilla chiffon sponge layered with whipped mascarpone cream, topped with fresh hand-piped buttercream florals. Supports custom wording plaque and candle set.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/velvet_bloom_1',
        },
        {
          url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/velvet_bloom_2',
        },
      ],
      variants: [
        {
          name: 'Size',
          options: ['6-inch (4-6 pax)', '8-inch (8-10 pax)', '10-inch (12-16 pax)'],
          priceModifiers: [0, 40, 85],
        },
        {
          name: 'Sponge Flavor',
          options: ['Red Velvet Cocoa', 'Madagascar Vanilla Bean', 'Earl Grey Tea'],
          priceModifiers: [0, 0, 5],
        },
        {
          name: 'Sweetness Level',
          options: ['Regular (100%)', 'Less Sweet (70%)', 'Mild Sweet (50%)'],
          priceModifiers: [0, 0, 0],
        },
      ],
      supportsCustomization: true,
      featured: true,
      isActive: true,
    },
    {
      name: 'SoulTalk Celebration Party Bags (Set of 10)',
      slug: 'soultalk-celebration-party-bags',
      price: 150,
      category: createdCategories['party-bags'],
      description:
        'Specially curated celebration favor packs for children’s birthday parties, corporate milestones, and wedding door gifts. Each bag contains 2 mini French macarons, 1 dark chocolate brownie bite, and 2 matcha butter sablés in an elegant gold-ribbon gift box.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/party_bags_1',
        },
        {
          url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/party_bags_2',
        },
      ],
      variants: [
        {
          name: 'Bag Quantity',
          options: ['Set of 10 Bags', 'Set of 20 Bags', 'Set of 30 Bags'],
          priceModifiers: [0, 135, 260],
        },
        {
          name: 'Ribbon Color',
          options: ['Blush Rose', 'Champagne Gold', 'Sage Green'],
          priceModifiers: [0, 0, 0],
        },
      ],
      supportsCustomization: true,
      featured: true,
      isActive: true,
    },
    {
      name: 'Mango Passion Pavlova Cake',
      slug: 'mango-passion-pavlova-cake',
      price: 115,
      category: createdCategories['celebration-cakes'],
      description:
        'Crisp on the outside with a delicate marshmallow-like center, generously crowned with fresh Malaysian sweet mango chunks, passionfruit coulis, and lightly whipped French cream.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/pavlova_1',
        },
      ],
      variants: [
        {
          name: 'Size',
          options: ['7-inch (6-8 pax)', '9-inch (10-12 pax)'],
          priceModifiers: [0, 45],
        },
      ],
      supportsCustomization: false,
      featured: true,
      isActive: true,
    },
    {
      name: 'Noir 70% Dark Chocolate Truffle Cake',
      slug: 'noir-dark-chocolate-truffle-cake',
      price: 135,
      category: createdCategories['celebration-cakes'],
      description:
        'Intense, decadent Belgian Valrhona 70% dark chocolate mousse layered between moist flourless chocolate sponge and cocoa glaze.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/noir_truffle_1',
        },
      ],
      variants: [
        {
          name: 'Size',
          options: ['6-inch (4-6 pax)', '8-inch (8-10 pax)'],
          priceModifiers: [0, 45],
        },
      ],
      supportsCustomization: true,
      featured: true,
      isActive: true,
    },
    {
      name: 'Japanese Uji Matcha Mille Crêpe',
      slug: 'japanese-uji-matcha-mille-crepe',
      price: 140,
      category: createdCategories['celebration-cakes'],
      description:
        'Over 20 whisper-thin handmade crêpes infused with premium Kyoto Uji ceremonial grade matcha, layered with silky matcha diplomat cream.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1557308536-ee471ef2c390?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/matcha_crepe_1',
        },
      ],
      variants: [
        {
          name: 'Size',
          options: ['8-inch (8-10 pax)'],
          priceModifiers: [0],
        },
      ],
      supportsCustomization: false,
      featured: false,
      isActive: true,
    },
    {
      name: 'Strawberry Chantilly Blossom',
      slug: 'strawberry-chantilly-blossom',
      price: 120,
      category: createdCategories['celebration-cakes'],
      description:
        'Japanese cotton sponge cake filled with fresh Cameron Highlands strawberries and light Tahitian vanilla Chantilly cream.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/strawberry_chantilly_1',
        },
      ],
      variants: [
        {
          name: 'Size',
          options: ['6-inch', '8-inch'],
          priceModifiers: [0, 40],
        },
      ],
      supportsCustomization: true,
      featured: true,
      isActive: true,
    },
    {
      name: 'French Pistachio & Berry Éclair Box (6 pcs)',
      slug: 'french-pistachio-berry-eclair-box',
      price: 48,
      category: createdCategories['petit-pastries'],
      description:
        'Crisp choux pastry baked to golden perfection, generously piped with Sicilian pistachio praline cream and tart raspberry glaze.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/eclair_box_1',
        },
      ],
      variants: [
        {
          name: 'Flavor Mix',
          options: ['Pistachio & Raspberry', 'Classic Dark Chocolate', 'Assorted Chef Selection'],
          priceModifiers: [0, 0, 4],
        },
      ],
      supportsCustomization: false,
      featured: false,
      isActive: true,
    },
    {
      name: 'Artisan Macaron Rainbow Box (12 pcs)',
      slug: 'artisan-macaron-rainbow-box',
      price: 65,
      category: createdCategories['petit-pastries'],
      description:
        'Assorted French almond macarons with delicate shells and rich ganache fillings: Salted Caramel, Earl Grey, Rose Lychee, Dark Chocolate, and Pistachio.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/macaron_box_1',
        },
      ],
      variants: [],
      supportsCustomization: false,
      featured: true,
      isActive: true,
    },
    {
      name: 'Salted Caramel Canelé Gift Box (4 pcs)',
      slug: 'salted-caramel-canele-gift-box',
      price: 36,
      category: createdCategories['petit-pastries'],
      description:
        'Bordeaux specialty with a deeply caramelized crust and custardy, rum-and-vanilla scented tender interior.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/canele_1',
        },
      ],
      variants: [],
      supportsCustomization: false,
      featured: false,
      isActive: true,
    },
    {
      name: 'Golden Brioche Feuilletée Loaf',
      slug: 'golden-brioche-feuilletee-loaf',
      price: 28,
      category: createdCategories['artisanal-breads'],
      description:
        'Laminated French brioche combining the rich buttery softness of brioche with the caramelized flaky layers of a croissant.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
          publicId: 'soultalk/seed/brioche_1',
        },
      ],
      variants: [],
      supportsCustomization: false,
      featured: false,
      isActive: true,
    },
  ];

  for (const prod of productsData) {
    await Product.create(prod);
  }
  console.log(`✅ ${productsData.length} sample products seeded`);

  console.log('\n🌱 Phase 2 Seed complete!');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
