//this is promises method
const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch
        ((err)=>next(err))
    }
}



export {asyncHandler}

/*
const asyncHandler = ()=>{}
const asyncHandler = (func) => {()=>}  //higher order funct => which can accept function as a parameter 
                                         and can return function as a param
const asyncHandler = (func) => async ()=>{}
*/

//this is try and catch method

//next IS USED WHEN WE USE MIIDDLEWARES......next act as a flag when one middleware task is complete then another middleware start working
/*const asyncHandler = (fn) => async(req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            succesee:false,
            message:err.message
        })
    }
}
    */