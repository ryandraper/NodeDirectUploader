/*
 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/


/*
 * Import required packages.
 * Packages should be installed with "npm install".
 */
const express = require('express');
const aws = require('aws-sdk');

//const { Client } = require('pg');

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });


/*
 * Set-up and run the Express app.
 */
const app = express();
app.set('views', './views');
app.use(express.static('./public'));
app.engine('html', require('ejs').renderFile);
app.get('/', (req, res) => res.render('index.ejs'))
app.listen(process.env.PORT || 3000);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

/*
 * Configure the AWS region of the target bucket.
 * Remember to change this to the relevant region.
 */
aws.config.region = 'ca-central-1';

/*
 * Load the S3 information from the environment variables.
 */
const S3_BUCKET = process.env.S3_BUCKET;

/*
 * Respond to GET requests to /account.
 * Upon request, render the 'account.html' web page in views/ directory.
 */
app.get('/account', (req, res) => res.render('account.html'));

/*
 * Respond to GET requests to /sign-s3.
 * Upon request, return JSON containing the temporarily-signed S3 request and
 * the anticipated URL of the image.
 */
app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

/*
 * Respond to POST requests to /submit_form.
 * This function needs to be completed to handle the information in
 * a way that suits your application.
 */
app.post('/save-details', (req, res) => {

  let insertQuery = 'INSERT INTO users( username, fullname) VALUES(' + '\'' + req.body.username + '\', \'' + req.body.fullname + '\');';
  console.log(insertQuery);

  const { Client } = require('pg');
  const client = new Client({
      connectionString: process.env.DATABASE_URL,  
      ssl: {
        rejectUnauthorized: false
      }
  });
  client.connect();
  client.query(insertQuery, (err, result) => {
    console.log(err ? err.stack : result); // Hello World!
    client.end();
    res.end('done');
  });

  //insertData(req,res);
  //console.log('db url: ' + process.env.DATABASE_URL);
  // console.log('request: ');

  // console.log(req.body.username);
  // console.log(req.body.fullname);

  // let insertQuery = 'INSERT INTO users( username, fullname) VALUES(' + '"' + req.body.username + '", "' + req.body.fullname + '");';
  // console.log(insertQuery);
  
  // await client.connect();

  //client.connect(client.connectionString, function(err, client, done){});

  //const queryResult = await client.query(insertQuery); //, (err, res) => {
  //   console.log('database res');
  //   console.log('%o',res);
  //   if (err) throw err;
  //   for (let row of res.rows) {
  //     console.log(JSON.stringify(row));
  //   }
  //   client.end();
  //   res.end('done');
  // });

  // console.log(queryResult);
  // client.end();
  // res.end('done');


  
  // TODO: Read POSTed form data and do something useful
});

// async function insertData(req,res){

//   let insertQuery = 'INSERT INTO users( username, fullname) VALUES(' + '"' + req.body.username + '", "' + req.body.fullname + '");';
//   console.log(insertQuery);

//   // console.log('request: ');

//   // console.log(req.body.username);
//   // console.log(req.body.fullname);

//   await client.connect();

//   const queryResult = await client.query(insertQuery);
//   console.log(queryResult);
//   client.end();
//   res.end('done');

// }
