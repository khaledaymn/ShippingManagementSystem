using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    /// <summary>
    /// [Endpoint Summary: Describe the purpose of the API]
    /// This endpoint [explain functionality, e.g., retrieves, updates, deletes data].
    /// </summary>
    /// <remarks>
    /// ### Request Format
    /// - **Method:** [GET/POST/PUT/DELETE]
    /// - **Endpoint:** `/api/[resource]/[action]`
    /// - **Authorization:** [Required/Not Required]
    /// - **Content-Type:** `application/json`
    /// 
    /// #### Example Request as Query Parameter:
    /// <code>
    /// GET /api/[resource]/[action]?param=value
    /// </code>
    /// 
    /// #### Example Request as JSON Object:
    /// <code>
    /// {
    ///     "param1": "value1",
    ///     "param2": "value2"
    /// }
    /// </code>
    /// </remarks>
    /// <param name="[paramName]">[Description of the parameter, e.g., ID of the item]</param>
    /// <returns>
    /// Returns an <see cref="IActionResult"/> with the requested data or status response.
    /// </returns>
    /// 
    /// <response code="200">
    /// Success. The operation was successful.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": true,
    ///     "data": { "id": 1, "name": "Sample Data" }
    /// }
    /// </code>
    /// </response>
    /// 
    /// <response code="400">
    /// Bad Request. The request was invalid or missing parameters.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": false,
    ///     "message": "Invalid request format."
    /// }
    /// </code>
    /// </response>
    /// 
    /// <response code="401">
    /// Unauthorized. Authentication credentials are missing or invalid.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": false,
    ///     "message": "Unauthorized access. Token required."
    /// }
    /// </code>
    /// </response>
    /// 
    /// <response code="403">
    /// Forbidden. User does not have permission to perform this action.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": false,
    ///     "message": "Access denied. Admin role required."
    /// }
    /// </code>
    /// </response>
    /// 
    /// <response code="404">
    /// Not Found. The requested resource was not found.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": false,
    ///     "message": "Resource not found."
    /// }
    /// </code>
    /// </response>
    /// 
    /// <response code="429">
    /// Too Many Requests. The request rate limit was exceeded.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": false,
    ///     "message": "Rate limit exceeded. Try again later.",
    ///     "retryAfterSeconds": 60
    /// }
    /// </code>
    /// </response>
    /// 
    /// <response code="500">
    /// Internal Server Error. An unexpected server error occurred.
    /// 
    /// **Example Response:**
    /// <code>
    /// {
    ///     "success": false,
    ///     "message": "An unexpected error occurred.",
    ///     "errorCode": "SERVER_ERROR"
    /// }
    /// </code>
    /// </response>
    /// 
    /// <exception cref="Exception">Thrown when an unexpected server error occurs.</exception>

    [HttpGet]
    [Route("~/Test/test")]
    public IActionResult Test()
    {
       
        try
        {
            return Ok("Hello World");
        }
        catch (Exception ex)
        {
            // Log the exception (if logging is configured)
            return StatusCode(500, "An unexpected error occurred.");
        }
    }
}
