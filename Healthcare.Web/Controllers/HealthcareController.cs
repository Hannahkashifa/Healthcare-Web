using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Services;
using PersonalHealthcareExpense.Web.ViewModels.Healthcare;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class HealthcareController : Controller
    {
        private readonly ApiService _api;
        private readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

        public HealthcareController(ApiService api) => _api = api;

        public async Task<IActionResult> Index()
        {
            var response = await _api.GetAsync("api/Healthcare");
            if (!response.IsSuccessStatusCode)
                return View(new List<HealthcareViewModel>());

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<HealthcareViewModel>>(json, _json);
            return View(data ?? new List<HealthcareViewModel>());
        }

        public IActionResult Create() => View();

        [HttpPost]
        public async Task<IActionResult> Create(AddHealthcareViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(model), Encoding.UTF8, "application/json");

            var response = await _api.PostAsync("api/Healthcare", content);

            if (response.IsSuccessStatusCode)
                return RedirectToAction(nameof(Index));

            var error = await response.Content.ReadAsStringAsync();
            ModelState.AddModelError("", error);
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            await _api.DeleteAsync($"api/Healthcare/{id}");
            return RedirectToAction(nameof(Index));
        }
    }
}
