var Client = require('instagram-private-api').V1;
var device = new Client.Device('charleshaa');
var storage = new Client.CookieFileStorage(__dirname + '/cookies/antoineetcoraliephoto.json');
var fs = require('fs');
var lwip = require('lwip');
var s;
var user;

var uploadedFiles = [];

Client.Session.create(device, storage, 'antoineetcoralie', 'antoineetcoralie2017')
	.then(function(session) {
        s = session;
        session.getAccount().then(function(account){
            console.log(account.params);
            user = account;
        });

		return session;
	});

var work = fileName => {
    if( !user && !s ) return;
    if(uploadedFiles.indexOf(fileName) >= 0) {
        console.log("Already uploaded");
        return;
    }
	var file = fileName.split('.');
	lwip.open('./images/' + fileName, function (err, image) {
		image.batch()
		.resize(1920, 1280)
		.writeFile('./resized/' + file[0] + '_resized.jpg', function (err) {
			Client.Upload.photo(s, './resized/' + file[0] + '_resized.jpg')
		        .then(function(upload){
		            console.log("Upload ID: " + upload.params.uploadId);
		            uploadedFiles.push(fileName);
		            return Client.Media.configurePhoto(s, upload.params.uploadId, 'Test upload photomaton -> ' + fileName);
		        })
		        .then(function(medium){
		            console.log(medium.params);
		        });
		});
	});

};

fs.watch(__dirname + '/images', (eventType, fileName) => {
    console.log('Type: ' + eventType);
    console.log('File: ' + fileName);
	var file = fileName.split('.');

    if(eventType === 'rename' && file[1] === 'jpg') work(fileName);
});
