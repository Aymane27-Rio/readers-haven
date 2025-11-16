import request from "supertest";
import app from "../testServer.js";

jest.setTimeout(20000); 

describe("Books Routes", () => {
  let token = "";
  let bookId = "";

  beforeAll(async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "BookUser", email: "book@example.com", password: "pass123" });

    token = registerRes.body.data.token;
  });

  it("should create a book", async () => {
    const res = await request(app)
      .post("/api/books")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Book",
        author: "Someone",
        description: "A good test",
        publishedYear: 2025
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty(["data", "_id"]);
    bookId = res.body.data._id;
  });

  it("should fetch all user books", async () => {
    const res = await request(app)
      .get("/api/books")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should delete a book", async () => {
    const res = await request(app)
      .delete(`/api/books/${bookId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});