const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

const data = require("./toyData.json");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://unitoy:S3oiPff2aQtd33VV@cluster0.dp2hutp.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toyCollection = client.db("unitoy").collection("toydata");
    app.get("/toydata", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };

        const result = await toyCollection.find(query).toArray();
        res.send(result);
      } else {
        const cursor = toyCollection.find();
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
      console.log(addedToy);
      const result = await toyCollection.insertOne(addedToy);
      res.send(result);
    });

    app.patch("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      console.log(id, filter);
      const updatedToy = req.body;
      console.log(updatedToy);
      const updatedDoc = {
        $set: updatedToy,
      };
      const result = await toyCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
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
  res.send("UniToy Server Running.");
});

app.listen(port, () => {
  console.log(`running at port ${port}`);
});
