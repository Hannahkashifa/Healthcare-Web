using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Services;
using PersonalHealthcareExpense.Web.ViewModels;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class DashboardController : Controller
    {
        private readonly ApiService _api;
        private readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

        public DashboardController(ApiService api) => _api = api;

        public async Task<IActionResult> Index()
        {
            var token = HttpContext.Session.GetString("Token");
            if (string.IsNullOrEmpty(token))
                return RedirectToAction("Login", "Account");

            var response = await _api.GetAsync("api/Dashboard");

            if (!response.IsSuccessStatusCode)
                return View(new DashboardViewModel());

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<DashboardViewModel>(json, _json);
            return View(data ?? new DashboardViewModel());
        }
    }
}
