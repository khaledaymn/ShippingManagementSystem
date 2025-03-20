namespace APIsLayer.Errors
{
    public class APIResponse
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; }
        public APIResponse(int statuscode, string? message = null)
        {
            StatusCode = statuscode;
            Message = message ?? GetDefaultMessageError(statuscode);
        }

        private string? GetDefaultMessageError(int statuscode)
        {
            return statuscode switch
            {
                400 => "Bad Request",
                401 => "Unauthorized",
                404 => "Resource Not Found",
                500 => "Errors leads to anger",
                _ => null
            };
        }
    }
}
