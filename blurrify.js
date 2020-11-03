const path = require('path');

const defaults = {
  blur: 2,
  gamma: 1.2,
  lvlbp: 0,
  lvlwp: 90,
  attenuate: 2,
  saturation: 150,
  size: '100%',
  white: 0.2,
};

class Blurrify {
  constructor(assetsPath) {
    this.assetsPath = assetsPath;
  }

  initialize(file) {
    this.extension = path.extname(file.originalname).toLowerCase();
    const filename = 'result';
    this.blurName = `${filename}-blur${this.extension}`;
    this.cropName = `${filename}-crop${this.extension}`;
    this.sourceName = `${filename}${this.extension}`;
    this.blurPath = path.join(this.assetsPath, this.blurName);
    this.cropPath = path.join(this.assetsPath, this.cropName);
    this.sourcePath = path.join(this.assetsPath, this.sourceName);
  }

  blur(req) {
    const $ = { ...defaults, ...req.body };
    const blurA = `${$.blur}%`;
    const blurB = `${(100 / $.blur) * 100}%`;

    const args = [
      `convert ${this.cropPath}`,
      `-level ${$.lvlbp}%,${$.lvlwp}%,${$.gamma}`,
      `-filter Gaussian -resize ${blurA} -define filter:sigma=2.9 -resize ${blurB} -resize "${$.size}"`,
      `\\( +clone -resize 50% -attenuate ${$.attenuate} +noise Gaussian -colorspace gray -alpha on -channel a -evaluate subtract 60% -evaluate multiply ${$.white} +channel -interpolate Integer -filter point -scale 200% \\)`,
      `-compose over -modulate 100,${$.saturation},100`,
      `-composite "${this.blurPath}"`,
    ];
    return args.join(' ');
  }

  response() {
    return { blur: this.blurName, crop: this.cropName, source: this.sourceName };
  }

  isImage() {
    return this.extension === '.png' || this.extension === '.jpg';
  }
}

module.exports = Blurrify;
