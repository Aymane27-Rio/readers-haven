import request from "supertest";
import app from "../testServer.js";

jest.setTimeout(20000); 

describe("Auth Routes", () => {
  let token = "";

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("should log in existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});