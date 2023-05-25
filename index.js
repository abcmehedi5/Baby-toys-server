const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.13ytubh.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    const db = client.db("baby-toys");
    const toysCollection = db.collection("toys");
    app.get("/", (req, res) => {
      res.send("baby toys running");
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // get toys with category
    app.get("/toys/:category", async (req, res) => {
      const categorys = req.params.category;
      try {
        if (categorys == "alltoys") {
          const result = await toysCollection.find().toArray();
          return res.send(result);
        }
        const result = await toysCollection
          .find({ subCategory: categorys })
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // get all toys
    app.get("/allToys", async (req, res) => {
      try {
        const result = await toysCollection.find().limit(20).toArray();
        return res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // post all toys
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      try {
        const result = await toysCollection.insertOne(toy);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // my toys get
    app.get("/myToys", async (req, res) => {
      const sort = req.query.sort;
      const email = req.query.email;
      const toys = { sellerEmail: email };
      try {
        if (sort == "asc") {
          const ascending_results = await toysCollection
            .find(toys)
            .sort("price", 1)
            .toArray();
          return res.send(ascending_results);
        }
        if (sort == "desc") {
          const descending_results = await toysCollection
            .find(toys)
            .sort("price", -1)
            .toArray();
          return res.send(descending_results);
        }
        const result = await toysCollection.find(toys).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // my delete
    app.get("/deleteToy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const toy = { _id: new ObjectId(id) };
      try {
        const result = await toysCollection.deleteOne(toy);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    });

    // single toy data
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const toy = { _id: new ObjectId(id) };
      try {
        const result = await toysCollection.findOne(toy);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: true, message: error });
      }
    });

    // update toys
    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const { price, availableQuantity, detailDescription } = req.body;
        const result = await toysCollection.updateOne(query, {
          $set: { price, availableQuantity, detailDescription },
        });
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
