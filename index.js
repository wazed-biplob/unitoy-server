const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("UniToy Server Running.");
});

app.listen(port, () => {
  console.log(`running at port ${port}`);
});
