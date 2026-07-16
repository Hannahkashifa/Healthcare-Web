using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Services;
using PersonalHealthcareExpense.Web.ViewModels.Income;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class IncomeController : Controller
    {
        private readonly ApiService _api;
        private readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

        public IncomeController(ApiService api) => _api = api;

        public async Task<IActionResult> Index()
        {
            var response = await _api.GetAsync("api/Income");
            if (!response.IsSuccessStatusCode)
                return View(new List<IncomeViewModel>());

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<IncomeViewModel>>(json, _json);
            return View(data ?? new List<IncomeViewModel>());
        }

        public IActionResult Create() => View();

        [HttpPost]
        public async Task<IActionResult> Create(AddIncomeViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(model), Encoding.UTF8, "application/json");

            var response = await _api.PostAsync("api/Income", content);

            if (response.IsSuccessStatusCode)
                return RedirectToAction(nameof(Index));

            var error = await response.Content.ReadAsStringAsync();
            ModelState.AddModelError("", error);
            return View(model);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var response = await _api.GetAsync($"api/Income/{id}");
            if (!response.IsSuccessStatusCode) return RedirectToAction(nameof(Index));

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<IncomeViewModel>(json, _json);
            if (data == null) return RedirectToAction(nameof(Index));

            var model = new AddIncomeViewModel
            {
                Source = data.Source,
                Amount = data.Amount,
                IncomeDate = data.IncomeDate,
                Description = data.Description
            };
            ViewBag.Id = id;
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, AddIncomeViewModel model)
        {
            if (!ModelState.IsValid) { ViewBag.Id = id; return View(model); }

            var content = new StringContent(
                JsonSerializer.Serialize(model), Encoding.UTF8, "application/json");

            await _api.PutAsync($"api/Income/{id}", content);
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            await _api.DeleteAsync($"api/Income/{id}");
            return RedirectToAction(nameof(Index));
        }
    }
}
