


const isLogged = ((req,res,next)=>{
try {
    if(req.session.admin){
        next()
    }
    else{
        res.redirect('/admin')
    }
} catch (error) {
    console.log(error);
}
})

module.exports ={
    isLogged
}