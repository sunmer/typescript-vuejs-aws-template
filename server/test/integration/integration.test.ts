import * as HttpStatus from "http-status";
import * as jwt from "jwt-simple";
import { app, expect, request } from "./config/helpers";

describe("Tests of integration on router user", () => {

  const config = require("../../config/env/config")();
  const models = require("../../models");

  let id: number;
  let token: string;
  const userTest = {
    id: 100,
    name: "User Test",
    email: "user@test.com.br",
    password: "test@123"
  };

  const userDefault = {
    id: 1,
    name: "User Default",
    email: "user@defaul.com.br",
    password: "userdefault"
  };

  beforeEach((done) => {
    models
      .sequelize
      .sync()
      .then(() => {
        return models.Users
          .destroy({ where: {} })
          .then(() => models.Users.create(userDefault))
          .then((user) => {
            return models.Users
              .create(userTest)
              .then(() => {
                token =
                  jwt.encode({ id: user.id }, config.secret);
                done();
              });
          })
          .catch((error: Error) => console.error(error.message));
      });
  });

  describe("POST api/auth", () => {
    it("has to return a JWT token", (done) => {
      const credentials = {
        email: userDefault.email,
        password: userDefault.password
      };
      request(app)
        .post("/api/auth")
        .send(credentials)
        .end((error, res) => {
          expect(res.status).to.equal(HttpStatus.OK);
          expect(res.body.token).to.be.equal(token);
          done(error);
        });
    });

    it("fails to generate a JWT token", (done) => {
      const invalidCredential = {
        email: "email@invalid.com",
        password: "somepassword"
      };

      request(app)
        .post("/api/auth")
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .send(invalidCredential)
        .end((error, res) => {
          expect(res.status).to.equal(HttpStatus.UNAUTHORIZED);
          done(error);
        });
    });
  });

  describe("GET /api/users/:id", () => {
    it("Should be return user by id", (done) => {
      const userID = 1;
      request(app)
        .get(`/api/users/${userID}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .end((error, response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          done(error);
        });
    });
  });

  describe("GET /api/users", () => {
    it("Must return the json with all users", (done) => {
      request(app)
        .get("/api/users")
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .end((error, response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.payload).to.be.an("array");
          expect(response.body.payload[0].name)
            .to.be.equal(userDefault.name);
          expect(response.body.payload[0]
            .email).to.be.equal(userDefault.email);
          done(error);
        });

    });
  });

  describe("GET /api/users/:id", () => {
    it("Must return user by id", (done) => {
      request(app)
        .get(`/api/users/${userDefault.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .end((error, response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.payload.id)
            .to.be.equal(userDefault.id);
          expect(response.body.payload).to.have.all.keys([
            "id", "name", "email", "password"
          ]);
          id = response.body.payload.id;
          done(error);
        });
    });
  });

  describe("POST /api/users", () => {
    it("Must create user", (done) => {
      const user = {
        id: 2,
        name: "Second user test",
        email: "seconuser@email.com",
        password: "seconduserpassword"
      };
      request(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .send(user)
        .end((error, response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          expect(response.body.payload.id).to.be.equal(user.id);
          expect(response.body.payload.name).to.be.equal(user.name);
          expect(response.body.payload.email).to.be.equal(user.email);
          done(error);
        });
    });
  });

  describe("PUT /api/users/:id", () => {
    it("Must update user by id", (done) => {

      const user = {
        id: 1,
        name: "Test 1"
      };
      request(app)
        .put(`/api/users/${user.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .send(user)
        .end((error, response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          done(error);
        });
    });

  });


  describe("DELETE /api/users/:id", () => {
    it("Must delete user by id", (done) => {
      const user = {
        id: 1,
        name: "Test"
      };
      request(app)
        .delete(`/api/users/${user.id}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `JWT ${token}`)
        .end((error, response) => {
          expect(response.status).to.equal(HttpStatus.OK);
          done(error);
        });
    });
  });
});
