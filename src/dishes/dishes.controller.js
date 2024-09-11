const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// ----------Validators----------
// Checks if input contains a string for name
function validator(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    
    //name validator
    if (!name || typeof name !== 'string') {
        return next({
            message: "Dish must include a name",
            status: 400
        });
    }

    //description validator
    if (!description || typeof description !== 'string') {
        return next({
            message: "Dish must include a description",
            status: 400
        });
    }

    //price validator
    if (price === undefined || typeof price !== 'number' || price <= 0) {
        return next({
            message: "Dish must have a price that is an integer greater than 0",
            status: 400
        });
    }

    //image validator
    if (!image_url || typeof image_url !== 'string') {
        return next({
            message: "Dish must include an image_url",
            status: 400
        });
    }
    next();
}

// reviews if DishExist 
function dishExists (req, res, next) {
    const { dishId } = req.params;
    const dish = dishes.find((d) => d.id === dishId);

    if (!dish) {
        return next({
            message:"Dish was not found",
            status: 404
        })
    }
    res.locals.dish = dish
    next();
}


// Create Dishes Handler
function create(req, res, next) {
    // const { data: { name, description, price, image_url } } = {} = req.body;
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish})
}


// Read Single Dishes Handler
function read(req, res, next) {
    res.status(200).json({ data: res.locals.dish })
}

// Update Dishes Handler
function update(req, res, next) {
    const dishId = res.locals.dish
    const { data: {id, name, description, price, image_url} = {} } = req.body;

    if (id && id !== dishId.id) {
        return next({
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
            status: 400
        })
    }

    if (!name || !description || !price || !image_url) {
        return next({
            message: "All fields are required",
            status: 404
        })
    }

    dishId.name = name;
    dishId.description = description;
    dishId.price = price;
    dishId.image_url = image_url

    res.status(200).json({ data: res.locals.dish })
}



// List Dishes Handler
function list(req,res, next) {
    res.status(200).json({ data: dishes })
}

module.exports = {
    create: [validator, create],
    read: [dishExists, read],
    update: [dishExists, validator, update],
    list,
}