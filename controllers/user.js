'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user')
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');


function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando controlador usuarios',
        user: req.user
    });
}

function saveUser(req, res) {
    var user = new User();
    var params = req.body;
    if (params.password && params.name && params.surname && params.email) {
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;
        User.findOne({ email: user.email.toLowerCase() }, (err, issetUser) => {
            if (err) {
                res.status(500).send({ message: "Error al comprobar usuario" })
            } else {
                if (!issetUser) {
                    bcrypt.hash(params.password, null, null, function (err, hash) {
                        user.password = hash;
                        console.log(hash);
                        user.save((err, userStored) => {
                            if (err) {
                                res.status(500).send({ message: "Error al guardar." });
                            } else {
                                if (!userStored) {
                                    res.status(404).send({ message: "No se ha registrado el usuario." });
                                } else {
                                    res.status(200).send({ user: userStored });
                                }
                            }
                        });
                    });

                } else {
                    res.status(400).send({
                        message: 'Usuario ya existe'
                    });
                }
            }
        })
    } else {
        res.status(400).send({
            message: 'Introduce los datos correctamente para poder registrar al usuario'
        });
    }
}

function login(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: "Error al comprobar usuario" })
        } else {
            if (user) {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {
                        if (params.gettoken) {
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({
                                user
                            });
                        }
                    } else {
                        res.status(401).send({
                            message: 'El usuario no ha podido logearse'
                        });
                    }
                });
            } else {
                res.status(401).send({
                    message: 'El Usuario no ha podido logearse'
                });
            }
        }
    });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub) {
        res.status(401).send({
            message: 'No tiene permiso para actualizar el usuario'
        });
    }
    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
        if (err) {
            res.status(500).send({
                message: 'Error al actualizar usuario'
            });
        } else {
            if (!userUpdate) {
                res.status(400).send({
                    message: 'No se puede actualizar usuario'
                });
            } else {
                res.status(200).send({
                    user: userUpdate
                });
            }
        }
    });
}

function uplaodImage(req, res) {
    var userId = req.params.id;
    var filename = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1].toLowerCase();
        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            if (userId != req.user.sub) {
                res.status(401).send({
                    message: 'No tiene permiso para actualizar el usuario'
                });
            }
            User.findByIdAndUpdate(userId, {image: file_name}, { new: true }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({
                        message: 'Error al actualizar usuario'
                    });
                } else {
                    if (!userUpdated) {
                        res.status(400).send({
                            message: 'No se puede actualizar usuario'
                        });
                    } else {
                        res.status(200).send({
                            user: userUpdated,
                            image:file_name
                        });
                    }
                }
            });
        } else {
            fs.unlink(file_path, (err) =>{
                if(err){
                    return res.status(400).send({
                        message: "Extension no valida y fichero no borrrado"
                    });

                }else{
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

function getImageFiles(req, res){
    var imagefile = req.params.imageFile;
    var path_file = './uploads/users/' +imagefile;
    fs.exists(path_file, function (exists){
        if(exists){
            res.sendFile(path.resolve(path_file));

        }else{
            res.status(404).send({
                message: 'La imagen no existe'
            });

        }
    });
}

function getKeepers (req,res){
    User.find({role:'ROLE_ADMIN'}).exec((err,users)=> {
        if (err){
            res.status(500).send({
                message: 'Error en la peticion'
            });
        }else{
            if(!users){
                res.status(400).send({
                    message: 'No hay cuidadores'
                });
            }else{
                res.status(200).send({
                    users: users
                });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uplaodImage,
    getImageFiles,
    getKeepers
};