const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;
app.use(cors())

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/restaurantDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define restaurant schema and model
const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisineType: String,
  location: String,
  imagePath: String,
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: './public/images',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// API routes for CRUD operations
app.use(express.json());

// Create a new restaurant
app.post('/api/restaurants', upload.single('image'), (req, res) => {
  const { name, cuisineType, location } = req.body;
  const imagePath = req.file ? req.file.filename : '';

  const restaurant = new Restaurant({ name, cuisineType, location, imagePath });
  restaurant.save((err, savedRestaurant) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create restaurant' });
    } else {
      res.status(201).json(savedRestaurant);
    }
  });
});

// Read all restaurants
app.get('/api/restaurants', (req, res) => {
  Restaurant.find({})
  .then((restaurants) => {
    res.json(restaurants);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve restaurants' });
  });

});

app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;

  // Check if id is undefined or not a valid ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid restaurant ID' });
  }

  Restaurant.findById(id)
    .then((restaurant) => {
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      res.json(restaurant);
    })
    .catch((error) => {
      console.error('Error fetching restaurant details', error);
      res.status(500).json({ error: 'Failed to fetch restaurant details' });
    });
});


// Update a restaurant
app.put('/api/restaurants/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, cuisineType, location } = req.body;
  const imagePath = req.file ? req.file.filename : '';

  Restaurant.findByIdAndUpdate(
    id,
    { name, cuisineType, location, imagePath },
    { new: true },
    (err, updatedRestaurant) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update restaurant' });
      } else if (!updatedRestaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
      } else {
        res.json(updatedRestaurant);
      }
    }
  );
});

// Delete a restaurant
app.delete('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  Restaurant.findByIdAndDelete(id, (err, deletedRestaurant) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete restaurant' });
    } else if (!deletedRestaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
    } else {
      res.sendStatus(204);
    }
  });
});

// Serve static files
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// const express = require('express');
// const app = express();
// const cors = require('cors');
// const port = 8080; // Choose the desired port number

// // Define  API routes here
// app.use(cors())

// app.get('/api/restaurants/:id', (req, res) => {
//   const { id } = req.params;

//   // Your logic to fetch the restaurant details based on the ID
//   // This can involve querying a database or any other data retrieval mechanism
//   // Replace this example code with your own implementation
//   const restaurant = getRestaurantDetails(id);

//   if (restaurant) {
//     res.json(restaurant);
//   } else {
//     res.status(404).json({ error: 'Restaurant not found' });
//   }
// })

// function getRestaurantDetails(id) {
//   // Query your database and return the restaurant details
//   // Return null or undefined if the restaurant is not found
//   const restaurants = [
//     { id: 1, name: 'Restaurant 1', cuisineType: 'Italian', location: 'City 1' },
//     { id: 2, name: 'Restaurant 2', cuisineType: 'Mexican', location: 'City 2' },
//   ];

//   return restaurants.find(restaurant => restaurant.id === Number(id));
// }




// app.get('/api/restaurants', (req, res) => {
//     // Implement your logic to retrieve restaurants from the database
//     const restaurants = [
//       {id: 1, name: 'Restaurant 1', cuisine: 'Italian', location: 'New York' },
//       {id: 2,  name: 'Restaurant 2', cuisine: 'Mexican', location: 'Los Angeles' },
//       // Add more restaurant objects as per your requirements
//     ];
    
//     res.json(restaurants);
//   });

 
// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


