'use strict'

// get the file system
const fs = require('fs');

//
const axios = require('axios');


// make variable
var matches = [],
    url = '';

// read the files
fs.readFile('file.md', 'utf8', function (err, data) {

    // DEBUG: errors
    if( err ) { return console.log(err); }

    // regex
    var regex = data.matchAll( /(https?:\/\/\w+.[\w\/.?=&:#]+)/g );

    // loop through regexults
    for( const match of regex ) {

        // strip `.` from end of string
        url = match[0].replace(/\.+$/, "");

        // add it to the array
        matches.push( {url} );
    }

    // turn into json string
    // const json = JSON.stringify( matches );
    const json = matches;

    // DEBUG: output
    // console.log( json );
    // console.log( matches );

    const outputParams = JSON.stringify(
        {
            "client": {
                "clientId":      "github-actions-safe-browsing",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes":      [
                                        "MALWARE",
                                        "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION", "UNWANTED_SOFTWARE"
                                    ],
                "platformTypes":    [ "ALL_PLATFORMS" ],
                "threatEntryTypes": [ "URL" ],
                "threatEntries": json
            }
        }
    );


    postLinks( outputParams );
});


// post the links to Google Safe Browsing
function postLinks( jsonData ) {

    // api key
    const api = "?key=AIzaSyC8dw16xrCibCP7ouHti_CJRNYhxGfENEI";

    // endpoint url
    const endpoint = "https://safebrowsing.googleapis.com/v4/threatMatches:find" + api;

    // parameters
    const params = jsonData;

    // axios POST
    axios.post(
        endpoint,
        params,
        {
             headers: {
                 'Content-type': 'application/json'
             },
            timeout: 60 * 4 * 1000,
            proxy: {
                host: '127.0.0.1',
                port: 3128
            }
        }
    )
    .then( function( response ) {
       getResponse(response);
    })
    .catch( function( error ) {
       console.log(error);
    });
}


// use the server response
function getResponse( response ) {

    // DEBUG: logging
    // console.log( response.data.matches );

    var threats = [];

    var i = 0;
    for( const match of response.data.matches ) {
        threats.push( response.data.matches[i].threat.url );
        i++;
    }
    // console.log( threats );

    // make the array onle unique entries
    let unique = [ ...new Set( threats ) ];

    console.log(unique);

}
