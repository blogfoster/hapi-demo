import Joi from 'joi';

const RouteSettingsSchema = Joi.object().keys({
  test: Joi.func().arity(1),
  handler: Joi.func().arity(2)
}).optional();

/**
 * iterate over all server routes and call `iterator` with each route.
 *
 * @param {Hapi.Server} server - hapi server
 * @param {function(route: Hapi.Route)} iterator - iterator function called with each route
 */
function forEachRoute(server, iterator) {
  const connections = server.table();
  connections.forEach(function (connection) {
    connection.table.forEach(iterator);
  });
}

/**
 * create a new handler function, that checks the given `test` function and calls `demoHandler` or `handler`
 *
 * @param {function(request: Hapi.Request) : Boolean} test - test function
 * @param {function(request: Hapi.Request, reply: Hapi.Reply)} demoHandler - demo handler called when test was true
 * @param {function(request: Hapi.Request, reply: Hapi.Reply)} handler - handler called when test was false
 * @return {function(request: Hapi.Request, reply: Hapi.Reply)} wrapped handler
 */
function wrapHandler(test, demoHandler, handler) {
  return function (request, reply) {
    if (test(request)) {
      return demoHandler(request, reply);
    }

    return handler(request, reply);
  };
}

const plugin = {
  register(server, options, next) {
    // wrap configured handlers when the server is started
    server.ext('onPreStart', function (server, next) {
      forEachRoute(server, (route) => {
        const { plugins } = route.settings;
        if (!plugins || !plugins['hapi-demo']) {
          return;
        }

        const routeSettings = Joi.attempt(plugins['hapi-demo'], RouteSettingsSchema);
        route.settings.handler = wrapHandler(routeSettings.test, routeSettings.handler, route.settings.handler);
      });

      return next();
    });

    return next();
  }
};

plugin.register.attributes = {
  name: 'hapi-demo'
};

export default plugin;
