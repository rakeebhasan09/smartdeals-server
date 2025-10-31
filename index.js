const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

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
		// All Products
		app.get("/products", async (req, res) => {
			// const projectFields = { title: 1, price_min: 1, price_max: 1, image: 1};
			// const cursor = productsCollection.find().project(projectFields);
			const email = req.query.email;
			const query = {};
			if (email) {
				query.email = email;
			}
			const cursor = productsCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		// Single Product By ID
		app.get("/products/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await productsCollection.findOne(query);
			res.send(result);
		});

		// Add New Product
		app.post("/products", async (req, res) => {
			const newProduct = req.body;
			const result = await productsCollection.insertOne(newProduct);
			res.send(result);
		});

		// Update Product
		app.patch("/products/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const updateInfo = req.body;
			const update = {
				$set: {
					title: updateInfo.title,
				},
			};
			const result = await productsCollection.updateOne(query, update);
			res.send(result);
		});

		// Delete Product
		app.delete("/products/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await productsCollection.deleteOne(query);
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
