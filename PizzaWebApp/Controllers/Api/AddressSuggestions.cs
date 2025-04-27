using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Web;

namespace PizzaWebApp.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressSuggestionsController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public AddressSuggestionsController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet("suggest")]
        public async Task<IActionResult> GetSuggestions(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Query parameter is required.");
            }

            var apiKey = "6f37f56f-f84f-4bc3-855a-3e3c50a1dc76";
            var encodedQuery = HttpUtility.UrlEncode(query);

            // Правильный URL согласно документации
            var requestUrl = $"https://suggest-maps.yandex.ru/v1/suggest?apikey={apiKey}&text={encodedQuery}&lang=ru_RU&results=5";

            try
            {
                var response = await _httpClient.GetAsync(requestUrl);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                return Ok(content);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(500, $"Error fetching suggestions: {ex.Message}");
            }
        }
    }
}
