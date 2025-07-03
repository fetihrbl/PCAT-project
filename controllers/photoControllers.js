

const fs = require('fs');
const Photo = require('../models/Photo');
const { match } = require('assert');

//get all Photos

exports.getAllPhotos = async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const photosPerPage = 3;
  
    const totalPhotos = await Photo.countDocuments();
  
    const photos = await Photo.find({})
      .sort('-dateCreated')
      .skip((page - 1) * photosPerPage)
      .limit(photosPerPage);
  
    res.render('index', {
      photos,
      current: page,
      pages: Math.ceil(totalPhotos / photosPerPage),
    });
  
};

//get photo
exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', {
    photo,
  });
};

//create photo
exports.createPhoto = async (req, res) => {
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadeImage = req.files.image;
  let uploadPath = __dirname + '/../public/uploads/' + uploadeImage.name;

  uploadeImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadeImage.name,
    });
    res.redirect('/');
  });
};

//update photo
exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });

  photo.title = req.body.title;
  photo.description = req.body.description;

  photo.save();

  res.redirect(`/photos/${req.params.id}`);
};

//delete photo
exports.deletePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });

  // 1. Fotoğraf dosyasını klasörden sil
  let deletedImagePath = __dirname + '/../public' + photo.image;
  fs.unlinkSync(deletedImagePath);

  // 2. Veritabanından sil
  await Photo.findByIdAndDelete(req.params.id);

  // 3. Anasayfaya yönlendir
  res.redirect('/');
};
