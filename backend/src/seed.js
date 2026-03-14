/**
 * Seed script for NSM-MVP
 * Usage: node src/seed.js
 * Creates demo categories, one resident, two providers, two requests, and quotes.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Category = require("./models/Category");
const ServiceRequest = require("./models/ServiceRequest");
const Quote = require("./models/Quote");

const { USER_ROLES, REQUEST_STATUS, QUOTE_STATUS } = require("./utils/constants");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not set in .env");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  // ---------- clear existing demo data ----------
  await Promise.all([
    User.deleteMany({ email: { $in: ["alice@demo.com", "bob@demo.com", "carol@demo.com"] } }),
    Category.deleteMany({ name: { $in: ["Home Repair", "Cleaning", "Electrical", "Plumbing"] } }),
  ]);

  // ---------- categories ----------
  const [homeRepair, cleaning, electrical, plumbing] = await Category.insertMany([
    { name: "Home Repair", description: "General maintenance and fixing" },
    { name: "Cleaning", description: "House and office cleaning services" },
    { name: "Electrical", description: "Wiring, sockets, lighting" },
    { name: "Plumbing", description: "Pipes, leaks, drains" },
  ]);
  console.log("Seeded 4 categories");

  // ---------- users ----------
  const HASH = await bcrypt.hash("Password123", 10);

  const [alice, bob, carol] = await User.insertMany([
    { name: "Alice Resident", email: "alice@demo.com", passwordHash: HASH, role: USER_ROLES.RESIDENT },
    { name: "Bob Provider", email: "bob@demo.com", passwordHash: HASH, role: USER_ROLES.PROVIDER },
    { name: "Carol Provider", email: "carol@demo.com", passwordHash: HASH, role: USER_ROLES.PROVIDER },
  ]);
  console.log("Seeded 3 users  (alice=resident, bob=provider, carol=provider)");
  console.log("  All passwords: Password123");

  // ---------- requests ----------
  const [req1, req2] = await ServiceRequest.insertMany([
    {
      residentId: alice._id,
      categoryId: plumbing._id,
      title: "Fix leaking kitchen sink",
      description: "The kitchen sink has been dripping for a week. Needs urgent repair before it damages the cabinet.",
      location: "123 Main St, Downtown",
      status: REQUEST_STATUS.OPEN,
    },
    {
      residentId: alice._id,
      categoryId: cleaning._id,
      title: "Deep clean after house party",
      description: "Need a full deep clean of a 4-bedroom house after a large gathering. Includes all bathrooms.",
      location: "456 Park Ave, Uptown",
      status: REQUEST_STATUS.OPEN,
    },
  ]);
  console.log("Seeded 2 service requests");

  // ---------- quotes ----------
  await Quote.insertMany([
    {
      requestId: req1._id,
      providerId: bob._id,
      price: 120,
      daysToComplete: 1,
      message: "I can come same day and fix it in under 2 hours.",
      status: QUOTE_STATUS.PENDING,
    },
    {
      requestId: req1._id,
      providerId: carol._id,
      price: 95,
      daysToComplete: 2,
      message: "Best price guaranteed. Available tomorrow morning.",
      status: QUOTE_STATUS.PENDING,
    },
    {
      requestId: req2._id,
      providerId: bob._id,
      price: 250,
      daysToComplete: 1,
      message: "Full team available weekends. All supplies included.",
      status: QUOTE_STATUS.PENDING,
    },
  ]);

  // Advance request 1 status to QUOTED since quotes were submitted
  await ServiceRequest.updateOne({ _id: req1._id }, { $set: { status: REQUEST_STATUS.QUOTED } });
  await ServiceRequest.updateOne({ _id: req2._id }, { $set: { status: REQUEST_STATUS.QUOTED } });

  console.log("Seeded 3 quotes (2 on req1, 1 on req2); both requests now QUOTED");

  console.log("\n===== Demo Accounts =====");
  console.log("  alice@demo.com   / Password123  (resident)");
  console.log("  bob@demo.com     / Password123  (provider)");
  console.log("  carol@demo.com   / Password123  (provider)");
  console.log("\n===== Workflow to try =====");
  console.log("  1. Login as alice -> view requests -> open 'Fix leaking kitchen sink'");
  console.log("  2. Accept one of the two pending quotes -> request becomes ASSIGNED");
  console.log("  3. Login as bob   -> My Quotes -> see own quote status");
  console.log("  4. Login as carol -> My Quotes -> see rejected quote");
  console.log("=========================\n");

  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
