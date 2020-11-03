const server = 'http://localhost:8463';
const reqPath = (path) => `${server}/${path}`;

const command = document.getElementById('command');
const resultUrl = document.getElementById('result-url');
const imgPreview = document.getElementById('preview');
const imgResult = document.getElementById('result');
const inputFile = document.querySelector('[name="file"]');
const formUpload = document.getElementById('form-upload');
const formBlur = document.getElementById('form-blur');
const size = document.querySelector('[name="size"]');
const sizePresets = document.getElementById('size-presets');

const watchedInputs = document.querySelectorAll('input[type="text"],input[type="number"]');
watchedInputs.forEach((input) => input.addEventListener('input', handleOnInput));

function handleOnInput(e) {
  blur();
}

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
});

formUpload.addEventListener('submit', (e) => {
  e.preventDefault();
  upload();
});
formBlur.addEventListener('submit', (e) => {
  e.preventDefault();
  blur();
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
    } else if (this.readyState === XMLHttpRequest.DONE) {
      handleRequestFail(this.response);
    }
  };
}

function blur() {
  document.body.classList.add('loading');
  const formData = new FormData(formBlur);
  const data = Object.fromEntries(formData);
  axios
    .post(reqPath('blur'), data)
    .then((res) => handleRequestSuccess(res.data))
    .catch(handleRequestFail);
}

function handleRequestFail(response) {
  console.error(response);
  document.body.classList.remove('loading');
}
function handleRequestSuccess(response) {
  imgResult.src = reqPath(`${response.blur}?a=${Date.now()}`);
  resultUrl.href = reqPath(response.blur);
  document.body.classList.remove('loading');
}
