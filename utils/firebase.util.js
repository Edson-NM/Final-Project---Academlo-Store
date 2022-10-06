const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getStorage, getDownloadURL, ref } = require('firebase/storage');

dotenv.config({ path: './config.env' });

const firebaseConfig = {
	apiKey: process.env.FIREBASE_APP_KEY,
	// authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	// messagingSenderId: process.env.FIREBASE_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const getProductImgs = async products => {
	const productImgsWithPromises = products.map(async product => {
		const productImgsPromises = product.productImgs.map(async productImg => {
			const imgRef = ref(storage, productImg.imgUrl);
			const imgUrl = await getDownloadURL(imgRef);

			productImg.imgUrl = imgUrl;
			return productImg;
		});

		const productImgs = await Promise.all(productImgsPromises);

		product.productImgs = productImgs;

		return product;
	});

	return await Promise.all(productImgsWithPromises);
};

const getProductImgsById = async productImgs => {
	// console.log(productImgs.map(productImg => productImg.imgUrl));
	const productImgsWithPromises = productImgs.map(async productImg => {
		const imgRef = ref(storage, productImg.imgUrl);
		const imgUrl = await getDownloadURL(imgRef);
		productImg.imgUrl = imgUrl;
		return productImg;
	});
	const productImgsResult = await Promise.all(productImgsWithPromises);
	productImgs = productImgsResult;
	return productImgs;
};

module.exports = { storage, getProductImgs, getProductImgsById };
