import {
  getNumberOfAssets,
  getAssetStats,
  getImage,
  getAssetsIpfs,
} from 'services/ethereumService';

import utils from 'services/utils';
import config from 'config/config.json';
import * as helpers from 'services/helpers';

const digitalPrintImageContractAddress = config.digitalPrintImageContract.networks['42'].address;
const digitalPrintImageContract = () => new web3.eth.Contract(config.digitalPrintImageContract.abi, digitalPrintImageContractAddress);

const assetManagerContractAddress = config.assetManagerContract.networks['42'].address;
const assetManagerContract = () => new web3.eth.Contract(config.assetManagerContract.abi, assetManagerContractAddress);

const DELAY = 150;

export const createImage = async (randomHashIds, timestamp, iterations, potentialAssets, author, account, price, ipfsHash) => {
  potentialAssets = utils.encode(potentialAssets);

  timestamp = parseInt(timestamp, 10);
  iterations = parseInt(iterations, 10);
  try {
    console.log(randomHashIds, timestamp, iterations, potentialAssets, author, ipfsHash, price);
    return await digitalPrintImageContract().methods.createImage(randomHashIds, timestamp, iterations, potentialAssets, author, ipfsHash).send({
      value: parseInt(price),
      from: account,
      to: digitalPrintImageContractAddress,
    }, (a, b) => {
      console.log(a, b);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Cannot create image');
  }
};

export const createAsset = async (attributes, ipfsHash, price, account) => {
  console.log('Price: ' + price);
  console.log('Ipfs hash: ' + ipfsHash);
  console.log('Attributes: ' + attributes);
  console.log('Account: ' + account);

  try {
    return await assetManagerContract().methods.createAsset(attributes, ipfsHash, price).send({
      from: account
    }, (a, b) => {
      console.log(a, b);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Cannot create asset');
  }
};

export const createAssetPack = async (coverImage, name, attributes, ipfsHashes, price, account) => {
  try {
    return await assetManagerContract().methods.createAssetPack(coverImage, name, attributes, ipfsHashes, web3.utils.toWei(price)).send({
      from: account
    }, (a, b) => {
      console.log(a, b);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Cannot create asset pack');
  }
};

export const loadDataForAssets = async () => {
  return new Promise(async (resolve, reject) => {
    let assets = parseInt(await getNumberOfAssets(), 10);
    const promises = [];
    for (let i = 0; i < assets; i++) {
      let promise = getAssetStats(i);
      promises.push(promise);
    }

    Promise.all(promises)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(new Error('Couldn\'t load all data.'));
      });
  });
};

export const getSize = (width, height, ratio) => {
  const MAX_HEIGHT = 3508;
  const MAX_WIDTH = 2480;
  if (ratio === '1:1') {
    if (height > MAX_WIDTH) height = MAX_WIDTH;
    return {
      width: height,
      height,
      canvasWidth: MAX_WIDTH,
      canvasHeight: MAX_WIDTH,
    };
  }
  if (ratio === '2:3') {
    if (height > MAX_HEIGHT) height = MAX_HEIGHT;

    width = (height * 10) / 14;

    return {
      width: width,
      height,
      canvasWidth: MAX_WIDTH,
      canvasHeight: MAX_HEIGHT,
    };
  }
};

export const getData = async (randomSeed, iterations, potentialAssets, allAssets) => {
  console.log(randomSeed);
  let assets = await getImage(randomSeed, iterations, potentialAssets);
  let allDataAboutAsset = [];
  for (let i = 0; i < assets.length; i++) {
    let stats = allAssets[assets[i]];
    let final = { ...assets[i], ...stats };
    allDataAboutAsset.push(final);
  }
  return allDataAboutAsset;
};

const drawFrame = (context, canvasHeight, canvasWidth, frame) => {
  const { left, right, bottom, top } = frame;

  context.strokeStyle = '#FFF';
  context.beginPath();
  context.moveTo(left / 2, 0);
  context.lineWidth = left;
  context.lineTo(left / 2, canvasHeight);
  context.stroke();

  context.beginPath();
  context.moveTo(canvasWidth - right / 2, canvasHeight);
  context.lineWidth = right;
  context.lineTo(canvasWidth - right / 2, 0);
  context.stroke();

  context.beginPath();
  context.moveTo(canvasWidth, top / 2);
  context.lineWidth = top;
  context.lineTo(0, top / 2);
  context.stroke();
};

const drawBottomFrame = (context, canvasHeight, canvasWidth, frame) => {
  let { bottom, left } = frame;

  context.strokeStyle = '#FFF';
  context.beginPath();
  context.moveTo(0, canvasHeight - bottom / 2);
  context.lineWidth = bottom;
  context.lineTo(canvasWidth, canvasHeight - bottom / 2);
  context.stroke();

  let image = new Image();
  image.src = require(`assets/cg-logo.png`);

  image.onload = () => {
    const verticalAlign = canvasHeight - bottom / 2 - image.height / 2;
    const leftAlign = left;

    context.drawImage(image, leftAlign, verticalAlign, image.width, image.height);
  };
  image.onerror = (err) => console.error(err);
};

const drawLoadedImage = async (context, asset, canvasWidth, canvasHeight, frame, index, delayTime) => {
  let x = asset.x_coordinate % canvasWidth;
  let y = asset.y_coordinate % canvasHeight;
  let rotation = asset.rotation;
  if (delayTime > 0) {
    await delay(delayTime * index);
  }
  drawImageRot(
    context,
    asset.image,
    x,
    y,
    asset.image.width,
    asset.image.height,
    rotation,
    { isBackground: asset.isBackground, canvasWidth, canvasHeight });
};

export const makeCoverImage = (isHome, image_paths, c, width, height, frame = {
  left: 0,
  right: 0,
  bottom: 0,
  top: 0
}) => {
  let context = c.getContext('2d');
  const { left, right, bottom, top } = frame;
  const canvasHeight = height;
  const canvasWidth = width;
  width = width - left - right;
  height = height - top - bottom;
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  let images = [];
  for (let i = 0; i < image_paths.length; i++) {
    let image = new Image();

    image.src = image_paths[i];
    image.width = 90;
    image.height = 90;
    image.crossOrigin = 'Anonymous';
    images.push({
      image: image,
      x_coordinate: Math.floor(Math.random() * 350),
      y_coordinate: Math.floor(Math.random() * 350),
      rotation: Math.floor(Math.random() * 360),
      scale: 800 + Math.floor(Math.random() * 200)
    });
  }

  let imagesLoaded = 0;

  for (let j = 0; j < images.length; j++) {
    console.log(images[j].image);
    images[j].image.onload = function () {
      imagesLoaded++;
      let x = images[j].x_coordinate % canvasWidth;
      let y = images[j].y_coordinate % canvasHeight;
      let rotation = images[j].rotation;
      drawImageRot(context, images[j].image, x, y, width / 4, height / 4, rotation);
      if (imagesLoaded === images.length && frame.shouldDrawFrame) {
        // WRITE FRAME
        drawFrame(context, canvasHeight, canvasWidth, frame);
      }
    };
  }
};

const delay = async (delayInms) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
};

export const scaleImage = (width, height, canvasWidth, canvasHeight, ratio) => {
  const DEFAULT_WIDTH = 2480;
  const DEFAULT_HEIGHT = ratio === '2:3' ? 3508 : 2480;

  const horizontalRatio = DEFAULT_WIDTH / canvasWidth;
  const verticalRatio = DEFAULT_HEIGHT / canvasHeight;

  return {
    width: width / horizontalRatio,
    height: height / verticalRatio,
  };
};

export const makeImage = (objs, c, width, height, frame = {
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  ratio: '2:3'
}, delay = DELAY) =>
  new Promise(async (resolve, reject) => {
    let assets = [...objs];
    let context = c.getContext('2d');
    const { left, right, bottom, top } = frame;
    const canvasHeight = height;
    const canvasWidth = width;
    width = width - left - right;
    height = height - top - bottom;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    if (assets.length === 0) return resolve('No assets provided.');

    let hashes = await getAssetsIpfs(assets);
    for (let i = 0; i < objs.length; i++) {
      let image = new Image();
      let val = assets[i].id;
      if (val < 10) {
        val = '0' + val;
      }

      image.src = 'http://ipfs.decenter.com/ipfs/' + hashes[i];
      image.crossOrigin = 'Anonymous';

      assets[i] = {
        ...assets[i],
        background: objs[i].background,
        isBackground: objs[i].background === '122',
        image,
      };
    }
    assets = helpers.sortBy(assets, 'background');

    let imagesLoaded = 0;

    for (let i = 0; i < assets.length; i++) {
      assets[i].image.onload = async () => {
        waitForBackgroundLoad(assets, async () => {
          await drawLoadedImage(context, assets[i], canvasWidth, canvasHeight, frame, i, delay);
          imagesLoaded++;

          if (imagesLoaded === assets.length) {
            console.log('All assets loaded.');
            resolve({ message: 'Success' });

            drawBottomFrame(context, canvasHeight, canvasWidth, frame);

            if (frame.shouldDrawFrame) {
              // DRAW FRAME
              drawFrame(context, canvasHeight, canvasWidth, frame);
            }
          }
        });
      };
      assets[i].image.onerror = () => {
        reject('One of the images failed to load.');
      };
    }
  });

const imgLoaded = (img) => img.complete && img.naturalHeight !== 0;

const waitForBackgroundLoad = (images, cb) => {
  const interval = setInterval(() => {
    let backgrounds = images.filter(image => image.isBackground);
    for (let i = 0; i < backgrounds.length; i++) {
      if (!imgLoaded(backgrounds[i].image)) return;
    }
    cb();
    clearInterval(interval);
  }, 300);
};

export const drawImageRot = (context, img, x, y, width, height, deg, options) => {
  const coords = {
    x: width / 2 * (-1),
    y: height / 2 * (-1)
  };

  if (options && options.isBackground) {
    context.drawImage(img, 0, 0, options.canvasWidth, options.canvasHeight);
    return;
  }

  //Convert degrees to radian
  const rad = deg * Math.PI / 180;

  //Set the origin to the center of the image
  context.translate(x, y);

  //Rotate the canvas around the origin
  context.rotate(rad);

  //draw the image
  context.drawImage(img, coords.x, coords.y, width, height);

  //reset the canvas
  context.rotate(rad * (-1));

  //
  context.translate((x) * (-1), (y) * (-1));
};

// let randomSeed = 123123;
// let iterations = 5;
// let potentialAssets = [1,2,3,4,5,6,7,8,9,10,11];
// potentialAssets = utils.encode(potentialAssets);

async function test() {
  // let x = await loadDataForAssets();
  // console.log(x);
  ipfsHashes = ['QmUJeMmc2jETHdTUfCQyK27bMhSfoAFfRpQuX5RpVN2gHf',
    'QmQKJdkbGEsiav3vdzK8pTH5WoNXCoXN8VbZLrFoWjmPwR',
    'Qmd9VNGsVST4y4ZLz5rQtLMxDb2HhJwutAfQ5Et5MoAA7z',
    'QmaL8YXHZA2aayApzaAeeV7RDJXAf5ZvqCbPraQkgdkTSh',
    'QmPNSue3FwTVeYsYrDtMBPWWofFQCtP72C3m8vtYS3xEAu'];

  for (let i = 0; i < ipfsHashes.length; i++) {
    ipfsHashes[i] = utils.getBytes32FromIpfsHash(ipfsHashes[i]);
  }
  console.log(ipfsHashes);
  await createAssetPack(ipfsHashes, 2000, '0xf67cDA56135d5777241DF325c94F1012c72617eA');
}

// test();