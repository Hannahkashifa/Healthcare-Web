using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Services;
using PersonalHealthcareExpense.Web.ViewModels.Healthcare;
using PersonalHealthcareExpense.Web.ViewModels.Medicine;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class MedicineController : Controller
    {
        private readonly ApiService _api;
        private readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

        public MedicineController(ApiService api) => _api = api;

        public async Task<IActionResult> Index()
        {
            var response = await _api.GetAsync("api/Medicine");
            if (!response.IsSuccessStatusCode)
                return View(new List<MedicineViewModel>());

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<MedicineViewModel>>(json, _json);
            return View(data ?? new List<MedicineViewModel>());
        }

        public async Task<IActionResult> Create()
        {
            await LoadHealthcareVisits();
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(AddMedicineViewModel model)
        {
            if (!ModelState.IsValid)
            {
                await LoadHealthcareVisits();
                return View(model);
            }

            var content = new StringContent(
                JsonSerializer.Serialize(model), Encoding.UTF8, "application/json");

            var response = await _api.PostAsync("api/Medicine", content);

            if (response.IsSuccessStatusCode)
                return RedirectToAction(nameof(Index));

            var error = await response.Content.ReadAsStringAsync();
            ModelState.AddModelError("", error);
            await LoadHealthcareVisits();
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            await _api.DeleteAsync($"api/Medicine/{id}");
            return RedirectToAction(nameof(Index));
        }

        private async Task LoadHealthcareVisits()
        {
            var response = await _api.GetAsync("api/Healthcare");
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var visits = JsonSerializer.Deserialize<List<HealthcareViewModel>>(json, _json);
                ViewBag.HealthcareVisits = visits ?? new List<HealthcareViewModel>();
            }
            else
            {
                ViewBag.HealthcareVisits = new List<HealthcareViewModel>();
            }
        }
    }
}
