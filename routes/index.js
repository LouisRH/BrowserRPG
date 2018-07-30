const express = require("express");
const gameRoutes = require("./game");

const index = (req, res) => {
    res.sendFile("index.html", {root: "public/html/"});
    
    return;
}

const constructorMethod = app => {
    app.get("/", index);
    app.use("/game", gameRoutes);
  };
  
  module.exports = constructorMethod;