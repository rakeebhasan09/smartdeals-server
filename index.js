const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// SmartDealsUser
// V640KZxnQX5kkfNX

const uri =
	"mongodb+srv://SmartDealsUser:V640KZxnQX5kkfNX@cluster0.x65kkeb.mongodb.net/?appName=Cluster0";

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
