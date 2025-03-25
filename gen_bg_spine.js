#!/usr/bin/env node

// 生成27位随机hash的函数
function generateRandomHash() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/";
  let result = "";
  for (let i = 0; i < 27; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const createJSON = (w, h) => {
  const x = (w / 2) * -1;
  const y = (h / 2) * -1;

  const jsonFile = `
{
"skeleton": {
	"hash": "${generateRandomHash()}",
	"spine": "3.8.99",
	"x": ${x},
	"y": ${y},
	"width": ${w},
	"height": ${h},
	"images": "",
	"audio": ""
},
"bones": [
	{ "name": "root" },
	{ "name": "bone", "parent": "root" }
],
"slots": [
	{ "name": "full-ng", "bone": "bone", "attachment": "full-ng" }
],
"skins": [
	{
		"name": "default",
		"attachments": {
			"full-ng": {
				"full-ng": { "width": ${w}, "height": ${h} }
			}
		}
	}
],
"animations": {
	"idle": {}
}
}
`;
  return jsonFile;
};

const createAtlas = (bgName, w, h) => {
  return `
${bgName}
size: 2048,1024
format: RGBA8888
filter: Linear,Linear
repeat: none
full-ng
  rotate: false
  xy: 1, 1
  size: ${w}, ${h}
  orig: ${w}, ${h}
  offset: 0, 0
  index: 0

`;
};

// 获取命令行参数
const args = process.argv.slice(2);

// 创建参数对象
const params = {
  image: null,
};

// 解析参数
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "-i":
      if (i + 1 < args.length) {
        params.image = args[i + 1];
        i++;
      }
      break;
    default:
      params.image = args[i];
      break;
  }
}

// 检查必要参数
if (params.image === null) {
  console.error("请提供图片名参数： -i <图片名>");
  process.exit(1);
}

// 引入所需模块
const fs = require("fs");
const path = require("path");
const { imageSizeFromFile } = require("image-size/fromFile");

async function main() {
  const imageFile = params.image;
  const dimensions = await imageSizeFromFile(imageFile);

  const width = dimensions.width;
  const height = dimensions.height;

  const jsonText = createJSON(width, height);
  const atlasText = createAtlas(imageFile, width, height);

  const name = imageFile.split(".")[0];

  // 定义文件夹名称和文件路径
  const folderName = name;
  const jsonPath = path.join(__dirname, folderName, `${name}.json`);
  const atlasPath = path.join(__dirname, folderName, `${name}.atlas`);
  const sourceImgPath = path.resolve(imageFile);
  const destImgPath = path.join(__dirname, folderName, imageFile);

  fs.mkdir(folderName, { recursive: true }, (err) => {
    // 写入JSON文件
    fs.writeFile(jsonPath, jsonText, (err) => {
      if (err) {
        console.error("写入文件时出错:", err);
        process.exit(1);
      }
      console.log("JSON 文件已成功生成");
    });

    fs.writeFile(atlasPath, atlasText, (err) => {
      if (err) {
        console.error("写入文件时出错:", err);
        process.exit(1);
      }
      console.log("atlas 文件已成功生成");
    });
    fs.copyFile(sourceImgPath, destImgPath, (err) => {
      if (err) {
        console.error("复制文件时出错:", err);
        process.exit(1);
      }
      console.log("图片文件已成功复制");
    });
  });
}
main();
