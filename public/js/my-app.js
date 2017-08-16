// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView( '.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true,
    material: true,
    fastClicks: true,
    materialRipple: true
} );

myApp.params.modalPopupCloseByOutside = true;
//
// // Callbacks to run specific code for specific pages, for example for About page:
// myApp.onPageInit( 'index', function ( page ) {
//     // run createContentPage func after link was clicked
//
//
// } );

// Generate dynamic page
var dynamicPageIndex = 0;

function createContentPage() {
    mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + ( ++dynamicPageIndex ) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
    return;
};

let input;
let queue = [];

const isUploadSupported = () => {
    if ( navigator.userAgent.match( /(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/ ) ) {
        return false;
    }
    var elem = document.createElement( 'input' );
    elem.type = 'file';
    return !elem.disabled;
};

const fileUploadNotSupported = () => {
    alert( "File upload not supported" );
};

const processFile = ( file, input ) => {
    let exif = {};
    console.log( "File", file );
    EXIF.getData( file, () => {
        // this = exif data
        exif.time = EXIF.getTag( this, "DateTime" );
        exif.height = EXIF.getTag( this, "ImageLength" );
        exif.width = EXIF.getTag( this, "ImageWidth" );
        exif.orientation = EXIF.getTag( this, "Orientation" );
        switch ( exif.orientation ) {
            case 2:
                // batch = image.batch().flip( 'x' ); // top-right - flip horizontal

                break;
            case 3:
                // batch = image.batch().rotate( 180 ); // bottom-right - rotate 180

                break;
            case 4:
                // batch = image.batch().flip( 'y' ); // bottom-left - flip vertically

                break;
            case 5:
                // batch = image.batch().rotate( 90 ).flip( 'x' ); // left-top - rotate 90 and flip horizontal

                port = true;
                break;
            case 6:
                // batch = image.batch().rotate( 90 ); // right-top - rotate 90

                port = true;
                break;
            case 7:
                // batch = image.batch().rotate( 270 ).flip( 'x' ); // right-bottom - rotate 270 and flip horizontal

                port = true;
                break;
            case 8:
                // batch = image.batch().rotate( 270 ); // left-bottom - rotate 270

                port = true;
                break;
        }
        setTimeout( function () {
            console.log( "EXIF", exif );
        }, 1500 );


    } );


};

// const readFile = file => {
//
//     var reader = new FileReader();
//
//     reader.onloadend = function () {
//         processFile( reader.result, file.type );
//     }
//
//     reader.onerror = function () {
//         alert( 'There was an error reading the file!' );
//     }
//
//     reader.readAsDataURL( file );
//
// };



const onSelect = e => {
    if ( canUpload() ) {
        // read EXIF

        var inputVanilla = input.get( 0 );
        var file = e.target.files[ 0 ];
        EXIF.getData( file, () => {
            alert( EXIF.pretty( this ) );
        } );
        return;
        if ( file ) {
            if ( /^image\//i.test( file.type ) ) {
                processFile( file, inputVanilla );
            } else {
                alert( 'Not a valid image!' );
            }
        }


    } else {
        fileUploadNotSupported();
    }
};

const createPreview = img => {
    var reader = new FileReader();
    var f = img.file;
    reader.onerror = () => alert( "Error reading file" );
    reader.onloadend = () => {
        var image = new Image();
        var canvas = document.createElement( 'canvas' );



        var context = canvas.getContext( '2d' );
        image.onload = () => {
            var maxWidth = 300;
            var maxHeight = 300;
            var width = image.width;
            var height = image.height;
            var newWidth;
            var newHeight;

            if ( width > height ) {
                newHeight = height * ( maxWidth / width );
                newWidth = maxWidth;
            } else {
                newWidth = width * ( maxHeight / height );
                newHeight = maxHeight;
            }
            canvas.width = newWidth;
            canvas.height = newHeight;

            context.drawImage( image, 0, 0, newWidth, newHeight );
            var list = $( '#image-list' );
            var item = $( '<li class="picture-details" />' );
            var c = $( canvas );
            item.data( 'index', queue.length - 1 );
            queue[ queue.length - 1 ].imageData = reader.result;
            var b64 = canvas.toDataURL( img.file.type );
            item.css( 'backgroundImage', 'url(' + b64 + ')' );
            list.append( item );
            console.log( "queue", queue );
            toggleDone();
            // Should upload
        }
        image.src = reader.result;
    };

    reader.readAsDataURL( img.file );

};

const canUpload = () => window.File && window.FileReader && window.FormData;

const uploadAll = () => {

};

const toggleDone = () => {
    if(queue.length > 0){
        $('#upload-all').show();
    } else {
        $('#upload-all').hide();
    }
};

$( document ).ready( function () {

    setTimeout( () => {
        if ( !canUpload() ) fileUploadNotSupported();
    }, 3000 );
    var body = $( 'body' );
    body.on( 'submit', '#my-form', function ( event ) {
        myApp.showPreloader( 'Téléversement... (peut prendre quelques minutes)' );
    } );
    body.on( 'click', '.camera-action', function ( ev ) {
        myApp.showPreloader( "Patience..." );
        var action = $( this ).data( 'command' );
        console.log( "Should trigger: " + action );
        $.get( '/control?action=' + action, function ( data ) {
            console.log( data );
            setTimeout( function () {
                myApp.hidePreloader();
            }, 2500 );
        } );
        return false;
    } );



    input = $( '#image-upload-input' );
    body.on( 'click', '#add-photo', function () {
        input.trigger( 'click' );
    } );

    document.getElementById( "image-upload-input" ).onchange = function ( e ) {
        var exif = {};
        var imgObject = {
            file: e.target.files[ 0 ]
        };
        EXIF.getData( e.target.files[ 0 ], function () {
            imgObject.time = EXIF.getTag( this, "DateTime" );
            imgObject.height = EXIF.getTag( this, "PixelYDimension" );
            imgObject.width = EXIF.getTag( this, "PixelXDimension" );
            imgObject.orientation = EXIF.getTag( this, "Orientation" );

            switch ( exif.orientation ) {
                case 2:
                    // batch = image.batch().flip( 'x' ); // top-right - flip horizontal

                    break;
                case 3:
                    // batch = image.batch().rotate( 180 ); // bottom-right - rotate 180

                    break;
                case 4:
                    // batch = image.batch().flip( 'y' ); // bottom-left - flip vertically

                    break;
                case 5:
                    // batch = image.batch().rotate( 90 ).flip( 'x' ); // left-top - rotate 90 and flip horizontal

                    port = true;
                    break;
                case 6:
                    // batch = image.batch().rotate( 90 ); // right-top - rotate 90

                    port = true;
                    break;
                case 7:
                    // batch = image.batch().rotate( 270 ).flip( 'x' ); // right-bottom - rotate 270 and flip horizontal

                    port = true;
                    break;
                case 8:
                    // batch = image.batch().rotate( 270 ); // left-bottom - rotate 270

                    port = true;
                    break;
            }
            queue.push( imgObject );
            createPreview( imgObject );
        } );
    }

    $( 'body' ).on( 'click', '.picture-details', function ( e ) {
        var item = $( this );
        var index = item.data( 'index' );
        var pictureData = queue[ index ].imageData;
        var prevCaption = queue[ index ].caption || '';
        // var popupHtml = `
        // <div class="popup">
        // <div class="toolbar toolbar-bottom">
        //     <div class="toolbar-inner">
        //       <a href="#" class="close-popup link">Save</a>
        //     </div>
            // <div class="picture-preview">
            //     <img style="max-width: 100%;" src="${pictureData}" />
            // </div>
        //     <div class="content-block-title">Add a caption</div>
        //     <div class="list-block inset">
        //         <ul>
        //             <li class="align-top">
        //             <div class="item-content">
        //                 <div class="item-inner">
        //                     <textarea></textarea>
        //                 </div>
        //               </div>
        //             </li>
        //         </ul>
        //     </div>
        // </div>
        // `;
        // myApp.popup(popupHtml, true);
        var modal = myApp.modal( {
            afterText: `
                <div class="picture-preview">
                    <img style="max-width: 100%;" src="${pictureData}" />
                </div>
                <div class="enter-caption row">
                    <textarea style="padding: 15px;" class="col-100" rows="5" name="" id="caption" placeholder="Add a caption">${prevCaption}</textarea>
                </div>
            `,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Remove',
                    onClick: function(){
                        queue.splice(index, 1);
                        item.remove();
                        var items = $('.picture-details');
                        for(let i=index; i<queue.length; i++){
                            $(items[i]).data('index', parseInt($(items[i]).data('index')) - 1);
                        }

                    }
                },
                {
                    text: 'Save',
                    bold: true,
                    onClick: function () {
                        queue[ index ].caption = $('#caption').val();
                    }
                },
            ]
        } );

    } );
    //input.on( 'change', onSelect );
    $('body').on('modal:closed', toggleDone);
} );
