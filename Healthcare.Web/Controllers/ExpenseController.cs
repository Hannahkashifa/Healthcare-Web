using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Services;
using PersonalHealthcareExpense.Web.ViewModels.Expense;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class ExpenseController : Controller
    {
        private readonly ApiService _api;
        private readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

        public ExpenseController(ApiService api) => _api = api;

        public async Task<IActionResult> Index()
        {
            var response = await _api.GetAsync("api/Expense");
            if (!response.IsSuccessStatusCode)
                return View(new List<ExpenseViewModel>());

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<ExpenseViewModel>>(json, _json);
            return View(data ?? new List<ExpenseViewModel>());
        }

        public IActionResult Create() => View();

        [HttpPost]
        public async Task<IActionResult> Create(AddExpenseViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(model), Encoding.UTF8, "application/json");

            var response = await _api.PostAsync("api/Expense", content);

            if (response.IsSuccessStatusCode)
                return RedirectToAction(nameof(Index));

            var error = await response.Content.ReadAsStringAsync();
            ModelState.AddModelError("", error);
            return View(model);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var response = await _api.GetAsync($"api/Expense/{id}");
            if (!response.IsSuccessStatusCode) return RedirectToAction(nameof(Index));

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<ExpenseViewModel>(json, _json);
            if (data == null) return RedirectToAction(nameof(Index));

            var model = new AddExpenseViewModel
            {
                Category = data.Category,
                Amount = data.Amount,
                ExpenseDate = data.ExpenseDate,
                Description = data.Description
            };
            ViewBag.Id = id;
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, AddExpenseViewModel model)
        {
            if (!ModelState.IsValid) { ViewBag.Id = id; return View(model); }

            var content = new StringContent(
                JsonSerializer.Serialize(model), Encoding.UTF8, "application/json");

            await _api.PutAsync($"api/Expense/{id}", content);
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            await _api.DeleteAsync($"api/Expense/{id}");
            return RedirectToAction(nameof(Index));
        }
    }
}
