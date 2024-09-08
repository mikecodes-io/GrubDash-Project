const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//---------validators---------
function validators(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  //deliverTo validator
  if (!deliverTo || typeof deliverTo !== "string") {
    return next({
      message: "Order must include a deliverTo",
      status: 400,
    });
  }
  //mobileNumber validator
  if (!mobileNumber || typeof mobileNumber !== "string") {
    return next({
      message: "Order must include a mobileNumber",
      status: 400,
    });
  }
  //dishes validator
  if (!dishes || !Array.isArray(dishes) || dishes.length < 1) {
    return next({
      message: "Order must include at least one dish",
      status: 400,
    });
  }
  //dishes quantity validator
  dishes.forEach((dish, index) => {
    if (
      dish.quantity === undefined ||
      dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity)
    ) {
      return next({
        message: `dish ${index} must have a quantity that is an integer greater than 0`,
        status: 400,
      });
    }
  });

  next();
}

//delete method validator
// function isPending(req, res, next) {
//     const { data: status } = req.body;

//     if (!status || status !== "pending") {
//         return next({
//             message:"An order cannot be deleted unless it is pending.",
//             status: 400
//         })
//     }
//     next();
// }

//update method validator
function updateValidator(req, res, next) {
  const { data: { id, status } = {} } = req.body;

  if (!status || typeof status !== "string") {
    return next({
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
      status: 400,
    });
  } else if (status === "delivered" || status === "invalid") {
    return next({
      message: "A delivered order status cannot be changed",
      status: 400,
    });
  }
  next();
}

// create orders handler
function create(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = ({} = req.body);

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//list orders handler
function list(req, res, next) {
  res.status(200).json({ data: orders });
}

//read single order handler
function read(req, res, next) {
  const { orderId } = req.params;
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return next({
      message: "order was not found",
      status: 404,
    });
  }
  res.status(200).json({ data: order });
}

//update single order handler
function update(req, res, next) {
  const { orderId } = req.params;
  const order = orders.find((o) => o.id === orderId);

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (!order) {
    return next({
      message: "order was not found",
      status: 404,
    });
  }

  if (id && id !== orderId) {
    return next({
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      status: 400,
    });
  }

  if (!deliverTo || !mobileNumber || !status || !dishes) {
    return next({
      message: "All fields required",
      status: 404,
    });
  }

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.status(200).json({ data: order });
}
//delete single order handler
function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((o) => o.id === orderId);
  const order = orders[index];

  if (index === -1) {
    return next({
      message: `order id ${orderId} was not found`,
      status: 404,
    });
  }  
  
  if (!order.status || order.status !== "pending") {
    return next({
      message: "An order cannot be deleted unless it is pending.",
      status: 400,
    });
  }
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [validators, create],
  list,
  read,
  destroy,
  update: [validators, updateValidator, update],
};
