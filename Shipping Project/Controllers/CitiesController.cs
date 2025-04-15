using Microsoft.AspNetCore.Mvc;
using Shipping_Project.DTOs;
using Shipping_Project.UnitOfWork;

[Route("api/[controller]")]
[ApiController]
public class CitiesController : ControllerBase
{
    private readonly UnitOfWork _unitOfWork;

    public CitiesController(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCities()
    {
        var cities = await _unitOfWork.CityRepository.GetAll();
        var cityDTOs = CityDTO.FromCities(cities); // Manual Mapping
        return Ok(cityDTOs);            
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCityById(int id)
    {
        var city = await _unitOfWork.CityRepository.GetById(id);
        if (city == null) return NotFound();
        var cityDTO = CityDTO.FromCity(city); // Manual Mapping
        return Ok(cityDTO);
    }

    [HttpGet("byGovernorate/{governorateId}")]
    public async Task<IActionResult> GetCitiesByGovernorate(int governorateId)
    {
        var cities = await _unitOfWork.CityRepository.GetCitiesByGovernorateId(governorateId);
        var cityDTOs = CityDTO.FromCities(cities); // Manual Mapping
        return Ok(cityDTOs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCity([FromBody] CreateCityDTO createCityDTO)
    {
        var city = createCityDTO.ToCity(); // Manual Mapping
        await _unitOfWork.CityRepository.ADD(city);
        await _unitOfWork.Save();
        return CreatedAtAction(nameof(GetCityById), new { id = city.ID }, CityDTO.FromCity(city));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCity(int id, [FromBody] UpdateCityDTO updateCityDTO)
    {
        if (id != updateCityDTO.Id) return BadRequest();
        var city = await _unitOfWork.CityRepository.GetById(id);
        if (city == null) return NotFound();
        updateCityDTO.UpdateCity(city); // Manual Mapping
        _unitOfWork.CityRepository.Update(city);
        await _unitOfWork.Save();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCity(int id)
    {
        var city = await _unitOfWork.CityRepository.GetById(id);
        if (city == null) return NotFound();
        _unitOfWork.CityRepository.Delete(id);
        await _unitOfWork.Save();
        return NoContent();
    }
}