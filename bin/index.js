#!/usr/bin/env node

'use strict'

//
// MARK: import the modules
//

// access file system
const fs = require('fs');

// gloabl searching
const glob = require('glob');

// xhttp requests
const axios = require('axios');

// user home directory
const homedir = require('os').homedir();

//
// MARK: create the variables / constants
//

// get the command line arguments
const args = ( function( argv ) {

    // remove `node` and `script` name
    argv = argv.slice(2);

    // returned object
    var args = {};
    var argName, argValue;

    // loop through each argument
    argv.forEach(function( arg, index ) {

        // seperate argument, for a key/value return
        arg = arg.split( '=' );

        // retrieve the argument name
        argName = arg[0];

        // remove "--" or "-"
        if( argName.indexOf('-') === 0 ) {
            argName = argName.slice( argName.slice(0, 2).lastIndexOf('-') + 1 );
        }

        // associate defined value or initialize it to "true" state
        argValue = (arg.length === 2) ?

            // check if argument is valid number
            parseFloat(arg[1]).toString() === arg[1]

                ? +arg[1]
                : arg[1]

            : true;

        // finally add the argument to the args set
        args[argName] = argValue;
    });

    return args;
})( process.argv );


//
// HELP: command line help
//
if( args.help ) {
    return console.log(
        "---------------------------------------------------\n"    +
        "--              Markdown URL scanner             --\n"    +
        "---------------------------------------------------\n"    +
        "\n"                                                       +
        "Usage: markdown-safe-link [options]\n\n"                  +
        "Options:\n"                                               +
        "  --dir           The directory to scan md files\n"       +
        "  --api           Your API key\n"                         +
        "  --proxy         Are you behind a proxy server\n"        +
        "    --url         Proxy url address or IP address\n"      +
        "    --port        Proxy port number\n"                    +
        "    --username    Username if your proxy has auth\n"      +
        "    --password    Password if your proxy has auth\n"      +
        "  --replace       String to replace bad urls with\n"      +
        "  --dry           Don't actually re-write files\n"        +
        "  --help          Display this screen\n\n"                +
        "Example: \nmarkdown-safe-link --dir='~/docs' --api='qwerty12345' --replace='UNSAFE'"
    );
}

// api key checks
const apiKey = function() {

    // api not declared
    if( !args.api ) { return 1;    }

    // declared but empty
    if( args.api === true ) { return 2; }

    // all good
    if( args.api && args.api !== true ) { return args.api; }

} ( args );

// get the directory
const directory = function() {

    // get the argument in a variable
    let dirArg = args.dir;

    // if not defined or defined but no value
    if( !dirArg || dirArg && "" === dirArg )
        return process.cwd();

    // is first character a `~` and replace it with home
    126 === dirArg.charCodeAt( 0 ) &&
        ( dirArg = dirArg.replace( "~", homedir ) );

    // is the string have an `.md` extension - strip it!
    "md" == dirArg.split( "." ).pop() &&
        ( dirArg = dirArg.substring( 0, dirArg.lastIndexOf( "/" ) ) );

    // before we return it - strip the last `/`
    return dirArg = dirArg.replace( /\/$/, "" )

}( args );

// the array of threat urls
let urlThreats = [];

// urls array
let urlMatchesArray =[];

// url variable
let url = '';

// array of markdown with urls
const markdownFilesWithURLS = [];

// get a list of files
const markdownFilesArray = glob.sync(

    // what to search for
    directory + "/**/*.md",

    // options
    {
        // ignore the node_modules
        ignore: process.cwd() + '/node_modules/**/*.md',

        // dont match directory
        nodir:    true
    }
);


//
// MARK: loop through all the matched files
//
(function() {

    //
    // MARK: api key check
    //
    if( apiKey === 1 ) {
        return console.log( "[x] Exiting: API argument not declared!" );
    }
    if( apiKey === 2 ) {
        return console.log( "[x] Exiting: API key not provided!" );
    }

    // loop files
    for( const markdownFile of markdownFilesArray ) {

        //
        // MARK: read markdown files
        //

        // DEBUG: log scan start
        console.log( `[~] Reading file: "${ markdownFile.replace( directory, '' ) }"` );

        // read the `markdownFile`
        var markdownFileContents = fs.readFileSync( markdownFile, 'utf8' );

        // build the regex array
        // @matches: [url](http://google.com)    -> http://google.com
        // @matches: [url](https://google.com)    -> https://google.com
        // @matches: http://google.com            -> http://google.com
        // @matches: https://google.com            -> https://google.com
        // @matches: * also matches anchors and queries # / ?
        var regexArray = markdownFileContents.matchAll( /(https?:\/\/\w+.[\w\/.?=&:#]+)/g );

        // previous url count
        const previousURLCount = urlMatchesArray.length;

        // loop through regex results
        for( const regex of regexArray ) {

            // strip `.` from end of string
            url = regex[0].replace( /\.+$/, "" );

            // add it to the array
            // urlMatchesArray.push( { url } );
            urlMatchesArray.push( { url } );
        }

        // current url count (since it increments)
        const currentURLCount = urlMatchesArray.length;

        // calculate the total urls for this file
        const foundURLs = ( currentURLCount - previousURLCount );

        // if there are no urls to parse
        if( foundURLs < 1 ) {

            // DEBUG: no urls in the file
            console.log( `    [✔] Skipping: ${foundURLs} urls\n` );

        } else {

            // DEBUG: report how many urls there are
            console.log( `    [i] Found: ${foundURLs} urls\n` );

            // files with urls
            markdownFilesWithURLS.push( markdownFile );
        }
    }

// get these variables
})( markdownFilesArray, urlMatchesArray, markdownFilesWithURLS );


//
// MARK: clean up found urls
//
const params = (function() {

    // generate the variables
    const    jsonToArray     = [],
            truncatedURLs    = [];

    // loop through all urls
    urlMatchesArray.forEach( function( value ) {

        // add it to a normal array
        jsonToArray.push( value.url );

    });

    // make the array only unique url entries
    const uniqueURL = [ ...new Set( jsonToArray ) ];

    // loop through regexults
    for( const url of uniqueURL ) {

        // add it to the array
        truncatedURLs.push( { url } );

    }

    // DEBUG: sending to Google Safe Browsing
    console.log( "[i] Removing duplicates" );

    // output for Google Safe Browsing
    const parameters = JSON.stringify(
        {
            "client": {
                "clientId":         "github-actions-safe-browsing",
                "clientVersion":    "1.0.0"
            },
            "threatInfo": {
                "threatTypes":      [
                                        "MALWARE",
                                        "SOCIAL_ENGINEERING",
                                        "POTENTIALLY_HARMFUL_APPLICATION",
                                        "UNWANTED_SOFTWARE"
                                    ],
                "platformTypes":    [ "ALL_PLATFORMS" ],
                "threatEntryTypes": [ "URL" ],
                "threatEntries":    truncatedURLs
            }
        }
    );

    // DEBUG: sending to Google Safe Browsing
    console.log( `[i] Scanning: ${truncatedURLs.length} unique urls\n` );

    // return them to the code
    return parameters;

// get these variables
})( urlMatchesArray );


//
// MARK: post the links to Google Safe Browsing
//
const unsafeScannedURLs = (function() {

    // api key
    // TODO: secure the key
    const api = `?key=${ apiKey }`;

    // endpoint url
    const endpoint = "https://safebrowsing.googleapis.com/v4/threatMatches:find" + api;

    // get the proxies for the poor corporate users :(
    const proxyArgs = function() {

        // get the arguments from the commandline
        const c = args.url, d = args.port, a = args.username, b = args.password;

        // get the details
        if( args.proxy ) {
            var e = "";

            if ( c && d )
                a && b &&    "" !== a &&
                            "" !== b &&
                            ( e = ", auth: { username: '" + a + "', password: '" + b + "' }" );
            else return !1;

            return "{ host: '" + ( c + "', port: " + d ) + e + " }"

        } return !1

    }( args );

    // axios POST
    axios.post(

        // api endpoint
        endpoint,

        // raw body parameters
        params,

        // extra config
        {
            headers:    { 'Content-type': 'application/json' },
            timeout:    60 * 4 * 1000,
            proxy:        proxyArgs
        }
    )
    .then( function( response ) {

        // get the matched bad urls
        const badURLMatches = response.data.matches;

        // if there are no bad urls -> exit
        if( badURLMatches == undefined) {
            console.log( "[i] No url sanitisation needed" );
            console.log( "[✔] All urls safe for browsing" );
            return
        }

        // loop through the bad urls
        for( const badURL of badURLMatches ) {

            // add to the array
            urlThreats.push( badURL.threat.url );
        }

        // make the array only unique url entries
        let uniqueURL = [ ...new Set( urlThreats ) ];

        // DEBUG: start the cleaning
        console.log( `[!] Found: ${uniqueURL.length} malicious urls` );

        // report the urls
        uniqueURL.forEach( function( value, i ) {
            console.log( `    [%d]: detected %s`, ( i + 1 ), value );
        });

        // notice of cleaning
        console.log( "\n[~] Begin sanitisation of urls" );

        // call to replace bad urls with REDACTED
        replaceThreatsInMarkdown( uniqueURL, markdownFilesWithURLS );

    })
    .catch( function( error ) {

        // DEBUG: log errors
        console.log( "* * * * * * * * * * * * * * * * * * * * *" );
        console.log( `ERROR: > ${error.response.data.error.message}`);
        console.log( "* * * * * * * * * * * * * * * * * * * * *" );

    });

// get these variables
})( params );

//
// MARK: replace text with REDACTED
//
function replaceThreatsInMarkdown( urls, markdown ) {

    // get the argument
    const replace = function() {
        const a = args.replace;

        if( !a )
            return "[~X~]";

        if( "" !== a )
            return a
    }( args );

    // get the argument
    const dryrun = function() {
        return args.dry ? !0 : !1
    }( args );

    // loop files
    for( const md of markdown ) {

        // get the contents as variable
        let mdFileContents = fs.readFileSync( md, 'utf8' );

        // log the file working on
        console.log( `    [~] Working on file: "${md}"` );

        // loop through malicious urls
        for( const url of urls ) {

            // regex the url from markdown file
            mdFileContents = mdFileContents.replace( new RegExp( url, "g" ), replace );

        }

        // dont actually rewrite
        if( dryrun ) {

            // tell the user
            console.log( "   *[i] Dry run - no urls were replaced\n" );

        } else {

            // re-write the files
            fs.writeFile( md, mdFileContents, 'utf8', function( err ) {

                // DEBUG: errors
                if( err ) return console.log( err );

                // log the scan and clean
                console.log( "        [✔] Removed url from: " + md );

            });
        }
    }
}

// end of file;
