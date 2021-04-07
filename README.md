# stock-checker
Separated into server (API, database update) and worker (queuing, divying out work, performing playwright work to check for ability to add to cart).

Rest API accepts json object describing items with url and selector to check.

Frontend intended to be separate.

## Environment
### Local
WSL2 with redis server installed.
```
npm ci
sudo service redis-server start // start redis server
npm run start
```
http://localhost:5000/

#### API test
curl -d '{"name": "3080 Asus TUF OC","selector": "#add-to-cart-button","url": "https://www.amazon.com/ASUS-GeForce-Graphics-DisplayPort-Bearings/dp/B08HH5WF97"}' -H "Content-Type: application/json" -X POST http://localhost:5000/job

### Heroku
```
git push heroku main // deploy commited code to heroku
```
https://floating-scrubland-88014.herokuapp.com

## References
- https://github.com/heroku-examples/node-workers-example
- https://www.twilio.com/blog/4-tools-for-web-scraping-in-node-js
- https://devcenter.heroku.com/articles/getting-started-with-nodejs
- https://devcenter.heroku.com/articles/node-redis-workers
- https://medium.com/@RedisLabs/windows-subsystem-for-linux-wsl-10e3ca4d434e
- https://elements.heroku.com/buildpacks/mxschmitt/heroku-playwright-buildpack
