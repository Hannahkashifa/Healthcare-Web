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

        [HttpGet]
        public async Task<IActionResult> GetChartData()
        {
            var token = HttpContext.Session.GetString("Token");
            if (string.IsNullOrEmpty(token)) return Json(new { });

            var expenseByCategory = new List<object>();
            var monthlyData = new List<object>();

            try
            {
                var expenseResponse = await _api.GetAsync("api/Expense");
                if (expenseResponse.IsSuccessStatusCode)
                {
                    var expenseJson = await expenseResponse.Content.ReadAsStringAsync();
                    var expenses = JsonSerializer.Deserialize<List<JsonElement>>(expenseJson, _json);

                    var categoryGroups = new Dictionary<string, decimal>();
                    var monthIncome = new Dictionary<string, decimal>();
                    var monthExpense = new Dictionary<string, decimal>();

                    var now = DateTime.Now;
                    for (int i = 5; i >= 0; i--)
                    {
                        var d = now.AddMonths(-i);
                        var key = d.ToString("MMM yyyy");
                        monthIncome[key] = 0;
                        monthExpense[key] = 0;
                    }

                    if (expenses != null)
                    {
                        foreach (var exp in expenses)
                        {
                            var category = exp.TryGetProperty("category", out var cat) ? cat.GetString() ?? "Other" : "Other";
                            var amount = exp.TryGetProperty("amount", out var amt) ? amt.GetDecimal() : 0m;

                            if (!categoryGroups.ContainsKey(category))
                                categoryGroups[category] = 0m;
                            categoryGroups[category] += amount;

                            if (exp.TryGetProperty("expenseDate", out var dateProp))
                            {
                                if (dateProp.ValueKind == JsonValueKind.String && DateTime.TryParse(dateProp.GetString(), out var expDate))
                                {
                                    var monthKey = expDate.ToString("MMM yyyy");
                                    if (monthExpense.ContainsKey(monthKey))
                                        monthExpense[monthKey] += amount;
                                }
                            }
                        }
                    }

                    foreach (var kv in categoryGroups)
                        expenseByCategory.Add(new { category = kv.Key, amount = kv.Value });

                    foreach (var kv in monthIncome)
                        monthlyData.Add(new { month = kv.Key, income = kv.Value, expense = monthExpense[kv.Key] });
                }

                var incomeResponse = await _api.GetAsync("api/Income");
                if (incomeResponse.IsSuccessStatusCode)
                {
                    var incomeJson = await incomeResponse.Content.ReadAsStringAsync();
                    var incomes = JsonSerializer.Deserialize<List<JsonElement>>(incomeJson, _json);

                    if (incomes != null)
                    {
                        foreach (var inc in incomes)
                        {
                            if (inc.TryGetProperty("incomeDate", out var dateProp) && dateProp.ValueKind == JsonValueKind.String)
                            {
                                if (DateTime.TryParse(dateProp.GetString(), out var incDate))
                                {
                                    var monthKey = incDate.ToString("MMM yyyy");
                                    var existing = monthlyData.Cast<dynamic>().FirstOrDefault(m => (string)m.month == monthKey);
                                    if (existing != null)
                                    {
                                        var amount = inc.TryGetProperty("amount", out var amt) ? amt.GetDecimal() : 0m;
                                        monthlyData = monthlyData.Select(m =>
                                        {
                                            var dyn = m as dynamic;
                                            if ((string)dyn.month == monthKey)
                                                return new { month = (string)dyn.month, income = (decimal)dyn.income + amount, expense = (decimal)dyn.expense };
                                            return m;
                                        }).ToList();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch { }

            return Json(new { expenseByCategory, monthlyData });
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var token = HttpContext.Session.GetString("Token");
            if (string.IsNullOrEmpty(token)) return Json(new List<object>());

            var notifications = new List<object>();

            try
            {
                var expenseResponse = await _api.GetAsync("api/Expense");
                if (expenseResponse.IsSuccessStatusCode)
                {
                    var expenseJson = await expenseResponse.Content.ReadAsStringAsync();
                    var expenses = JsonSerializer.Deserialize<List<JsonElement>>(expenseJson, _json);

                    if (expenses != null && expenses.Count > 0)
                    {
                        var totalExpense = expenses.Sum(e =>
                            e.TryGetProperty("amount", out var amt) ? amt.GetDecimal() : 0m);

                        if (totalExpense > 5000)
                        {
                            notifications.Add(new
                            {
                                message = $"Monthly expenses (₹{totalExpense:N2}) have exceeded ₹5,000",
                                icon = "bi-exclamation-triangle",
                                color = "text-warning",
                                time = "Now"
                            });
                        }

                        var todayExpenses = expenses.Count(e =>
                            e.TryGetProperty("expenseDate", out var d) &&
                            d.ValueKind == JsonValueKind.String &&
                            DateTime.TryParse(d.GetString(), out var dt) &&
                            dt.Date == DateTime.Today);

                        if (todayExpenses > 0)
                        {
                            notifications.Add(new
                            {
                                message = $"You have {todayExpenses} expense(s) recorded today",
                                icon = "bi-receipt",
                                color = "text-info",
                                time = "Today"
                            });
                        }

                        notifications.Add(new
                        {
                            message = "Your health data is backed up",
                            icon = "bi-check-circle",
                            color = "text-success",
                            time = "1h ago"
                        });
                    }
                    else
                    {
                        notifications.Add(new
                        {
                            message = "Start tracking your expenses!",
                            icon = "bi-rocket-takeoff",
                            color = "text-primary",
                            time = "Now"
                        });
                    }
                }
            }
            catch
            {
                notifications.Add(new
                {
                    message = "Unable to fetch notifications",
                    icon = "bi-exclamation-circle",
                    color = "text-muted",
                    time = "Now"
                });
            }

            return Json(notifications);
        }
    }
}
