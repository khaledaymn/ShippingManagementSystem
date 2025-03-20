namespace APIsLayer.Errors
{
    public class APIResponceExceptionError:APIResponse
    {
        public string? Details { get; set; }
        public APIResponceExceptionError(int statuscode ,  string? message= null, string? details =null):base(statuscode, message)
        {
            Details = details;   
        }
    }
}
