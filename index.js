const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// SmartDealsUser
// V640KZxnQX5kkfNX

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x65kkeb.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

app.get("/", (req, res) => {
	res.send("SmartDeals Shop is open.");
});

async function run() {
	try {
		await client.connect();
		const database = client.db("Smart_Deals_db");
		const productsCollection = database.collection("products");

		// Products Related API's
		app.post("/products", async (req, res) => {
			const newProduct = req.body;
			const result = await productsCollection.insertOne(newProduct);
			res.send(result);
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`SmartDeals server is running on port ${port}`);
});
