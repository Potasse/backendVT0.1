const express = require('express');
const mongoose = require('mongoose');

const path = require("path");


//fonction qui verifie sil est connecté 
function isLoggedIn (req, res, next) {

   req.user ? next() : res.sendStatus(401);

}

//Parser Data
const bodyParser = require('body-parser')
const session = require('express-session');

//Amorçage
const cors = require('cors');


passport = require("passport");
LocalStrategy = require("passport-local").Strategy;
passportLocalMongoose = require("passport-local-mongoose");

require('dotenv').config();
const db = process.env.mongoURI;
 
mongoose
.connect(db, { useNewUrlParser: true, useUnifiedTopology: true } )
.then(() => console.log('Connected BD'))
.catch(err => console.log(err));

//Import des modeles
const User = require('./backend/models/User');
const Chat = require("./backend/models/Chat");
const Addevent = require('./backend/models/Addevent');




//Cloudinary upload file
const cloudinary = require("./backend/utils/cloudinary");
const upload = require("./backend/utils/multer");
const Usercl = require("./backend/models/Usercl");




require('./passport-setup');
const app = express();


// ajout de socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);


//TEST INSERTION ROUTER
const studentRoute = require('./routes/student.route')



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  name: 'session-id',
  secret: '123-456-789',
  saveUninitialized: false,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());


//ENDPOINT
app.use(cors({
    origin: 'http://localhost:3000'
}));

//ENDPOINT WITH ROUTER
app.use('/students', studentRoute)

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.post('/signup', async (req, res, next) => {

    const account = await User.findOne({username: req.body.username})

    if(account != null ){

    
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: false,
              status: 'username exist!',
            });
            
           
           
           
      
  }else { 

  User.register(new User({
      username: req.body.username,
      nomcomplet: req.body.nomcomplet,
      email: req.body.email,
      numero: req.body.numero

    }),
    req.body.password, (err, user) => {
      
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          err: err
        });
      } else{

        passport.authenticate('local')(req, res, () => {
          User.findOne({
            username: req.body.username
          }, (err, person) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              status: 'Registration Successful!',
            });
          });
        })

      }
    })
  }
});

app.post('/saveevent', (req, res ) => {

          const newEvent = new Addevent({

            title: req.body.title,
            typeevent: req.body.typeevent,
            telephone: req.body.telephone,
            country: req.body.country,
            city: req.body.city,

            longitude: req.body.longitude,
            latitude: req.body.latitude,
            adress: req.body.adress,
            adress2: req.body.adress2,

            dateevent: req.body.dateevent,
            heureevent: req.body.heureevent,
            usernameevent: req.body.usernameevent,
            
            imageUrl: req.body.imageUrl


          });
          
          newEvent.save({

           

          }, (err, person) => {

            if (err) {
      
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                err: err
              });
            }else {

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                success: true,
                status: 'Register OK'
              });
              
            }
          })

});



app.post('/upload', upload.single("image"), async (req, res) => {

  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    // Create new user
    let user = new Usercl({
      name: req.body.name,
      profile_img: result.secure_url,
      cloudinary_id: result.public_id,
    });
    // save user details in mongodb
    await user.save();
    res.status(200)
      .send({
        user
      });
  } catch (err) {
    console.log(err);
  }
});

app.post('/login', passport.authenticate('local'), (req, res) => {

  User.findOne({
    username: req.body.username
  }, (err, person) => {

    if (err) {
      
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
    }else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        status: 'You are successfully logged in!'
      });
    }
  })

});

app.post('/logout', (req, res, next) => {
  
  if (req.session) {
    req.logout();
    
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.clearCookie('session-id');
        res.json({
          message: 'You are successfully logged out!'
        });
      }
    });
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

//GET LIST USER
app.get('/usersList', (req, res, next) => {

  User.find({}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    res.send(userMap);  
  });

})

//GET LIST EVENT FOR THE TRIE
app.get('/getevenlist', (req, res, next) => {


  if( req.query.event == 0) {

    Addevent.find({}, function(err, docs) {

      if (!err) { 
          res.send(docs);
      }
      else {
          throw err;
      }
    });
}

else if(req.query.event == 1){

  console.log("bonjour")

 
  Addevent.find({ }).sort({ dateevent : -1}).exec( function(err, docs){ 

      if (!err) { 
        res.send(docs);
    }
    else {
        throw err;
    }
  });


}


})


//GET LIST EVENT SAMPLE
app.get('/GetevenlistMap', (req, res, next) => {

  Addevent.find({}, function(err, docs) {

    if (!err) { 
        res.send(docs);
    }
    else {
        throw err;
    }
  });
 

})

//GET EVEN BY ID 
app.get('/getEvenbyId' , (req, res) => {

  let id = req.query.id;

  Addevent.findById(id, function (err, docs) {

    if (!err) { 

      res.json(docs);

    }

    else {
        throw err;
    }

  });

});

//GET USER BY ID
 
app.get('/getUserbyId' , (req, res) => {

        let id = req.query.id;

        User.findById(id, function (err, docs) {

          if (!err) { 

            res.json(docs);

          }

          else {
              throw err;
          }


        });

});

//Find one User
app.get('/userfindone',   (req, res, next) => {

  const username = req.query.username;
  console.log("bonjour");
  
  User.findOne({
    username: username
  }, (err, person) => {

   
    if (err) {
      
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
    }else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(person);

    }
  })

})

//GET EVENT BY USERNAME FIND ALL

app.get('/EventUserFindAll',   (req, res, next) => {

  const username = req.query.usernameevent;
  
  Addevent.find({

    usernameevent: username

  }, (err, person) => {

    if (err) {     
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
    }else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(person);
    }
  })
})


//GET EVENT BY USERNAME FIND ONE

app.get('/EventUserFindOne',   (req, res, next) => {

  const username = req.query.usernameevent;
  
  Addevent.findOne({

    usernameevent: username

  }, (err, person) => {

    if (err) {     
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        err: err
      });
    }else {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(person);
    }
  })
})

//GOOGLE APP-GET DEBUT
app.get('/loginwithgoogle', (req, res) => {

  res.send('<a href="/auth/google"> Authentification with google </a>');

});

app.get('/protected', isLoggedIn, (req, res) => {

  // res.send(`hello  ${ req.user.displayName } `);

  // if( req.user == undefined ){

  //   res.send(true);

  // }
  res.redirect('http://localhost:3000/redirect');


  //req.user.displayName represente la valeur du nom de l'utilisateur 

});

app.get('/auth/google', 

  passport.authenticate('google', { scope: ['email', 'profile']})
);

app.get('/google/callback', 

  passport.authenticate('google', { 

    successRedirect:'/protected', 
    failureRedirect:'/auth/failure',

  })
);

app.get('/auth/failure',(req, res) => {

    res.send('something went wrong');
});

app.get('/logoutGoogle',(req, res) => {

  req.logout();
  res.send('Good Bye');

});

// Get Single User
app.get('/edit-profil', (req, res) => {

  User.findOne({username:req.query.username}, (error, data) => {

    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })

})

// UPDATE User
app.put('/update-profil', (req, res, next) => {

  const filter = { username: req.body.username };
  const updatemail = { email: req.body.email, username: req.body.usernamenew, nomcomplet: req.body.nomcomplet};


  User.findOneAndUpdate( filter, updatemail, (error, data) => {

    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })

}) 

// Get Recent 
app.get('/GetRecentEvent', (res) => {

  const date = req.body.dateevent;
  const heure = req.body.heure;

  Addevent.find({}, function(err, docs) {

    if (!err) { 
        res.send(docs);
    }
    else {
        throw err;
    }
});

})

//Delete One

app.delete('/deleteOne', (req, res) => {

  const id = req.query.id;

   Addevent.deleteOne({ _id: id },

      (err) => {

      if (err) {   
          
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          message: 'Echec Delete'
        });

      }else {
  
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          message: 'Succes Delete'
        });
      }
    })

})


if(process.env.NODE_ENV === "production"){

  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
    
});

}else {

  app.get("/", (req, res) => {

    res.send("Api running")

  })
}

const port = 5000;

app.listen(port, () => {
  console.log(`Example app listening on ` + port )
})

