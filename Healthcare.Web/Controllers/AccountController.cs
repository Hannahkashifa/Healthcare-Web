using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Services;
using PersonalHealthcareExpense.Web.ViewModels.Account;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApiService _api;

        public AccountController(ApiService api) => _api = api;

        [HttpGet]
        public IActionResult Login()
        {
            if (!string.IsNullOrEmpty(HttpContext.Session.GetString("Token")))
                return RedirectToAction("Index", "Dashboard");
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(new { model.Email, model.Password }),
                Encoding.UTF8, "application/json");

            var response = await _api.PostAsync("api/Users/login", content);

            if (!response.IsSuccessStatusCode)
            {
                ViewBag.Error = "Invalid email or password.";
                return View(model);
            }

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(json);
            var token = result.GetProperty("token").GetString()!;

            HttpContext.Session.SetString("Token", token);

            var meResponse = await _api.GetAsync("api/Users/me");
            if (meResponse.IsSuccessStatusCode)
            {
                var meJson = await meResponse.Content.ReadAsStringAsync();
                var me = JsonSerializer.Deserialize<JsonElement>(meJson);
                HttpContext.Session.SetString("UserId", me.GetProperty("userId").GetString()!);
                HttpContext.Session.SetString("UserName", me.GetProperty("name").GetString()!);
            }

            return RedirectToAction("Index", "Dashboard");
        }

        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(new
                {
                    model.FullName,
                    model.Email,
                    model.Password,
                    model.PhoneNumber
                }),
                Encoding.UTF8, "application/json");

            var response = await _api.PostAsync("api/Users/register", content);

            if (response.IsSuccessStatusCode)
            {
                TempData["Success"] = "Registration successful! Please login.";
                return RedirectToAction(nameof(Login));
            }

            var error = await response.Content.ReadAsStringAsync();
            ModelState.AddModelError("", error);
            return View(model);
        }

        [HttpGet]
        public IActionResult ForgotPassword() => View();

        [HttpPost]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(new { model.Email }),
                Encoding.UTF8, "application/json");

            var response = await _api.PostAnonymousAsync("api/Users/forgot-password", content);

            if (response.IsSuccessStatusCode)
            {
                ViewBag.Success = "If the email exists, a password reset link has been sent. Please check your inbox.";
                return View(new ForgotPasswordViewModel());
            }

            var error = await response.Content.ReadAsStringAsync();
            ViewBag.Error = error;
            return View(model);
        }

        [HttpGet]
        public IActionResult ResetPassword(string token)
        {
            if (string.IsNullOrEmpty(token))
                return RedirectToAction(nameof(Login));

            var model = new ResetPasswordViewModel { Token = token };
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var content = new StringContent(
                JsonSerializer.Serialize(new { model.Token, model.NewPassword, model.ConfirmPassword }),
                Encoding.UTF8, "application/json");

            var response = await _api.PostAnonymousAsync("api/Users/reset-password", content);

            if (response.IsSuccessStatusCode)
            {
                ViewBag.Success = "Your password has been reset successfully! You can now login.";
                return View(new ResetPasswordViewModel { Token = model.Token });
            }

            var error = await response.Content.ReadAsStringAsync();
            ViewBag.Error = error;
            return View(model);
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction(nameof(Login));
        }
    }
}
