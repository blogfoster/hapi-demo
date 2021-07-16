/* eslint func-style: 0 */

import assert from "assert";
import Hapi from "hapi";
import Joi from "joi";

import HapiDemo from "../../source";

describe("[integration] hapi-demo", () => {
  let server;

  before("create server", () => {
    server = new Hapi.Server();

    return server.connection({
      host: "localhost",
      port: 8080,
    });
  });

  before("register hapi-demo plugin", () => server.register(HapiDemo));

  function demoTest(request) {
    return request.query.demo;
  }

  function testHandler(request, reply) {
    return reply("test route called");
  }

  function test2Handler(request, reply) {
    return reply("test2 route called");
  }

  before("add routes", () =>
    server.route([
      {
        method: "GET",
        path: "/test",
        handler: testHandler,
        config: {
          plugins: {
            "hapi-demo": {
              shouldApplyHandler: demoTest,
              handler(request, reply) {
                return reply("demo route called");
              },
            },
          },
          validate: {
            query: Joi.object().keys({
              demo: Joi.boolean(),
            }),
          },
        },
      },
      {
        method: "GET",
        path: "/test2",
        handler: test2Handler,
      },
    ])
  );

  before("initialize server", () => server.initialize());

  after("stop the server", () => server.stop());

  describe("for routes that configure the hapi-demo plugin", () => {
    let configuredHandler;

    before("find route setup in server configuration", () => {
      const { table } = server.table()[0];
      const route = table.filter((route) => route.path === "/test")[0];

      configuredHandler = route.settings.handler;
    });

    it("should wrap the handler function", () => {
      assert.notEqual(configuredHandler, testHandler);
    });
  });

  describe("when demo condition does not match", () => {
    let response;

    before("call server", () =>
      server
        .inject({
          method: "GET",
          url: "/test",
        })
        .then((res) => {
          response = res;
        })
    );

    it("should call the normal handler", () => {
      assert.equal(response.payload, "test route called");
    });
  });

  describe("when demo condition matches", () => {
    let response;

    before("call server", () =>
      server
        .inject({
          method: "GET",
          url: "/test?demo=true",
        })
        .then((res) => {
          response = res;
        })
    );

    it("should call the demo handler", () => {
      assert.equal(response.payload, "demo route called");
    });
  });

  describe("for not-configured routes", () => {
    let response;
    let configuredHandler;

    before("call server", () =>
      server
        .inject({
          method: "GET",
          url: "/test2",
        })
        .then((res) => {
          response = res;
        })
    );

    before("find route setup in server configuration", () => {
      const { table } = server.table()[0];
      const route = table.filter((route) => route.path === "/test2")[0];

      configuredHandler = route.settings.handler;
    });

    it("should not wrap the handler function", () => {
      assert.equal(configuredHandler, test2Handler);
    });

    it("should call the normal handler", () => {
      assert.equal(response.payload, "test2 route called");
    });
  });
});
