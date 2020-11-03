const server = 'http://localhost:8463';
const reqPath = (path) => `${server}/${path}`;

const command = document.getElementById('command');
const resultUrl = document.getElementById('result-url');
const imgPreview = document.getElementById('preview');
const imgResult = document.getElementById('result');
const inputFile = document.querySelector('[name="file"]');
const formUpload = document.getElementById('upload');
const size = document.querySelector('[name="size"]');
const sizePresets = document.getElementById('size-presets');

size.addEventListener('change', (e) => {
  sizePresets.value = size.value;
});
sizePresets.addEventListener('change', (e) => {
  size.value = sizePresets.value;
});

inputFile.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    formUpload.classList.add('has-file');
    const fr = new FileReader();
    fr.onload = () => (imgPreview.src = fr.result);
    fr.readAsDataURL(e.target.files[0]);
    process();
  } else {
    formUpload.classList.remove('has-file');
  }
});

formUpload.addEventListener('submit', (e) => {
  e.preventDefault();
  process();
});

function process() {
  document.body.classList.add('loading');
  imgResult.src = '';
  if (!inputFile.files[0]) {
    document.body.classList.remove('loading');
    return;
  }
  const formData = new FormData(formUpload);
  const xhr = new XMLHttpRequest();
  xhr.open('POST', reqPath('upload'), true);
  xhr.send(formData);
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      const response = JSON.parse(this.response);
      handleResponse(response);
    } else if (this.readyState === XMLHttpRequest.DONE) {
      console.error(this.response);
      document.body.classList.remove('loading');
    }
  };
}

function handleResponse(response) {
  imgResult.src = reqPath(`${response.path}?a=${Date.now()}`);
  resultUrl.href = reqPath(response.path);
  document.body.classList.remove('loading');
}
