// 1. SETUP EXPRESS
const express = require('express');
const cors = require("cors");
require('dotenv').config()

// 1a. create the app
const app = express();
app.use(express.json())

// !! Enable CORS
app.use(cors());

const { ObjectId } = require('mongodb');
const MongoClient = require("mongodb").MongoClient;
const mongoUri = process.env.MONGO_URI;
const dbname = "recipes"; // CHANGE THIS TO YOUR ACTUAL DATABASE NAME

async function connect(uri, dbname) {
    let client = await MongoClient.connect(uri)
    let db = client.db(dbname);
    return db;
}

async function main() {
    let db = await connect(mongoUri, dbname);

    // Routes
    app.get("/", function (req, res) {
        res.json({
            message: "Hello World!",
        });
    });

    app.get("/recipes", async function (req, res) {
        try {
            const recipes = await db.collection("recipes").find().project({
                name: 1,
                cuisine: 1,
                tags: 1,
                prepTime: 1,
            }).toArray();

            res.json({ recipes });
        } catch (error) {
            console.error("Error fetching recipes:", error);
            res.status(500).json({ error: "Internal server error" });
        }

    });

    app.get("/recipes/:id", async (req, res) => {
        try {
            const id = req.params.id;

            // First, fetch the recipe
            const recipe = await db.collection("recipes").findOne(
                { _id: new ObjectId(id) },
                { projection: { _id: 0 } }
            )
            if (!recipe) {
                return res.status(404).json({ error: "Recipe not found" });
            }
            res.json(recipe);
        } catch (error) {
            console.error("Error fetching recipe:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

}
main();


// 3. START SERVER (Don't put any routes after this line)
app.listen(3000, function () {
    console.log("Server has started");
})
