const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connectDB() {
    if (db) return db;
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("tsc_campaigns");
    console.log("[MongoDB] Connected");
    return db;
}

module.exports = { connectDB };
