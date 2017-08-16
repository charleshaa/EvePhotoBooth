const express = require( 'express' );
const app = express();
const path = require( 'path' );
const fileUpload = require( 'express-fileupload' );
const os = require( 'os' );
const lwip = require( 'pajk-lwip' );
const exif = require( 'exif-parser' );
var bodyParser = require('body-parser');
var Client = require( 'instagram-private-api' ).V1;
var device = new Client.Device( 'charleshaa' );
var storage = new Client.CookieFileStorage( __dirname + '/cookies/antoineetcoralie.json' );
var fs = require( 'fs' );
const net = require( 'net' );
var s;
var user;

var uploadedFiles = [];

app.set( 'port', ( process.env.PORT || 3001 ) );

var sock;

var getRandomInt = function ( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

var makeid = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for ( var i = 0; i < 8; i++ )
        text += possible.charAt( Math.floor( Math.random() * possible.length ) );

    return text;
};


// Client.Session.create(device, storage, 'antoineetcoralie', 'antoineetcoralie2017')
// 	.then(function(session) {
//         s = session;
//         session.getAccount().then(function(account){
//             console.log(account.params);
//             user = account;
//         });
//
// 		return session;
// 	});

app.use( fileUpload() );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get( '/', function ( req, res ) {
    res.sendFile( path.join( __dirname + '/index.html' ) );
} );

app.get( '/control', function ( req, res ) {
    var action = 'Shoot\r\n';
    sock = new net.Socket();
    sock.connect( 15869, '0.tcp.ngrok.io', function () {
        console.log( "Connected to program" );
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
    console.log( "Action sent: " + action );
    sock.write( action, 'ascii' );
    setTimeout( function () {
        sock.destroy();
    }, 2000 );
    res.send( "Performed action : " + action + "" );
} );

// app.post('/upload', function (req, res) {
//
//     if (!req.files) return res.status(400).send('No files were uploaded.');
// 	var rand_id = makeid();
//     var photo = req.files.image;
// 	var info = photo.name.split('.');
// 	var newName =rand_id + '.' + info[1];
// 	console.log("Original name: " + photo.name + " |||| New name: " + newName);
//     photo.mv('./images/' + newName, function(err){
//         if(err) return res.status(500).send(err);
//         res.sendFile(path.join(__dirname + '/success.html'));
//         work(newName, req.body.caption, req.body.username, req.body.name);
//
//     });
//
// });

app.post( '/upload', function ( req, res ) {
    if ( !req.files ) return res.status( 400 ).send( 'No files were uploaded.' );
    console.log("REQ body", req.body);
    var rand_id = makeid();
    var photo = req.files.image;
    var info = photo.name.split( '.' );
    var newName = rand_id + '.' + info[ 1 ];
    console.log( "Original name: " + photo.name + " |||| New name: " + newName );
    photo.mv( './images/' + newName, function ( err ) {
        if ( err ) return res.status( 500 ).send( err );

        work(newName, res, req.body.caption, req.body.username, req.body.name);

    } );

} );

var work = ( fileName, res, caption, username, name ) => {
    //if ( !user && !s ) return res.json({ success: false, error: 'No instagram' });
    // if(name && name !== ''){
    // 	caption = name + " - " + caption;
    // 	if(username && username !== ''){
    // 			caption += ' - @' + username;
    // 	}
    // }
    if(!caption) caption = '';
    var portrait;
    var fileInfo = fileName.split( '.' );
    var ext = fileInfo[ 1 ];
    var cropped = false;

    console.log( "Uploading a " + ext + " file..." );
    if ( true ) {
        // Photo
        fs.readFile( './images/' + fileName, function ( err, data ) {
            if ( err ) return console.log( err );
            var exifData = false;
            // ext is the extension of the image
            if ( ext == "jpg" || ext == "JPG" ) {
                exifData = exif.create( data ).parse();
            }
            lwip.open( './images/' + fileName, function ( err, image ) {
                var maxWidth = 1920;
                var maxHeight = 1920;
                var height = image.height();
                var width = image.width();
                var newWidth;
                var newHeight;


                // canvas.width = newWidth;
                // canvas.height = newHeight;


                //var newHeight = width * 5 / 4;
                var port = false;
                var batch;
                if ( exifData ) {
                    switch ( exifData.tags.Orientation ) {
                        case 2:
                            batch = image.batch().flip( 'x' ); // top-right - flip horizontal
                            break;
                        case 3:
                            batch = image.batch().rotate( 180 ); // bottom-right - rotate 180
                            break;
                        case 4:
                            batch = image.batch().flip( 'y' ); // bottom-left - flip vertically
                            break;
                        case 5:
                            batch = image.batch().rotate( 90 ).flip( 'x' ); // left-top - rotate 90 and flip horizontal
                            port = true;
                            break;
                        case 6:
                            batch = image.batch().rotate( 90 ); // right-top - rotate 90
                            port = true;
                            break;
                        case 7:
                            batch = image.batch().rotate( 270 ).flip( 'x' ); // right-bottom - rotate 270 and flip horizontal
                            port = true;
                            break;
                        case 8:
                            batch = image.batch().rotate( 270 ); // left-bottom - rotate 270
                            port = true;
                            break;
                    }
                } else {
                    console.log( "NO EXIF" );
                    batch = image.batch();
                }
                console.log( "PORTRAIT: " + port );

                if ( !batch ) batch = image.batch();

                if ( port || (!port && height > width) ) {
                    batch.resize( newHeight, newWidth ).crop( newHeight, (newHeight * 5/4) );
                } else {
                    batch.resize( newWidth, newHeight );
                }
                batch.writeFile( './public/img/' + fileInfo[ 0 ] + '_resized.jpg' /*'./resized/' + fileInfo[ 0 ] + '_resized.jpg' */, function ( err ) {
                    if ( err ) return console.log( err );
                    console.log( 'Wrote file ./resized/' + fileInfo[ 0 ] + '_resized.jpg' );
                    res.json({
                        success: true,
                        url: '/img/' + fileInfo[ 0 ] + '_resized.jpg'
                    });
                    // Client.Upload.photo( s, './resized/' + fileInfo[ 0 ] + '_resized.jpg' )
                    //     .then( function ( upload ) {
                    //         console.log( "Upload ID: " + upload.params.uploadId );
                    //         fs.unlink( './images/' + fileName, function ( err ) {
                    //             if ( err ) return console.log( err );
                    //             console.log( 'file ./images/' + fileName + ' deleted successfully' );
                    //         } );
                    //         fs.unlink( './resized/' + fileInfo[ 0 ] + '_resized.jpg', function ( err ) {
                    //             if ( err ) return console.log( err );
                    //             console.log( 'file ./resized/' + fileInfo[ 0 ] + '_resized.jpg deleted successfully' );
                    //         } );
                    //         return Client.Media.configurePhoto( s, upload.params.uploadId, caption );
                    //     } )
                    //     .then( function ( medium ) {
                    //         console.log( medium.params );
                    //     } );
                } );
            } );
        } );
    }
    // else if(['mp4', 'm4v', 'mov', 'MOV', 'MP4', 'M4V'].indexOf(ext) >= 0) {
    // 	// Video
    // 	console.log("Uploading video...");
    // 	Client.Upload.video(s, './images/' + fileName, './images/hudu_banner.jpg')
    // 		.then(function(upload) {
    // 			console.log("Upload: ", upload);
    // 			console.log("Video Upload ID: " + upload.uploadId);
    //             uploadedFiles.push(fileName);
    // 			return Client.Media.configureVideo(s, upload.uploadId, caption, upload.durationms);
    // 		})
    // 		.then(function(medium) {
    // 			// we configure medium, it is now visible with caption
    // 			console.log(medium.params);
    // 		});
    //
    // }


};



app.listen( app.get( 'port' ), function () {
    console.log( 'Example app listening on port ' + app.get( 'port' ) )
} );
