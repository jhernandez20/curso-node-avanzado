'use strct'

exports.isAdmin = function (req,res,next){
    if (req.user.role !== 'ROLE_ADMIN'){
        return res.status(401).send({
        message:'No tienes accesoa esta zona'});
    }
}