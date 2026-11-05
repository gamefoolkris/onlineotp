const express = require("express");

let app = express();

app.use(express.static('./site/'));

app.listen(3030, () => {
  console.log("Server listening at http://localhost:3030");
});