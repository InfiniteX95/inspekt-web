// FFmpegWASM
const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;
let ffmpeg = null;

// File info
var filename = '';
var title = '';
var artist = '';
var album = '';

const show_spectrogram = async ({ target: { files } }) => {
    // Progress indicators
    const progress_info = document.getElementById('progress-information');
    const progress_spectrogram = document.getElementById('progress-spectrogram');

    // Images and buttons
    const spectrogram_image = document.getElementById('output-image');
    const spectrogram_button = document.getElementById('download_btn');
    const album_art_image = document.getElementById('album-art');

    // Fields
    const filename_field = document.getElementById('filename-field');
    const title_field = document.getElementById('title-field');
    const artist_field = document.getElementById('artist-field');
    const album_field = document.getElementById('album-field');

    // Hide content before processing the new file
    spectrogram_image.style.display = 'none';
    spectrogram_button.style.display = 'none';
    album_art_image.style.display = 'none';

    // Flush data before processing the new file
    title = '';
    artist = '';
    album = '';
    title_field.innerHTML = title;
    artist_field.innerHTML = artist;
    album_field.innerHTML = album;

    // Show output cards
    document.getElementById('output').style.display = '';

    // Show progress indicators
    progress_info.style.display = 'inline-flex';
    progress_spectrogram.style.display = 'inline-flex';

    // Update filename
    filename = files[0].name;
    filename_field.innerHTML = filename;

    // FFmpeg instantiation and initialization
    if (ffmpeg === null) {
        ffmpeg = new FFmpeg();

        ffmpeg.on("log", ({ message }) => {
            console.log(message);

            // Filling fields with information from ffmpeg processing logs
            if(message.toUpperCase().includes("ALBUM ") && album === ''){
              console.log("Album is : " + message.substring(message.indexOf(":") + 2));
              album = message.substring(message.indexOf(":") + 2);
            }

            if(message.toUpperCase().includes("TITLE ") && title === ''){
              console.log("Title is : " + message.substring(message.indexOf(":") + 2));
              title = message.substring(message.indexOf(":") + 2);
            }

            if(message.toUpperCase().includes("ARTIST ") && artist === ''){
              console.log("Artist is : " + message.substring(message.indexOf(":") + 2));
              artist = message.substring(message.indexOf(":") + 2);
            }
        })

        /*
        ffmpeg.on("progress", ({ progress, time }) => {

        });
        */

        // FFmpeg core loading
        await ffmpeg.load({
            coreURL: "../../../core/dist/umd/ffmpeg-core.js",
        });
    }

    const { name } = files[0];
    await ffmpeg.writeFile(name, await fetchFile(files[0]));

    // Delete old album art
    try{
        await ffmpeg.deleteFile('cover.jpg');
    } catch(error) {
        console.log('cover.jpg does not exist');
    }

    // Getting album art and informations
    console.time('exec');
    await ffmpeg.exec(['-i', name, '-an', '-vcodec', 'copy', '-frames:v', '1' , '-update', '1', 'cover.jpg']);
    console.timeEnd('exec');

    progress_info.style.display = 'none';

    // Update cover info if available
    try{
        const album_art_data = await ffmpeg.readFile('cover.jpg');

        album_art_image.src = URL.createObjectURL(new Blob([album_art_data.buffer], { type: 'image/jpg' }));

        album_art_image.style.display = 'inline-flex';
    } catch(error) {
        console.error(error);
        console.log('No album art, skipping ...');
    }

    // Update title, artist name and album name
    title_field.innerHTML = title;
    artist_field.innerHTML = artist;
    album_field.innerHTML = album;

    // Getting spectrogram
    console.time('exec');
    await ffmpeg.exec(['-i', name, "-lavfi", "showspectrumpic=s=640x480", 'spectrogram.png']);
    console.timeEnd('exec');

    // Update and display spectrogram
    const spectrogram_data = await ffmpeg.readFile('spectrogram.png');

    progress_spectrogram.style.display = 'none';

    spectrogram_image.src = URL.createObjectURL(new Blob([spectrogram_data.buffer], { type: 'image/png' }));

    spectrogram_image.style.display = 'flex';

    // Display the download button
    document.getElementById('download_btn').style.display = 'inline-flex';
}

function uploadButton(){
    // Create an invisible file input element with audio and video filetype filter
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,video/*';
    // Add a change event listener to the element and simulate change with a click
    input.addEventListener('change', show_spectrogram);
    input.click();
    // Remove the useless element
    input.remove();
}

function dropHandler(ev){
    console.log("File(s) dropped");

    // Prevent the file from being opened
    ev.preventDefault();

    // Check if the dropped item is a file
    if(ev.dataTransfer.items){
        if(ev.dataTransfer.items[0].kind === "file"){
            let files = ev.dataTransfer.files;

            // Filetype filter
            if(files[0].type.match('audio/*') || files[0].type.match('video/*')){
                // Create an invisible file input element and set its files to dropped ones
                let input = document.createElement('input');
                input.type = 'file';
                input.files = files;
                // Add and trigger a change event
                input.addEventListener('change', show_spectrogram);
                input.dispatchEvent(new Event('change'));
                // Remove the useless element
                input.remove();
            }
        }
    }
}

function downloadSpectrogramButton(){
    // Get the image container
    var image = document.getElementById('output-image');
    // Create an invisible anchor element with download prop
    var save_img = document.createElement('a');
    save_img.href = image.src;
    save_img.download = filename.substring(0, filename.lastIndexOf('.')) + '.png';
    // Simulate click to initiate download
    save_img.click();
    // Remove the useless element
    save_img.remove();
}

function setDialogState(bool){
    // Get the dialog
    var dialog = document.getElementById('info-dialog');
    // Show or hide according to bool value
    if(bool){
        dialog.show();
    } else {
        dialog.close();
    }
}

// Add events for drop page opacity
document.addEventListener('DOMContentLoaded', function () {
    // Get the element
    const dshadow = document.getElementById('drop-shadow');

    document.body.addEventListener('dragover', function (ev) {
        ev.preventDefault();
        dshadow.style.background = 'rgba(0, 0, 0, 0.5)';
    });

    document.body.addEventListener('dragenter', function () {
        dshadow.style.background = 'rgba(0, 0, 0, 0.5)';
    });

    document.body.addEventListener('dragleave', function () {
        dshadow.style.background = 'rgba(0, 0, 0, 0)';
    });

    document.body.addEventListener('drop', function (ev) {
        dshadow.style.background = 'rgba(0, 0, 0, 0)';
        dropHandler(ev);
    });
});
