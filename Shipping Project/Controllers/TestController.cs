using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    /// <summary>
    /// This is a test endpoint that returns a simple "Hello World" message.
    /// </summary>
    /// <remarks>
    /// ### Example Request:
    /// ```http
    /// GET /Test/test
    /// ```
    /// ### Example Response:
    /// ```json
    /// "Hello World"
    /// ```
    /// </remarks>
    /// <returns>A simple string message.</returns>
    /// <response code="200">Returns "Hello World" message successfully.</response>
    /// <response code="400">Bad request if something is incorrect.</response>
    /// <response code="500">Internal server error if something goes wrong.</response>
    [HttpGet]
    [Route("test")]
    [ProducesResponseType(typeof(string), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    [Produces("Application/json")]
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
