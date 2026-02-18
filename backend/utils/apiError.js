
class ApiError extends Error{
    constructor (
        statusCode,
        message="Something went wrong",
        errors=[],
        stack="" // contains the  string of error 
    ){
        super(message) // we can definately change the message
        this.statusCode=statusCode
        this.data=null
        this.success=false; // ye nahi jaega kyuki hum api error handle kar rahe hai na ki api response ko
        this.message=message
        this.stack=stack
        this.errors=errors
        
        // for production grade but  jada jarurat nahi hai we can skip this 
        if(stack){
            this.stack=stack
        } else {
            Error.captureStackTrace(this,this.constructor)
        }

    } 
}


export  {ApiError};