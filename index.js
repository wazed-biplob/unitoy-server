const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dp2hutp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const toyCollection = client.db("unitoy").collection("toydata");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // const results = await MyModel.find({ $text: { $search: "text

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("UniToy Server is Running Ok.");
});

app.get("/toydata", async (req, res) => {
  let query = {};
  if (req.query?.email && req.query?.sort) {
    let cursor;

    if (req.query.sort == "true") {
      cursor = toyCollection.aggregate(
        [{ $match: { sellerEmail: req.query.email } }, { $sort: { price: 1 } }],
        {
          collation: {
            locale: "en_US",
            numericOrdering: true,
          },
        }
      );
    } else {
      cursor = toyCollection.aggregate(
        [
          { $match: { sellerEmail: req.query.email } },
          { $sort: { price: -1 } },
        ],
        {
          collation: {
            locale: "en_US",
            numericOrdering: true,
          },
        }
      );
    }
    const result = await cursor.toArray();
    res.send(result);
  } else if (req.query?.email) {
    query = { sellerEmail: req.query.email };
    const result = await toyCollection.find(query).toArray();
    res.send(result);
  } else if (req.query?.search) {
    console.log(req.query.search);

    const query = { toyName: req.query.search };

    const cursor = toyCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } else {
    const limit = parseInt(req.query?.limit);
    const cursor = toyCollection.find().limit(limit);
    const result = await cursor.toArray();
    res.send(result);
  }
});

app.get("/singletoy/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await toyCollection.findOne(query);
  res.send(result);
});

app.post("/toydata", async (req, res) => {
  const addedToy = req.body;

  const result = await toyCollection.insertOne(addedToy);
  res.send(result);
});

app.patch("/singletoy/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const updatedToy = req.body;

  const updatedDoc = {
    $set: updatedToy,
  };
  const result = await toyCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

app.delete("/singletoy/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await toyCollection.deleteOne(query);
  res.send(result);
});

app.listen(port, () => {
  console.log(`running at port ${port}`);
});
