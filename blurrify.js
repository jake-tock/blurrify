const path = require("path");

const defaults = {
  blur: 2,
  gamma: 1.2,
  lvlbp: 0,
  lvlwp: 90,
  attenuate: 2,
  saturation: 150,
  size: "100%",
  white: 0.2,
};

const blurrify = {
  settingsFromRequest(req, assetsPath) {
    const res = {};
    const settings = Object.assign({}, defaults);

    settings.blur = req.body.blur || settings.blur;
    settings.gamma = req.body.gamma || settings.gamma;
    settings.lvlbp = req.body.lvlbp || settings.lvlbp;
    settings.lvlwp = req.body.lvlwp || settings.lvlwp;
    settings.attenuate = req.body.attenuate || settings.attenuate;
    settings.saturation = req.body.saturation || settings.saturation;
    settings.size = req.body.size || settings.size;
    settings.white = req.body.white || settings.white;

    res.extName = path.extname(req.file.originalname).toLowerCase();
    const filename = "result";
    res.path = `${filename}-blur${res.extName}`;
    res.targetPath = path.join(assetsPath, `${filename}${res.extName}`);
    res.destPath = path.join(assetsPath, res.path);

    const blurA = `${settings.blur}%`;
    const blurB = `${100 / settings.blur * 100}%`

    const args = [
      `convert ${res.targetPath}`,
      `-level ${settings.lvlbp}%,${settings.lvlwp}%,${settings.gamma}`,
      `-filter Gaussian -resize ${blurA} -define filter:sigma=2.9 -resize ${blurB} -resize "${settings.size}"`,
      `\\( +clone -resize 50% -attenuate ${settings.attenuate} +noise Gaussian -colorspace gray -alpha on -channel a -evaluate subtract 60% -evaluate multiply ${settings.white} +channel -interpolate Integer -filter point -scale 200% \\)`,
      `-compose over -modulate 100,${settings.saturation},100`,
      `-composite "${res.destPath}"`
    ];
    res.settings = settings;
    res.command = args.join(" ");

    return res;

  }
}

module.exports = blurrify;