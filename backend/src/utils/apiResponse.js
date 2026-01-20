class apiResponse{
    constructor(statusCode,message="Success" , data,more){
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode<400;
        this.more=more;
    }
}

export {apiResponse};