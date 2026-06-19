require("dotenv").config();
const { connectDB } = require("./db");

const defaultCampaigns = [
    {
        city: "mumbai",
        displayName: "Mumbai",
        active: true,
        template: "no_cost_emi",
        message: "Hi,\n\nNo Cost EMI is now available in {city}.\n\nFor any assistance or to know more, please visit your nearest store",
        updatedAt: new Date(),
    },
    {
        city: "hyderabad",
        displayName: "Hyderabad",
        active: true,
        template: "no_cost_emi",
        message: "Hi,\n\nNo Cost EMI is now available in {city}.\n\nFor any assistance or to know more, please visit your nearest store",
        updatedAt: new Date(),
    },
    {
        city: "bengaluru",
        displayName: "Bengaluru",
        active: true,
        template: "no_cost_emi",
        message: "Hi,\n\nNo Cost EMI is now available in {city}.\n\nFor any assistance or to know more, please visit your nearest store",
        updatedAt: new Date(),
    },
];

async function seed() {
    const db = await connectDB();
    const col = db.collection("campaigns");

    for (const campaign of defaultCampaigns) {
        await col.updateOne(
            { city: campaign.city },
            { $setOnInsert: campaign },
            { upsert: true }
        );
        console.log(`[Seed] Upserted: ${campaign.city}`);
    }

    console.log("[Seed] Done.");
    process.exit(0);
}

seed().catch((err) => {
    console.error("[Seed] Error:", err.message);
    process.exit(1);
});
