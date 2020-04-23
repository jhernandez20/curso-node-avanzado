'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user')
var Animal = require('../models/animal')
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');


function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando controlador de animales',
        user: req.animal
    });
}

function saveAnimal(req, res) {
    var animal = new Animal();
    var params = req.body;

    if (params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;
        animal.save((err, animalStored) => {
            if (err) {
                res.status(500).send({
                    message: 'Error en el sevidor'
                });
            } else {
                if (!animalStored) {
                    res.status(400).send({
                        message: 'no se ha guarado animal'
                    });
                } else {
                    res.status(200).send({
                        message: 'Probando save de animal',
                        user: { animal: animalStored }
                    });
                }
            }
        });
    } else {
        res.status(400).send({
            message: 'Datos incompletos'
        });
    }
}

function getAnimals(req, res) {
    Animal.find({}).populate({ path: 'user' }).exec((err, animals) => {
        if (err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });
        } else {
            if (!animals) {
                res.status(400).send({
                    message: 'No Hay animales'
                });
            } else {
                res.status(200).send({
                    animals
                });
            }
        }
    });
}

function getAnimal(req, res) {
    var animalId = req.params.id;
    Animal.findById(animalId).populate({ path: 'user' }).exec((err, animal) => {
        if (err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });
        } else {
            if (!animal) {
                res.status(400).send({
                    message: 'Animal no hencontrado'
                });
            } else {
                res.status(200).send({
                    animal
                });
            }
        }
    });
}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update, { new: true }, (err, animalUpdate) => {
        if (err) {
            res.status(500).send({
                message: 'Error en la peticion'
            });
        } else {
            if (!updateAnimal) {
                res.status(400).send({
                    message: 'No se ha actualizado el animal'
                });
            } else {
                res.status(200).send({
                    animal: animalUpdate
                });
            }
        }
    });
}

function uplaodImage(req, res) {
    var animalId = req.params.id;
    var filename = 'No subido...';
    console.log(req.files);
    if (req.files) {

        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1].toLowerCase();
        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            Animal.findByIdAndUpdate(animalId, { image: file_name }, { new: true }, (err, animalUpdated) => {
                if (err) {
                    res.status(500).send({
                        message: 'Error al actualizar animal'
                    });
                } else {
                    if (!animalUpdated) {
                        res.status(400).send({
                            message: 'No se puede actualizar el animal'
                        });
                    } else {
                        res.status(200).send({
                            animal: animalUpdated,
                            image: file_name
                        });
                    }
                }
            });
        } else {
            fs.unlink(file_path, (err) => {
                if (err) {
                    return res.status(400).send({
                        message: "Extension no valida y fichero no borrrado"
                    });
                } else {
                    return res.status(400).send({
                        message: "Extension no valida"
                    });
                }
            });
        }
    } else {
        res.status(400).send({
            message: 'no se han subido ficheros'
        });
    }
}

function getImageFiles(req, res) {
    var imagefile = req.params.imageFile;
    var path_file = './uploads/animals/' + imagefile;
    console.log(path_file);
    fs.exists(path_file, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({
                message: 'La imagen no existe'
            });
        }
    });
}

function deleteAnimal(req, res) {
    var animalId = req.params.id;
    Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
        if (err) {
            res.status(500).send({
                message: 'Error'
            });
        } else {
            if (!animalRemoved) {
                res.status(400).send({
                    message: 'Animal no existe'
                });
            } else {
                res.status(200).send({
                    animal: animalRemoved
                });
            }
        }
    })
}

module.exports = {
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uplaodImage,
    getImageFiles,
    deleteAnimal
};