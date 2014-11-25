# ember-dbxdatastore-adapter

Ember Data Adapter for Dropbox Datastore API. Store your application data into it. Learn more about Dropbox Datastore in here: [Dropbox Datastore API](https://www.dropbox.com/developers/datastore)

## Usage

You need to have registered application with an OAuth redirect URI registered on the [App Console](https://www.dropbox.com/developers/apps) before using the Dropbox Datastore API. You should download Dropbox Javascript SDK using this command `bower install dropbox --save` for your convenient.

```js
var APP_KEY = 'your dropbox app key',
    client = new Dropbox.Client({key: APP_KEY});

// Try to finish OAuth authorization.
client.authenticate({interactive: false}, function (error) {
    if (error) {
        alert('Authentication error: ' + error);
    }
});

// Pass authenticated client to the adapter
App.ApplicationAdapter = DS.DBXDSAdapter.extend({
  client: client
});
```

For more details on how Dropbox Datastore API works read tutorial: [Using the Datastore API in JavaScript](https://www.dropbox.com/developers/datastore/tutorial/js)

## Contributing

First, you will need npm and bower installed on your dev machine. Learn more about Node JS in the [Node JS homepage](http://nodejs.org/) - click "Install" if you doesn't have Node JS before. Install project development dependencies using `npm install`. It will also install gulp, build system that I are using.

Second, you need bower for project dependencies installed on your dev machine. Install with `npm install -g bower` and then `bower install`.

1. Fork;
2. Create a feature branch
3. Write code with tests
4. Run tests with `gulp test`
5. Create a pull request.

Happy Coding!

## License

The MIT License (MIT)

Copyright (c) 2014 Bahrunnur

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


