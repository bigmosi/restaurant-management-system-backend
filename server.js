const express = require('express');
const mongoose = require('mongoose');
const debug = require('debug')('server');
const chalk = require('chalk');
const Restaurant = require('./models/restaurantModel');
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    const transformedRestaurants = restaurants.map((restaurant) => {
      const { _id, ...rest } = restaurant.toObject();
      return {
        id: _id.toString(),
        ...rest,
      };
    });
    console.log(transformedRestaurants);
    res.status(200).json(transformedRestaurants)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/restaurants/:id', async (req, res) => {
  console.log(req.params)
  try {
    const { id } = req.params;
    let restaurant;

    if (id.length === 24) {
      restaurant = await Restaurant.findById(id);
    } else {
      restaurant = await Restaurant.findOne({ _id: id });
    }

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory where uploaded files should be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename for the stored file
  },
});

// Create multer instance with storage configuration
const upload = multer({ storage });

// POST route for creating a restaurant
app.post('/restaurants', upload.single('image'), async (req, res) => {
  try {
    const { name, cuisineType, location } = req.body;
    const imageFile = req.file;

    // Create a new restaurant instance
    const restaurant = new Restaurant({
      name,
      cuisineType,
      location,
      image: imageFile.filename, // Store the filename in the 'image' field
    });

    // Save the restaurant to the database
    const newRestaurant = await restaurant.save();

    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/restaurants/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cuisineType, location } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { name, cuisineType, location, image: imagePath },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ message: `Cannot find any restaurant with ID ${id}` });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

mongoose
  .connect('mongodb://localhost:27017/restaurantDB')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(8080, () => {
      debug(`Server is running on port ${chalk.green(8080)}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
