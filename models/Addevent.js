const mongoose = require('mongoose');

const addeventschema = new mongoose.Schema(

    {
      title: String,
      typeevent: String,
      telephone: String,
      country: String,
      city: String,
      longitude: String,
      latitude: String,
      adress: String,
      adress2: String,
      dateevent: String,
      heureevent: String,
      usernameevent: String,
      like: String,
      imageUrl: String,
     
    },

);

module.exports = mongoose.model("Addevent", addeventschema )