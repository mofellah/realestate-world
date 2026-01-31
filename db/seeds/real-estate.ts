/**
 * Real Estate seed: properties, listings, addresses
 * Creates sample real estate data for testing
 */

import {
  PrismaClient,
  PropertyType,
  ListingType,
  ListingStatus,
  PaymentTermType,
  GeoObjectType,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRealEstate() {
  console.log("🏠 Seeding real estate data (properties, listings)...");

  // Get users for property ownership
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  const normalUser = await prisma.user.findUnique({ where: { email: "user@example.com" } });

  if (!adminUser || !normalUser) {
    throw new Error("Cannot seed real estate: baseline users not found. Run baseline seed first.");
  }

  // ============================================================================
  // 1. Create Addresses with GeoObjects (Coordinates) - Brussels Area
  // ============================================================================
  console.log("Creating addresses with realistic Brussels coordinates...");

  // Define 25 realistic properties around Brussels center (50.8503° N, 4.3517° E)
  const brusselsProperties = [
    // European Quarter
    {
      lat: 50.8429,
      lng: 4.3733,
      street: "Rue de la Loi 200",
      number: "200",
      postal: "1000",
      district: "Brussels Center",
    },
    {
      lat: 50.8463,
      lng: 4.3682,
      street: "Avenue des Arts",
      number: "56",
      postal: "1000",
      district: "Brussels Center",
    },
    {
      lat: 50.8445,
      lng: 4.3756,
      street: "Rue Belliard",
      number: "97",
      postal: "1040",
      district: "Etterbeek",
    },

    // Ixelles (trendy, young professional area)
    {
      lat: 50.8277,
      lng: 4.3762,
      street: "Chaussée d'Ixelles",
      number: "185",
      postal: "1050",
      district: "Ixelles",
    },
    {
      lat: 50.8321,
      lng: 4.3819,
      street: "Avenue Louise",
      number: "331",
      postal: "1050",
      district: "Ixelles",
    },
    {
      lat: 50.8298,
      lng: 4.3694,
      street: "Rue du Bailli",
      number: "42",
      postal: "1050",
      district: "Ixelles",
    },
    {
      lat: 50.8255,
      lng: 4.3723,
      street: "Place Flagey",
      number: "18",
      postal: "1050",
      district: "Ixelles",
    },

    // Saint-Gilles (artsy, multicultural)
    {
      lat: 50.8307,
      lng: 4.3426,
      street: "Chaussée de Waterloo",
      number: "510",
      postal: "1050",
      district: "Saint-Gilles",
    },
    {
      lat: 50.8284,
      lng: 4.3389,
      street: "Avenue Jean Volders",
      number: "25",
      postal: "1060",
      district: "Saint-Gilles",
    },
    {
      lat: 50.8335,
      lng: 4.3512,
      street: "Rue de la Victoire",
      number: "67",
      postal: "1060",
      district: "Saint-Gilles",
    },

    // Schaerbeek (residential, family-friendly)
    {
      lat: 50.8658,
      lng: 4.3812,
      street: "Avenue Louis Bertrand",
      number: "143",
      postal: "1030",
      district: "Schaerbeek",
    },
    {
      lat: 50.8723,
      lng: 4.3897,
      street: "Boulevard Lambermont",
      number: "89",
      postal: "1030",
      district: "Schaerbeek",
    },
    {
      lat: 50.8612,
      lng: 4.3765,
      street: "Rue Josaphat",
      number: "201",
      postal: "1030",
      district: "Schaerbeek",
    },

    // Uccle (upscale residential)
    {
      lat: 50.7998,
      lng: 4.3312,
      street: "Avenue Winston Churchill",
      number: "175",
      postal: "1180",
      district: "Uccle",
    },
    {
      lat: 50.8045,
      lng: 4.3589,
      street: "Avenue Brugmann",
      number: "456",
      postal: "1180",
      district: "Uccle",
    },
    {
      lat: 50.7956,
      lng: 4.3445,
      street: "Chaussée de Waterloo",
      number: "1275",
      postal: "1180",
      district: "Uccle",
    },

    // Woluwe-Saint-Pierre (business district)
    {
      lat: 50.8289,
      lng: 4.4234,
      street: "Avenue de Tervuren",
      number: "298",
      postal: "1150",
      district: "Woluwe-Saint-Pierre",
    },
    {
      lat: 50.8356,
      lng: 4.4312,
      street: "Boulevard du Souverain",
      number: "165",
      postal: "1160",
      district: "Woluwe-Saint-Pierre",
    },

    // Anderlecht (up-and-coming)
    {
      lat: 50.8312,
      lng: 4.3187,
      street: "Rue du Chimiste",
      number: "34",
      postal: "1070",
      district: "Anderlecht",
    },
    {
      lat: 50.8389,
      lng: 4.3245,
      street: "Boulevard Sylvain Dupuis",
      number: "72",
      postal: "1070",
      district: "Anderlecht",
    },

    // Forest (green, family neighborhoods)
    {
      lat: 50.8167,
      lng: 4.3234,
      street: "Avenue du Globe",
      number: "92",
      postal: "1190",
      district: "Forest",
    },
    {
      lat: 50.8123,
      lng: 4.3312,
      street: "Chaussée de Bruxelles",
      number: "418",
      postal: "1190",
      district: "Forest",
    },

    // Molenbeek (multicultural, affordable)
    {
      lat: 50.8534,
      lng: 4.3223,
      street: "Chaussée de Gand",
      number: "267",
      postal: "1080",
      district: "Molenbeek",
    },
    {
      lat: 50.8589,
      lng: 4.3334,
      street: "Boulevard Leopold II",
      number: "156",
      postal: "1080",
      district: "Molenbeek",
    },

    // Downtown Brussels (prime location)
    {
      lat: 50.8467,
      lng: 4.3525,
      street: "Grand Place",
      number: "1",
      postal: "1000",
      district: "Brussels Center",
    },
  ];

  const addresses = [];
  const geoObjects = [];

  for (const prop of brusselsProperties) {
    const geo = await prisma.geoObject.create({
      data: {
        type: GeoObjectType.point,
        latitude: prop.lat,
        longitude: prop.lng,
        name: `${prop.number} ${prop.street}`,
      },
    });
    geoObjects.push(geo);

    const address = await prisma.address.create({
      data: {
        streetNumber: prop.number,
        streetName: prop.street,
        city: prop.district,
        region: "Brussels Capital Region",
        country_code: "BE",
        postalCode: prop.postal,
        geoObjectId: geo.id,
      },
    });
    addresses.push(address);
  }

  console.log(`✓ Created ${addresses.length} addresses with geo-coordinates in Brussels`);

  // ============================================================================
  // 2. Create Persons (Property Owners) - Diverse Realistic Owners
  // ============================================================================
  console.log("Creating property owners...");

  const owners = [];

  const ownerData = [
    { email: "marie.dubois@gmail.com", firstName: "Marie", lastName: "Dubois", nationality: "BE" },
    { email: "jean.martin@hotmail.com", firstName: "Jean", lastName: "Martin", nationality: "BE" },
    {
      email: "sophie.laurent@outlook.com",
      firstName: "Sophie",
      lastName: "Laurent",
      nationality: "FR",
    },
    {
      email: "pierre.bernard@gmail.com",
      firstName: "Pierre",
      lastName: "Bernard",
      nationality: "BE",
    },
    { email: "anne.petit@yahoo.com", firstName: "Anne", lastName: "Petit", nationality: "BE" },
    { email: "luc.robert@gmail.com", firstName: "Luc", lastName: "Robert", nationality: "BE" },
    {
      email: "isabelle.richard@hotmail.com",
      firstName: "Isabelle",
      lastName: "Richard",
      nationality: "FR",
    },
    {
      email: "michel.durand@gmail.com",
      firstName: "Michel",
      lastName: "Durand",
      nationality: "BE",
    },
  ];

  for (const owner of ownerData) {
    const person = await prisma.person.create({
      data: { email: owner.email },
    });

    await prisma.physicalPerson.create({
      data: {
        personId: person.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        nationality: owner.nationality,
      },
    });

    owners.push(person);
  }

  console.log(`✓ Created ${owners.length} property owners`);

  // ============================================================================
  // 3. Create Properties
  // ============================================================================
  console.log("Creating properties...");

  const propertyData = [
    // Studios (5)
    {
      title: "Cozy Studio near EU Quarter",
      desc: "Modern studio apartment perfect for young professionals, close to European institutions and public transport",
      type: PropertyType.studio,
      beds: 0,
      baths: 1,
      surface: 35,
      year: 2018,
      amenities: ["elevator", "intercom", "fiber"],
    },
    {
      title: "Bright Studio in Ixelles",
      desc: "Sunny studio with balcony in vibrant Ixelles neighborhood, walking distance to cafes and shops",
      type: PropertyType.studio,
      beds: 0,
      baths: 1,
      surface: 28,
      year: 2015,
      amenities: ["balcony", "renovated", "furnished"],
    },
    {
      title: "Student Studio Saint-Gilles",
      desc: "Affordable studio ideal for students, near ULB campus with all amenities included",
      type: PropertyType.studio,
      beds: 0,
      baths: 1,
      surface: 30,
      year: 2012,
      amenities: ["furnished", "internet", "laundry"],
    },
    {
      title: "Modern Studio Schaerbeek",
      desc: "Recently renovated studio with open kitchen and modern bathroom in upcoming area",
      type: PropertyType.studio,
      beds: 0,
      baths: 1,
      surface: 32,
      year: 2020,
      amenities: ["elevator", "renovated", "bike_storage"],
    },
    {
      title: "Compact Studio Downtown",
      desc: "Efficient studio in Brussels city center, perfect location near Central Station",
      type: PropertyType.studio,
      beds: 0,
      baths: 1,
      surface: 26,
      year: 2010,
      amenities: ["central", "secure_entry", "elevator"],
    },

    // Apartments (12)
    {
      title: "Spacious 2BR near European Quarter",
      desc: "Beautiful 2-bedroom apartment with high ceilings and period features, close to EU institutions",
      type: PropertyType.apartment,
      beds: 2,
      baths: 1,
      surface: 85,
      year: 1920,
      amenities: ["high_ceilings", "parquet", "fireplace"],
    },
    {
      title: "Modern 1BR in Ixelles",
      desc: "Contemporary 1-bedroom with terrace overlooking leafy courtyard, in trendy Ixelles",
      type: PropertyType.apartment,
      beds: 1,
      baths: 1,
      surface: 62,
      year: 2017,
      amenities: ["terrace", "elevator", "double_glazing"],
    },
    {
      title: "Luxury 3BR Apartment Saint-Gilles",
      desc: "High-end 3-bedroom apartment with Art Nouveau details and rooftop access",
      type: PropertyType.apartment,
      beds: 3,
      baths: 2,
      surface: 140,
      year: 1905,
      amenities: ["art_nouveau", "terrace", "cellar"],
    },
    {
      title: "Family 2BR Schaerbeek",
      desc: "Comfortable 2-bedroom family apartment near schools and parks",
      type: PropertyType.apartment,
      beds: 2,
      baths: 1,
      surface: 90,
      year: 1985,
      amenities: ["balcony", "storage", "parking"],
    },
    {
      title: "Penthouse 2BR Uccle",
      desc: "Top floor 2-bedroom penthouse with panoramic views and private terrace",
      type: PropertyType.apartment,
      beds: 2,
      baths: 2,
      surface: 110,
      year: 2019,
      amenities: ["terrace", "elevator", "concierge", "parking"],
    },
    {
      title: "Charming 1BR Woluwe",
      desc: "Cozy 1-bedroom apartment in green residential area with excellent transport links",
      type: PropertyType.apartment,
      beds: 1,
      baths: 1,
      surface: 55,
      year: 1975,
      amenities: ["garden_view", "cellar", "quiet"],
    },
    {
      title: "Renovated 2BR Anderlecht",
      desc: "Fully renovated 2-bedroom with modern kitchen and bathroom, great value",
      type: PropertyType.apartment,
      beds: 2,
      baths: 1,
      surface: 78,
      year: 2021,
      amenities: ["renovated", "equipped_kitchen", "double_glazing"],
    },
    {
      title: "Art Deco 2BR Forest",
      desc: "Stunning Art Deco apartment with original features and modern comfort",
      type: PropertyType.apartment,
      beds: 2,
      baths: 1,
      surface: 95,
      year: 1930,
      amenities: ["art_deco", "parquet", "high_ceilings"],
    },
    {
      title: "Contemporary 1BR Molenbeek",
      desc: "Brand new 1-bedroom in upcoming neighborhood with excellent public transport",
      type: PropertyType.apartment,
      beds: 1,
      baths: 1,
      surface: 58,
      year: 2022,
      amenities: ["new_build", "elevator", "bike_storage"],
    },
    {
      title: "Elegant 3BR Downtown",
      desc: "Elegant 3-bedroom apartment in prestigious Brussels downtown location",
      type: PropertyType.apartment,
      beds: 3,
      baths: 2,
      surface: 125,
      year: 1910,
      amenities: ["period_features", "elevator", "concierge"],
    },
    {
      title: "Duplex 2BR Ixelles",
      desc: "Unique duplex 2-bedroom with mezzanine and private entrance",
      type: PropertyType.apartment,
      beds: 2,
      baths: 1,
      surface: 100,
      year: 2000,
      amenities: ["duplex", "private_entrance", "terrace"],
    },
    {
      title: "Corner 2BR European Quarter",
      desc: "Bright corner apartment with views over Parc du Cinquantenaire",
      type: PropertyType.apartment,
      beds: 2,
      baths: 2,
      surface: 88,
      year: 1960,
      amenities: ["park_view", "balcony", "elevator"],
    },

    // Houses (6)
    {
      title: "Townhouse with Garden Uccle",
      desc: "Charming 4-bedroom townhouse with private garden and garage in sought-after Uccle",
      type: PropertyType.house,
      beds: 4,
      baths: 2,
      surface: 180,
      year: 1965,
      amenities: ["garden", "garage", "fireplace", "office"],
    },
    {
      title: "Family House Woluwe",
      desc: "Spacious 5-bedroom family house with large garden and workshop",
      type: PropertyType.house,
      beds: 5,
      baths: 3,
      surface: 220,
      year: 1980,
      amenities: ["garden", "garage", "workshop", "cellar"],
    },
    {
      title: "Renovated House Forest",
      desc: "Beautifully renovated 3-bedroom house with modern kitchen and bathrooms",
      type: PropertyType.house,
      beds: 3,
      baths: 2,
      surface: 150,
      year: 2019,
      amenities: ["renovated", "garden", "solar_panels", "parking"],
    },
    {
      title: "Period House Saint-Gilles",
      desc: "Stunning period house with original stained glass and mosaic floors",
      type: PropertyType.house,
      beds: 4,
      baths: 2,
      surface: 200,
      year: 1890,
      amenities: ["period_features", "garden", "cellar", "terrace"],
    },
    {
      title: "Modern House Schaerbeek",
      desc: "Contemporary 3-bedroom house with eco-friendly features and garage",
      type: PropertyType.house,
      beds: 3,
      baths: 2,
      surface: 165,
      year: 2020,
      amenities: ["eco_build", "garage", "garden", "heat_pump"],
    },
    {
      title: "Corner House Anderlecht",
      desc: "Corner house with side garden and potential for extension",
      type: PropertyType.house,
      beds: 3,
      baths: 1,
      surface: 140,
      year: 1970,
      amenities: ["garden", "potential", "quiet_street", "parking"],
    },

    // Villas (2)
    {
      title: "Luxury Villa Uccle",
      desc: "Exceptional 6-bedroom villa with pool, landscaped garden, and high-end finishes in prestigious Uccle",
      type: PropertyType.villa,
      beds: 6,
      baths: 4,
      surface: 350,
      year: 2015,
      amenities: ["pool", "garden", "security", "sauna", "garage", "wine_cellar"],
    },
    {
      title: "Modern Villa Woluwe",
      desc: "Contemporary architect-designed villa with smart home features and wellness area",
      type: PropertyType.villa,
      beds: 5,
      baths: 3,
      surface: 280,
      year: 2018,
      amenities: ["smart_home", "wellness", "garden", "double_garage", "solar", "terrace"],
    },
  ];

  const properties = [];
  for (let i = 0; i < propertyData.length; i++) {
    const pd = propertyData[i];
    const ownerIndex = i % owners.length;
    const userOwner = i % 3 === 0 ? adminUser : normalUser;

    const property = await prisma.property.create({
      data: {
        title: pd.title,
        description: pd.desc,
        addressId: addresses[i].id,
        ownerPersonId: owners[ownerIndex].id,
        userId: userOwner.id,
        propertyType: pd.type,
        bedrooms: pd.beds,
        bathrooms: pd.baths,
        surfaceArea: pd.surface,
        yearBuilt: pd.year,
        amenitiesList: pd.amenities,
      },
    });
    properties.push(property);
  }

  console.log(`✓ Created ${properties.length} properties`);

  // ============================================================================
  // 4. Create Payment Terms
  // ============================================================================
  console.log("Creating payment terms...");

  // Realistic Brussels pricing in EUR
  const paymentTermsData = [
    // Studios - mix of sales and rentals
    { type: PaymentTermType.periodic, amount: 850, period: "monthly" }, // Studio EU rent
    { type: PaymentTermType.onetime, amount: 185000 }, // Studio Ixelles sale
    { type: PaymentTermType.periodic, amount: 650, period: "monthly" }, // Studio Saint-Gilles rent
    { type: PaymentTermType.onetime, amount: 210000 }, // Studio Schaerbeek sale
    { type: PaymentTermType.periodic, amount: 950, period: "monthly" }, // Studio Downtown rent

    // Apartments - sales and rentals
    { type: PaymentTermType.onetime, amount: 395000 }, // 2BR EU Quarter sale
    { type: PaymentTermType.periodic, amount: 1100, period: "monthly" }, // 1BR Ixelles rent
    { type: PaymentTermType.onetime, amount: 585000 }, // 3BR Saint-Gilles sale
    { type: PaymentTermType.periodic, amount: 1350, period: "monthly" }, // 2BR Schaerbeek rent
    { type: PaymentTermType.onetime, amount: 495000 }, // Penthouse Uccle sale
    { type: PaymentTermType.periodic, amount: 950, period: "monthly" }, // 1BR Woluwe rent
    { type: PaymentTermType.onetime, amount: 298000 }, // 2BR Anderlecht sale
    { type: PaymentTermType.periodic, amount: 1450, period: "monthly" }, // Art Deco Forest rent
    { type: PaymentTermType.onetime, amount: 245000 }, // 1BR Molenbeek sale
    { type: PaymentTermType.periodic, amount: 1850, period: "monthly" }, // 3BR Downtown rent
    { type: PaymentTermType.onetime, amount: 425000 }, // Duplex Ixelles sale
    { type: PaymentTermType.periodic, amount: 1250, period: "monthly" }, // Corner EU Quarter rent

    // Houses - mostly sales with some high-end rentals
    { type: PaymentTermType.onetime, amount: 685000 }, // Townhouse Uccle sale
    { type: PaymentTermType.onetime, amount: 795000 }, // Family House Woluwe sale
    { type: PaymentTermType.periodic, amount: 2200, period: "monthly" }, // Renovated Forest rent
    { type: PaymentTermType.onetime, amount: 745000 }, // Period House Saint-Gilles sale
    { type: PaymentTermType.onetime, amount: 625000 }, // Modern Schaerbeek sale
    { type: PaymentTermType.periodic, amount: 1800, period: "monthly" }, // Corner Anderlecht rent

    // Villas - high-end sales
    { type: PaymentTermType.onetime, amount: 1850000 }, // Luxury Villa Uccle sale
    { type: PaymentTermType.onetime, amount: 1450000 }, // Modern Villa Woluwe sale
  ];

  const paymentTerms = [];
  for (let i = 0; i < paymentTermsData.length; i++) {
    const ptd = paymentTermsData[i];
    let paymentTerm;

    if (ptd.type === PaymentTermType.onetime) {
      paymentTerm = await prisma.paymentTerms.create({
        data: {
          termType: PaymentTermType.onetime,
          currency: "EUR",
          onetimePayment: {
            create: {
              amount: ptd.amount,
            },
          },
        },
      });
    } else {
      paymentTerm = await prisma.paymentTerms.create({
        data: {
          termType: PaymentTermType.periodic,
          currency: "EUR",
          periodicPayment: {
            create: {
              amountPerPeriod: ptd.amount,
              periodType: ptd.period,
            },
          },
        },
      });
    }
    paymentTerms.push(paymentTerm);
  }

  console.log(`✓ Created ${paymentTerms.length} payment terms`);

  // ============================================================================
  // 5. Create Listings
  // ============================================================================
  // 5. Create Listings
  // ============================================================================
  console.log("Creating listings...");

  const listingTypes = [
    ListingType.rental, // Studio EU rent
    ListingType.sale, // Studio Ixelles sale
    ListingType.rental, // Studio Saint-Gilles rent
    ListingType.sale, // Studio Schaerbeek sale
    ListingType.rental, // Studio Downtown rent
    ListingType.sale, // 2BR EU Quarter sale
    ListingType.rental, // 1BR Ixelles rent
    ListingType.sale, // 3BR Saint-Gilles sale
    ListingType.rental, // 2BR Schaerbeek rent
    ListingType.sale, // Penthouse Uccle sale
    ListingType.rental, // 1BR Woluwe rent
    ListingType.sale, // 2BR Anderlecht sale
    ListingType.rental, // Art Deco Forest rent
    ListingType.sale, // 1BR Molenbeek sale
    ListingType.rental, // 3BR Downtown rent
    ListingType.sale, // Duplex Ixelles sale
    ListingType.rental, // Corner EU Quarter rent
    ListingType.sale, // Townhouse Uccle sale
    ListingType.sale, // Family House Woluwe sale
    ListingType.rental, // Renovated Forest rent
    ListingType.sale, // Period House Saint-Gilles sale
    ListingType.sale, // Modern Schaerbeek sale
    ListingType.rental, // Corner Anderlecht rent
    ListingType.sale, // Luxury Villa Uccle sale
    ListingType.sale, // Modern Villa Woluwe sale
  ];

  const listings = [];
  for (let i = 0; i < properties.length; i++) {
    const creator = i % 4 === 0 ? adminUser : normalUser;

    const listing = await prisma.listing.create({
      data: {
        type: listingTypes[i],
        status: ListingStatus.published,
        propertyId: properties[i].id,
        createdBy: creator.id,
        paymentTermsId: paymentTerms[i].id,
        publishedAt: new Date(),
      },
    });
    listings.push(listing);
  }

  console.log(`✓ Created ${listings.length} listings`);

  console.log("\n✓ Real estate data seeded successfully");
  console.log(`  • ${addresses.length} Addresses in Brussels (with geo-coordinates)`);
  console.log(`  • ${owners.length} Property Owners`);
  console.log(`  • ${properties.length} Properties (studios, apartments, houses, villas)`);
  console.log(`  • ${paymentTerms.length} Payment Terms (EUR currency)`);
  console.log(
    `  • ${listings.length} Listings (${listingTypes.filter((t) => t === ListingType.sale).length} sales, ${listingTypes.filter((t) => t === ListingType.rental).length} rentals)`,
  );
}
