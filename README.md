# hapi-demo [![Build Status](https://travis-ci.org/blogfoster/hapi-demo.svg?branch=master)](https://travis-ci.org/blogfoster/hapi-demo)

This Repo is a Hapi plugin, that adds the possibily to define demo handlers.

The demo handler will be called instead of the original handler of certain conditions are met.

A possible use-case is, if one want's to setup routes with demo date but does not want to
add any additional code into the existing code-base and instead define separated demo handlers.

## install

```bash
npm i --save hapi-demo
```

## usage

### register

Set up a hapi server and register the plugin.

```javascript
import Hapi from 'hapi';
import HapiDemo from 'hapi-demo'

const server = new Hapi.Server();
server.register(HapiDemo)
  .then(() => {
    console.log('plugin has been registered successfully');
  });
```

### route setup

When setting up routes, configure the demo handler if necessary:

```javascript
import Joi from 'joi';

server.route({
  method: 'GET',
  path: '/test',
  handler(request, reply) {
    return reply('test handler called');
  },
  config: {
    plugins: {
      'hapi-demo': {
        shouldApplyHandler(request) {
          return request.query.demo;
        },
        handler(request, reply) {
          return reply('demo handler called');
        }
      }
    },
    validate: {
      query: Joi.object().keys({
        demo: Joi.boolean()
      })
    }
  }
});
```

Now when calling the `/test` route without any query parameters the normal hander will be called, but when
calling it with query params like `/test?demo=true`, then the demo handler will be called;

### API

#### plugin options

-

#### route options

- `test`: *{function(request: Hapi.Request) : Boolean}* - test function that returns if demo handler should be called
- `handler`: *{function(reqest: Hapi.Request, reply: Hapi.Reply)}* - demo handler
