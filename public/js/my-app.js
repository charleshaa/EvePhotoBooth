const isMobile = () => {
    var check = false;
    ( function ( a ) { if ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test( a ) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( a.substr( 0, 4 ) ) ) check = true; } )( navigator.userAgent || navigator.vendor || window.opera );
    return check;
};


const INSTAGRAM_USERNAME = 'evephotobooth';

var CREDS = localStorage.getItem( 'creds' );
if ( CREDS ) CREDS = JSON.parse( CREDS );

// Initialize your app
var myApp = new Framework7( {
    material: true,
    fastClicks: true,
    materialRipple: true
} );

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView( '.view-main', {
    dynamicNavbar: true
} );

myApp.params.modalPopupCloseByOutside = true;


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

const isFullScreen = () => ( 'standalone' in navigator &&
    !navigator.standalone &&
    ( /iphone|ipod|ipad/gi ).test( navigator.platform ) &&
    ( /Safari/i ).test( navigator.appVersion ) );

const canUpload = () => window.File && window.FileReader && window.FormData;

const startUpload = () => {

};

const progress = ( e ) => {

    if ( e.lengthComputable ) {
        var max = e.total;
        var current = e.loaded;

        var Percentage = ( current * 100 ) / max;
        myApp.setProgressbar( currentProgressBar, Math.ceil( Percentage ) );
        if ( Percentage >= 100 ) {
            console.log( "Process is at 100 !" );
            startInstagramProcess();
        }
    }
}

const updateProgress = cursor => {
    $( '#cursor' ).text( cursor );
    myApp.setProgressbar( currentProgressBar, 0 );
};

const reset = () => {

    queue = [];
    $( '.picture-details' ).remove();
    toggleDone();


};


const upload = ( index ) => {
    var picture = queue[ index ];

    var formData = new FormData();

    formData.append( 'image', picture.file );
    if ( picture.caption ) {
        formData.append( 'caption', picture.caption );
    } else {
        formData.append( 'caption', 'No caption' );
    }

    if ( CREDS ) {
        formData.append( 'uploaderName', CREDS.name );
        formData.append( 'instagramHandle', CREDS.handle );
    }

    updateProgress( index + 1 );

    $.ajax( {
        type: 'POST',
        url: '/upload',
        data: formData,
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if ( myXhr.upload ) {
                myXhr.upload.addEventListener( 'progress', ( e ) => {
                    progress( e );
                }, false );
            }
            return myXhr;
        },
        cache: false,
        contentType: false,
        processData: false,

        success: function ( data ) {
            console.log( data );
            if ( data.success ) {
                if ( index < queue.length - 1 ) {
                    stopInstagramProcess();
                    upload( index + 1 );
                } else {
                    var len = queue.length;
                    myApp.closeModal( '#upload-popup' );
                    reset();
                    myApp.confirm( `You have successfully posted ${len} photos to ${INSTAGRAM_USERNAME}. Do you want to see them ?`, 'All is well', () => {
                        var url = 'https://instagram.com/' + INSTAGRAM_USERNAME;
                        window.open( url );
                    } );

                }
            }

        },

        error: function ( data ) {
            console.log( data );
            alert( "ERROR !" );
        }
    } );



};


const stopInstagramProcess = () => {
    if ( !$( currentProgressBar ).hasClass( 'color-multi' ) ) return;
    $( currentProgressBar ).removeClass( 'color-multi progressbar-infinite' ).addClass( 'progressbar color-green' );
    $( '#instagram-process' ).hide();
}

const startInstagramProcess = () => {
    myApp.setProgressbar( currentProgressBar, 0 );
    if ( $( currentProgressBar ).hasClass( 'color-multi' ) ) return;
    $( currentProgressBar ).removeClass( 'progressbar color-green' ).addClass( 'color-multi progressbar-infinite' );
    $( '#instagram-process' ).show();
}

const toggleDone = () => {
    if ( queue.length > 0 ) {
        $( '#upload-all' ).show();
        $( '#add-help' ).hide();
    } else {
        $( '#upload-all' ).hide();
        $( '#add-help' ).show();
    }
};
var currentProgressBar;
const uploadAll = () => {
    var len = queue.length;
    var html = `
        <div class="popup" id="upload-popup">
            <div class="view">
                <div class="page layout-dark">
                    <div class="page-content">
                        <div class="content-block" style="margin-top: 150px;">
                            <div class="content-block-inner text-center">
                                <h2>Uploading ${len} photos...</h2>
                                <p id="progress-text">Uplaoding photo <span id="cursor">1</span>/${len}</p>
                                <p><span class="progressbar color-green"><span></span></span></p>
                            </div>
                            <p id="instagram-process" class="text-center" style="color:#aaa;display: none;">Uploading picture to instagram...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    var pu = myApp.popup( html, true );
    $( pu ).on( 'popup:opened', function () {
        currentProgressBar = $$( '#upload-popup .progressbar' );
        myApp.setProgressbar( currentProgressBar, 5 );
    } );

    upload( 0 );


};



$( document ).ready( function () {
    // init

    if ( !isMobile() ) {
        console.log( "Desktop" );
        $( '#image-upload-input' ).attr( 'multiple', 'multiple' );
    }

    setTimeout( () => {
        if ( !isFullScreen() && isMobile() ) {
            myApp.alert( 'It looks like you are on a mobile browser. Please add this app to your Homescreen to enjoy a much better experience.', 'Add a shortcut !' );
        }
        if ( !CREDS ) myApp.loginScreen();
        console.log( CREDS );
        if ( !canUpload() ) fileUploadNotSupported();
    }, 1000 );
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
    var adds = 0;
    document.getElementById( "image-upload-input" ).onchange = function ( e ) {
        var files = e.target.files;
        for ( let i = 0, l = queue.length, f; f = files[ i ]; i++ ) {
            console.log( f.name );
            EXIF.getData( f, function () {
                queue.push( {
                    time: EXIF.getTag( this, "DateTime" ),
                    height: EXIF.getTag( this, "PixelYDimension" ),
                    width: EXIF.getTag( this, "PixelXDimension" ),
                    orientation: EXIF.getTag( this, "Orientation" ),
                    file: this
                } );
                var reader = new FileReader();
                reader.onerror = () => alert( "Error reading file" );
                reader.onloadend = ( function ( theFile ) {
                    return function ( e ) {
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
                            console.log( "Indexes: queue length, i", queue.length, i );
                            item.data( 'index', l + i );
                            queue[ l + i ].imageData = reader.result;
                            var b64 = canvas.toDataURL( theFile.type );
                            item.css( 'backgroundImage', 'url(' + reader.result + ')' );
                            list.append( item );
                            console.log( "queue", queue );
                            toggleDone();
                            // Should upload
                        }
                        image.src = reader.result;
                    };
                } )( this );
                reader.readAsDataURL( this );
            } );
        }



    }

    $( 'body' ).on( 'click', '.picture-details', function ( e ) {
        var item = $( this );
        var index = item.data( 'index' );
        var pictureData = queue[ index ].imageData;
        var prevCaption = queue[ index ].caption || '';
        var popupHTML = `
        <div class="popup" id="caption-popup">
            <div class="picture-preview">
                <img style="max-width: 100%;" src="${pictureData}" />
            </div>
            <div class="list-block">
                <ul>
                    <li class="align-top">
                      <div class="item-content">
                        <div class="item-inner">
                          <div class="item-input">
                              <textarea class="col-100" rows="5" name="" id="caption" placeholder="Add a caption">${prevCaption}</textarea>
                          </div>
                        </div>
                      </div>
                    </li>
                </ul>
            </div>
        </div>
        `;
        var modal = myApp.modal( {
            afterText: `
                <div class="picture-preview">
                    <img style="max-width: 100%;" src="${pictureData}" />
                </div>
                <div class="list-block">
                    <ul>
                        <li class="align-top">
                          <div class="item-content">
                            <div class="item-inner">
                              <div class="item-input">
                                  <textarea class="col-100" rows="5" name="" id="caption" placeholder="Add a caption">${prevCaption}</textarea>
                              </div>
                            </div>
                          </div>
                        </li>
                    </ul>
                </div>
            `,
            buttons: [ {
                    text: 'Cancel'
                },
                {
                    text: 'Remove',
                    onClick: function () {
                        queue.splice( index, 1 );
                        item.remove();
                        var items = $( '.picture-details' );
                        for ( let i = index; i < queue.length; i++ ) {
                            $( items[ i ] ).data( 'index', parseInt( $( items[ i ] ).data( 'index' ) ) - 1 );
                        }

                    }
                },
                {
                    text: 'Save',
                    bold: true,
                    onClick: function () {
                        queue[ index ].caption = $( '#caption' ).val();
                    }
                },
            ]
        } );

    } );
    //input.on( 'change', onSelect );
    $( 'body' ).on( 'modal:closed', toggleDone );

    $( 'body' ).on( 'click', '#upload-all', function ( e ) {
        var num = queue.length;
        var text = `You can add captions to photos by clicking on their thumbnail. If you are ready, tap OK.`;
        var title = `Upload ${num} photos to @${INSTAGRAM_USERNAME}'s Instagram ?`;
        myApp.confirm( text, title, uploadAll );
    } );

    $( '#save-creds' ).on( 'click', function () {
        if ( CREDS ) return;
        var name = $( '#creds-name' ).val();
        var handle = $( '#creds-handle' ).val();
        if ( name === '' && handle === '' ) {
            return myApp.closeModal();
        }
        var obj = {
            name: name,
            handle: handle
        };
        CREDS = obj;
        localStorage.setItem( 'creds', JSON.stringify( obj ) );
        myApp.closeModal();
    } );

} );
