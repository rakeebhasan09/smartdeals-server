const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("SmartDeals Shop is open.");
});

app.listen(port, () => {
	console.log(`SmartDeals server is running on port ${port}`);
});
