/* eslint jest/expect-expect: 0 */

// const { describe, test, beforeEach, before, after } = require("node:test");
// const assert = require("node:assert")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { MONGODB_URL } = require("../utils/config") 
const app = require("../app")
const supertest = require("supertest")
const Blog = require("../models/blog") 
const User = require("../models/user") 

const api = supertest(app);

const initialBlogs = [
      {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
      },
      {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
      },
      {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
      },
      {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
      },
      {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
      },
      {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
      },
];




beforeAll(async () => {
  await mongoose.connect(MONGODB_URL);

  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("rootpassword", 10);
  const user = new User({username: "root", passwordHash});

  await user.save();
})

beforeEach(async () => {
  const user = await User.findOne({});

  const blogs = initialBlogs.map(blog => new Blog({
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    user: user._id.toString()
  }));

  await Blog.deleteMany({});
  await Blog.bulkSave(blogs);
});

describe("getting a blog from api", () => {
  test("blogs are returned as json", async () => { 
    await api.get("/api/blogs").expect(200).expect("Content-Type", /application\/json/);
  })

  test("there are 6 blogs", async () => {
    const response = await api.get("/api/blogs");
    expect(response._body).toHaveLength(6)
    // assert.strictEqual(response._body.length, 6)
  })

  test("blogs have id instead of _id", async () => {
    const response = await api.get("/api/blogs");
    const blogs = response.body;
    for(const blog of blogs) {
      expect(blog).toHaveProperty("id");
    }

    // blogs.forEach(blog => assert.strictEqual(Object.hasOwn(blog, "id"), true));
  })
})

describe("creation of a blog", () => {
  test("returns status 201 if created correctly and updates blogs on database", async () => {
    const response = await api.post("/api/login").send({ username: "root", password: "rootpassword" });

    const user = response.body;
    const blogToBeAdded = {
          title: "this is a test",
          author: "test author",
          url: "test url",
          likes: 5,
    }

    await api.post("/api/blogs").set("Authorization", "Bearer " + user.token).send(blogToBeAdded).expect(201).expect("Content-Type", /application\/json/);

    const getResponse = await api.get("/api/blogs");
    const blogs = getResponse.body;

    expect(blogs).toHaveLength(7)

    // assert.deepStrictEqual(blogs.length, 7);
  })


  test("returns status 400 if created without token", async () => {
    const blogToBeAdded = {
          title: "this is a test",
          author: "test author",
          url: "test url",
          likes: 5,
    }

    const response = await api.post("/api/blogs").send(blogToBeAdded).expect(400).expect("Content-Type", /application\/json/);

    const body = response.body;

    expect(body).toHaveProperty("error")
    expect(body.error).toEqual("User not found!")
    
    // assert.strictEqual(Object.prototype.hasOwnProperty.call(body, "error"), true);
    // assert.strictEqual(body.error, "User not found!"); 

    const getResponse = await api.get("/api/blogs");

    const blogs = getResponse.body;

    expect(blogs).toHaveLength(6)
    // assert.deepStrictEqual(blogs.length, 6);
  })

  test("blog likes default to 0 if not specified", async () => {
    const response = await api.post("/api/login").send({ username: "root", password: "rootpassword" });
    const user = response.body;

    const blogToBeAdded = {
          title: "this is a test",
          author: "test author",
          url: "test url",
    }

    await api.post("/api/blogs").set("Authorization", "Bearer " + user.token).send(blogToBeAdded).expect(201).expect("Content-Type", /application\/json/);
    const getResponse = await api.get("/api/blogs");

    const blogs = getResponse.body;
    const blog = blogs.filter(blog => blog.title === "this is a test")[0]

    expect(blog.likes).toEqual(0)
    
    // assert.strictEqual(blog.likes, 0);
  })

  test("api returns 400 code if blog post doesn't have a title", async () => {
    const response = await api.post("/api/login").send({ username: "root", password: "rootpassword" });
    const user = response.body;

    const blogToBeAdded = {
          author: "test author",
          url: "test url",
          likes: 5,
    }

    await api.post("/api/blogs").set("Authorization", "Bearer " + user.token).send(blogToBeAdded).expect(400);
  })

  test("api returns 400 code if blog post doesn't have a author", async () => {
    const response = await api.post("/api/login").send({ username: "root", password: "rootpassword" });
    const user = response.body;
    const blogToBeAdded = {
          title: "this is a test",
          url: "test url",
          likes: 5,
    }

    await api.post("/api/blogs").set("Authorization", "Bearer " + user.token).send(blogToBeAdded).expect(400);
  })

})

describe("deletion of a blog", () => {
  test("succeeds with status 200 if id is valid", async () => {
    const response = await api.post("/api/login").send({ username: "root", password: "rootpassword" });
    const user = response.body;

    const blog = await Blog.findOne();
    const blogId = blog.toJSON().id

    await api.delete("/api/blogs/" + blogId).set("Authorization", "Bearer " + user.token).expect(200);
    const blogs = await Blog.find({}); 

    expect(blogs).toHaveLength(5);
    
    // assert.strictEqual(blogs.length, 5);
  })
})

describe("update of a blog", () => {
  test("succeeds with status 200 if id is valid", async () => {
    const response = await api.post("/api/login").send({ username: "root", password: "rootpassword" });
    const user = response.body;

    const blog = await Blog.findOne();
    const blogId = blog.toJSON().id;
    const numberOfLikes = 42059;

    await api.put("/api/blogs/" + blogId).set("Authorization", "Bearer " + user.token).send({ likes: numberOfLikes }).expect(200);
    const updatedBlog = await Blog.findById(blogId);
    
    expect(updatedBlog.likes).toEqual(numberOfLikes)
    // assert.strictEqual(updatedBlog.likes, numberOfLikes);
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
