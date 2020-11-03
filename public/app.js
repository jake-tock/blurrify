const server = 'http://localhost:8463';
const reqPath = (path) => `${server}/${path}`;

const command = document.getElementById('command');
const resultUrl = document.getElementById('result-url');
const imgPreview = document.getElementById('preview');
const imgResult = document.getElementById('result');
const inputFile = document.querySelector('[name="file"]');
const formBlur = document.getElementById('form-blur');
const formCrop = document.getElementById('form-crop');
const formUpload = document.getElementById('form-upload');
const size = document.querySelector('[name="size"]');
const sizePresets = document.getElementById('size-presets');
const cropGravity = document.getElementById('gravity');
const cropInput = document.getElementById('crop');

let queuedBlur = false;
let blurring = false;

const blurInputs = document.querySelectorAll('#form-blur input');
blurInputs.forEach((input) => input.addEventListener('input', queueBlur));

const cropInputs = document.querySelectorAll('#form-crop select');
cropInputs.forEach((input) => input.addEventListener('change', crop));

size.addEventListener('change', (e) => (sizePresets.value = size.value));
sizePresets.addEventListener('change', (e) => (size.value = sizePresets.value));

inputFile.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    document.body.classList.add('has-file');
    const fr = new FileReader();
    fr.onload = () => (imgPreview.src = fr.result);
    fr.readAsDataURL(e.target.files[0]);
    upload();
  } else {
    document.body.classList.remove('has-file');
  }
  cropInput.value = 'original';
  cropGravity.value = 'Center';
});

resultUrl.addEventListener('click', (e) => {
  if (resultUrl.href === '#') e.preventDefault();
});

formUpload.addEventListener('submit', (e) => {
  e.preventDefault();
  upload();
});
formBlur.addEventListener('submit', (e) => {
  e.preventDefault();
  blur();
});
formCrop.addEventListener('submit', (e) => {
  e.preventDefault();
  crop();
});

function upload() {
  document.body.classList.add('loading');
  imgResult.src = '';
  if (!inputFile.files[0]) {
    document.body.classList.remove('loading');
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open('POST', reqPath('upload'), true);
  xhr.send(new FormData(formUpload));
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      handleRequestSuccess(JSON.parse(this.response));
      blur();
    } else if (this.readyState === XMLHttpRequest.DONE) {
      handleRequestFail(this.response);
    }
  };
}

function blur() {
  blurring = true;
  queuedBlur = false;
  document.body.classList.add('loading');
  const formData = new FormData(formBlur);
  const data = Object.fromEntries(formData);
  axios
    .post(reqPath('blur'), data)
    .then((res) => {
      if (queuedBlur) blur();
      else {
        blurring = false;
        handleRequestSuccess(res.data);
      }
    })
    .catch(handleRequestFail);
}

function crop() {
  document.body.classList.add('loading');
  const formData = new FormData(formCrop);
  const data = Object.fromEntries(formData);
  axios
    .post(reqPath('crop'), data)
    .then(() => blur())
    .catch(handleRequestFail);
}

function handleRequestFail(response) {
  console.error(response);
  document.body.classList.remove('loading');
}
function handleRequestSuccess(response) {
  imgResult.src = reqPath(`${response.blur}?a=${Date.now()}`);
  resultUrl.href = reqPath(response.blur);
  resultUrl.setAttribute('download', true);
  document.body.classList.remove('loading');
}

function queueBlur() {
  if (blurring) queuedBlur = true;
  else if (!queuedBlur) blur();
}
