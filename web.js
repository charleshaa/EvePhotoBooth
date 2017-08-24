const express = require( 'express' );
const app = express();
const path = require( 'path' );
const fileUpload = require( 'express-fileupload' );
const os = require( 'os' );
const lwip = require( 'pajk-lwip' );
const exif = require( 'exif-parser' );
var bodyParser = require( 'body-parser' );
var Client = require( 'instagram-private-api' )
    .V1;
var device = new Client.Device( 'eve' );
var storage = new Client.CookieFileStorage( __dirname + '/cookies/evephotobooth.json' );
var fs = require( 'fs' );
const net = require( 'net' );


const INSTAGRAM_USERNAME = 'evephotobooth';
const INSTAGRAM_PASSWORD = 'eventphotobooth3000';
const DELETE_ON_UPLOAD = false;

var s;
var user;

var uploadedFiles = [];

app.set( 'port', ( process.env.PORT || 3001 ) );

var sock;

const getRandomInt = function ( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

/**
 * Creates an 8 chars UUID
 * @return {string} UUID
 */
const makeid = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for ( var i = 0; i < 8; i++ )
        text += possible.charAt( Math.floor( Math.random() * possible.length ) );

    return text;
};

/**
 * Graceful error response
 * @param  {object}         res Express response object
 * @param  {object|string}  err Error object
 */
const fail = ( res, err ) => {
    console.log( "ERROR!!!\r\n--------", err );
    return res.status( 500 )
        .json( { success: false, error: err } );
};

app.use( fileUpload() );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( bodyParser.urlencoded() );
app.use( bodyParser.json() );

// Initialize Instagram session

Client.Session.create( device, storage, INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD )
    .then( function ( session ) {
        s = session;
        session.getAccount()
            .then( function ( account ) {
                console.log( account.params );
                user = account;
            } );

        return session;
    } );


// Home

app.get( '/', function ( req, res ) {
    res.sendFile( path.join( __dirname + '/index.html' ) );
} );

// Camera control endpoin - not used yet

app.get( '/control', function ( req, res ) {

    var action = 'Shoot\r\n';

    sock = new net.Socket();
    sock.connect( 15869, '0.tcp.ngrok.io', function () {
        console.log( "Connected to PC program" );
    } );

    if ( req.query.action ) {
        switch ( req.query.action ) {
            case "con":
                action = "Connect\r\n";
                break;
            case "disc":
                action = "Disconnect\r\n";
                break;
            case "lv":
                action = "LV - Toggle\r\n";
                break;
            case "af":
                action = "AF\r\n";
                break;
            case "afs":
                action = "AF Shoot\r\n";
                break;
            default:
                action = "Shoot\r\n";
                break;
        }
    }

    sock.write( action, 'ascii' );

    // Kill socket to prevent program freeze
    setTimeout( function () {
        sock.destroy();
    }, 2000 );

    res.json( {
        success: true,
        action: action.trim()
    } );
} );

// Upload endpoint

app.post( '/upload', function ( req, res ) {

    if ( !req.files ) return res.status( 400 )
        .send( 'No files were uploaded.' );

    // Create unique name
    var rand_id = makeid();
    var photo = req.files.image;
    var info = photo.name.split( '.' );
    var newName = rand_id + '.' + info[ 1 ];

    // Move file to disk
    photo.mv( './images/' + newName, function ( err ) {
        if ( err ) return res.status( 500 )
            .send( err );

        // Resize, crop, flip and upload
        processFile( newName, res, req.body.caption, req.body.instagramHandle, req.body.uploaderName );

    } );

} );

/**
 * Will prepare the file for upload, upload it to instagram and add the caption.
 * @param  {string} fileName Name of file
 * @param  {object} res      Express response object
 * @param  {string} caption  Caption added by user
 * @param  {string} username Uploader's Instagram handle
 * @param  {string} name     Uploader's name
 * @return {null}
 */
const processFile = ( fileName, res, caption, username, name ) => {

    if ( !user && !s ) return fail( res, 'No instagram' );

    // Create caption
    if ( !caption ) caption = '';
    if ( name && name !== '' ) {
        caption += ' - Uploaded by ' + name;
    }
    if ( username && username !== '' ) {
        caption += ' - @' + username;
    }

    var portrait;
    var fileInfo = fileName.split( '.' );
    var ext = fileInfo[ 1 ];
    var cropped = false;

    // Read the file and start manipulation

    fs.readFile( './images/' + fileName, function ( err, data ) {

        if ( err ) return fail( res, err );

        var exifData = false;

        // Parse EXIF in case of jpg file

        if ( ext == "jpg" || ext == "JPG" ) {
            exifData = exif.create( data )
                .parse();
        }

        // Load the file in the image editor

        lwip.open( './images/' + fileName, function ( err, image ) {

            if ( err ) return fail( res, err );

            var maxWidth = 1920;
            var maxHeight = 1920;
            var height = image.height();
            var width = image.width();
            var newWidth;
            var newHeight;
            var port = false;
            var origPort = false;

            // Landscape

            if ( width > height ) {

                newHeight = height * ( maxWidth / width );
                newWidth = maxWidth;

            } else { // Portrait as original, we need to know if it has orientation data

                newWidth = width * ( maxHeight / height );
                newHeight = maxHeight;

                var orient = exifData ? exifData.tags.orientation : 'N/A';
                origPort = true; // Means we have a file in landscape which has orientation data saying otherwise

            }

            var batch;

            if ( exifData ) {

                switch ( exifData.tags.Orientation ) {
                    case 2:
                        batch = image.batch()
                            .flip( 'x' ); // top-right - flip horizontal
                        break;
                    case 3:
                        batch = image.batch()
                            .rotate( 180 ); // bottom-right - rotate 180
                        break;
                    case 4:
                        batch = image.batch()
                            .flip( 'y' ); // bottom-left - flip vertically
                        break;
                    case 5:
                        batch = image.batch()
                            .rotate( 90 )
                            .flip( 'x' ); // left-top - rotate 90 and flip horizontal
                        port = true;
                        break;
                    case 6:
                        batch = image.batch()
                            .rotate( 90 ); // right-top - rotate 90
                        port = true;
                        break;
                    case 7:
                        batch = image.batch()
                            .rotate( 270 )
                            .flip( 'x' ); // right-bottom - rotate 270 and flip horizontal
                        port = true;
                        break;
                    case 8:
                        batch = image.batch()
                            .rotate( 270 ); // left-bottom - rotate 270
                        port = true;
                        break;
                }

            } else {

                batch = image.batch();

            }

            if ( !batch ) batch = image.batch(); // In case EXIF Orientation is 1.

            if ( port ) {

                // We already flipped it, so we use newHeight in place of newWidth and vis-versa

                batch.resize( newHeight, newWidth )
                    .crop( newHeight, ( newHeight * 5 / 4 ) );

            } else {

                if ( origPort ) { // It is portrait, but was landscape in file binary

                    batch.resize( newWidth, newHeight )
                        .crop( newWidth, ( newWidth * 5 / 4 ) );

                } else {

                    // Good'old landscape picture

                    batch.resize( newWidth, newHeight );

                }
            }

            // Write the modified file to disk

            var modifiedFilePath = './resized/' + fileInfo[ 0 ] + '_resized.jpg';

            batch.writeFile( modifiedFilePath, function ( err ) {

                if ( err ) return fail( res, err );
                console.log("Will upload !");
                Client.Upload.photo( s, modifiedFilePath )
                    .then( function ( upload ) {

                        if ( DELETE_ON_UPLOAD ) {

                            fs.unlink( './images/' + fileName, function ( err ) {
                                if ( err ) return fail( res, err );
                            } );
                            fs.unlink( modifiedFilePath, function ( err ) {
                                if ( err ) return fail( res, err );
                            } );

                        }

                        return Client.Media.configurePhoto( s, upload.params.uploadId, caption );

                    }, function ( err ) {
                        console.log("HERE");
                        return fail( res, err );

                    } )
                    .then( function ( medium ) {
                        res.json( {
                            success: true,
                            caption: caption,
                            embed: 'https://instagram.com/p/' + medium.code + '/embed'
                        } );
                    }, function ( err ) {
                        return fail( res, err );
                    } );
            } );
        } );
    } );
};



app.listen( app.get( 'port' ), function () {
    console.log( 'App listening on port ' + app.get( 'port' ) )
} );
