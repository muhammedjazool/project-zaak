


const isLogged = ((req,res,next)=>{
    next()
// try {
//     if(req.session.admin){
//         next()
//     }
//     else{
//         res.redirect('/admin')
//     }
// } catch (error) {
//     console.log(error);
// }
})

module.exports ={
    isLogged
}