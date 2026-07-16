using Microsoft.AspNetCore.Mvc;
using PersonalHealthcareExpense.Web.Models;
using System.Diagnostics;

namespace PersonalHealthcareExpense.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index() => RedirectToAction("Login", "Account");

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
