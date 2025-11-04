const express = require("express");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const cors = require("cors");
const jwt = require("jsonwebtoken");
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

const serviceAccount = require("./smartdealsbyrakeeb-firebase-adminsdk.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// Middlewares
app.use(cors());
app.use(express.json());

const logger = (req, res, next) => {
	console.log("Inside logger");
	next();
};

// Verify Firebase Token
const verifyFireBaseToken = async (req, res, next) => {
	if (!req.headers.authorization) {
		// Do not allow to go
		return res.status(401).send({ message: "unauthorize access." });
	}

	const token = req.headers.authorization.split(" ")[1];
	if (!token) {
		return res.status(401).send({ message: "unauthorize access." });
	}

	// token okay, now is time to verify token
	try {
		const userInfo = await admin.auth().verifyIdToken(token);
		req.token_email = userInfo.email;
		next();
	} catch {
		console.log("Invalid Token");
		return res.status(401).send({ message: "unauthorize access." });
	}
};

// Verify JWT Token
const verifyJWTToken = (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		return res.status(401).send({ message: "Unauthorize Access Requist." });
	}

	const token = authorization.split(" ")[1];
	if (!token) {
		return res.status(401).send({ message: "Unauthorize Access Requist." });
	}

	// JWT token verification
	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res
				.status(401)
				.send({ message: "Unauthorize Access Requist." });
		}
		console.log("After decoded", decoded);
		req.token_email = decoded.email;
		next();
	});
};

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
		const bidsCollection = database.collection("bids");

		// JWT api's
		app.post("/getToken", (req, res) => {
			// const token = jwt.sign({ email: "rakeeb" }, "secreet", { expiresIn: "1h"});
			const loggedUser = req.body;
			const token = jwt.sign(loggedUser, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});
			res.send({ token: token });
		});

		// Products Related API's
		// All Products
		app.get("/products", verifyFireBaseToken, async (req, res) => {
			// const projectFields = { title: 1, price_min: 1, price_max: 1, image: 1};
			// const cursor = productsCollection.find().project(projectFields);
			const email = req.query.email;
			const query = {};
			if (email) {
				if (email !== req.token_email) {
					return res
						.status(403)
						.send({ message: "Forbidden Access." });
				}
				query.email = email;
			}
			const cursor = productsCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		// Get Recent Products
		app.get("/recent-products", async (req, res) => {
			const projectFields = {
				title: 1,
				price_min: 1,
				price_max: 1,
				image: 1,
			};
			const cursor = productsCollection
				.find()
				.project(projectFields)
				.sort({ created_at: -1 })
				.limit(6);
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
					price_min: updateInfo.price_min,
					price_max: updateInfo.price_max,
					email: updateInfo.email,
					category: updateInfo.category,
					image: updateInfo.image,
					location: updateInfo.location,
					seller_image: updateInfo.seller_image,
					seller_name: updateInfo.seller_name,
					condition: updateInfo.condition,
					usage: updateInfo.usage,
					description: updateInfo.description,
					seller_contact: updateInfo.seller_contact,
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

		// Bid's API's
		// Getting Bid's JWT token verification
		app.get("/bids", verifyJWTToken, async (req, res) => {
			const email = req.query.email;
			const query = {};
			if (email) {
				if (email !== req.token_email) {
					return res
						.status(403)
						.send({ message: "Access Forbidden." });
				}
				query.buyer_email = email;
			}

			const cursor = bidsCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		// Get Bid's using firebase token verification
		// app.get("/bids", logger, verifyFireBaseToken, async (req, res) => {
		// 	const email = req.query.email;
		// 	const query = {};
		// 	if (email) {
		// 		if (email !== req.token_email) {
		// 			return res
		// 				.status(403)
		// 				.send({ message: "Forbidden Access." });
		// 		}
		// 		query.buyer_email = email;
		// 	}
		// 	const cursor = bidsCollection.find(query);
		// 	const result = await cursor.toArray();
		// 	res.send(result);
		// });

		app.get("/bids/:id", async (req, res) => {
			const { id } = req.params;
			const query = { product: id };
			const result = await bidsCollection.find(query).toArray();
			res.send(result);
		});

		app.post("/bids", async (req, res) => {
			const newBid = req.body;
			const query = {
				product: newBid.product,
				buyer_email: newBid.buyer_email,
			};

			const existingBid = await bidsCollection.findOne(query);
			if (existingBid) {
				return res.status(400).send({ message: "Already bidded" });
			}

			const result = await bidsCollection.insertOne(newBid);
			res.send(result);
		});

		app.delete("/bids/:id", async (req, res) => {
			const { id } = req.params;
			const query = { _id: new ObjectId(id) };
			const result = await bidsCollection.deleteOne(query);
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
