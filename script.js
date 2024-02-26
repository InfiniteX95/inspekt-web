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

    // Hide content before processing the new file
    spectrogram_image.style.display = 'none';
    spectrogram_button.style.display = 'none';

    // Flush data before processing the new file
    title = '';
    artist = '';
    album = '';

    // Show progress indicators
    progress_info.style.diplay = 'inline-flex';
    progress_spectrogram.style.display = 'inline-flex';

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

    // Update filename
    filename = files[0].name;
    document.getElementById('filename-field').innerHTML = filename;

    // Getting album art and informations
    console.time('exec');
    await ffmpeg.exec(['-i', name, '-an', '-vcodec', 'copy', 'cover.jpg']);
    console.timeEnd('exec');

    // Update cover info if available
    try{
        const album_art_data = await ffmpeg.readFile('cover.jpg');

        progress_info.style.display = 'none';

        album_art_image.src = URL.createObjectURL(new Blob([album_art_data.buffer], { type: 'image/jpg' }));
    } catch(error){
        console.error(error);
        console.log('No album art, skipping ...');
    }

    // Update title, artist name and album name
    document.getElementById('title-field').innerHTML = title;
    document.getElementById('artist-field').innerHTML = artist;
    document.getElementById('album-field').innerHTML = album;

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

function uploadButton() {
    let input = document.createElement('input');
    input.type = 'file';
    let files = Array.from(input.files);
    input.addEventListener('change', show_spectrogram);
    input.click();
    input.remove();
}

function downloadSpectrumButton(){
    var image = document.getElementById('output-image');
    var save_img = document.createElement('a');
    save_img.href = image.src;
    save_img.download = filename.substring(0, filename.lastIndexOf('.')) + '.png';
    save_img.click();
    save_img.remove();
}
