const express = require("express");
const redis = require("../redis");
const { Todo } = require("../mongo");
const router = express.Router();

/* GET todos listing. */
router.get("/", async (_, res) => {
  const todos = await Todo.find({});
  res.send(todos);
});

/* POST todo to listing. */
router.post("/", async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  });

  const addedTodosCounter = await redis.getAsync("added_todos") ?? 0; 

  await redis.setAsync("added_todos", parseInt(addedTodosCounter) + 1);

  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  req.todo = await Todo.findById(id);

  if (!req.todo) return res.sendStatus(404);

  next();
};

/* DELETE todo. */
singleRouter.delete("/", async (req, res) => {
  await req.todo.delete();
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get("/", async (req, res) => {
  res.json(req.todo);
});

/* PUT todo. */
singleRouter.put("/", async (req, res) => {
  const { text, done } = req.body;

  console.log(text);
  console.log(done);

  if (!text && done == undefined) {
    res.sendStatus(400);
    return;
  }

  req.todo.text = text ?? req.todo.text;
  req.todo.done = done ?? req.todo.done;

  await req.todo.save();

  res.json(req.todo);
});

router.use("/:id", findByIdMiddleware, singleRouter);

module.exports = router;
