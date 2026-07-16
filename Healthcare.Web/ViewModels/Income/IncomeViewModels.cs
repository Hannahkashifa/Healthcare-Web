using System.ComponentModel.DataAnnotations;

namespace PersonalHealthcareExpense.Web.ViewModels.Income
{
    public class IncomeViewModel
    {
        public int IncomeId { get; set; }
        public string Source { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime IncomeDate { get; set; }
        public string? Description { get; set; }
    }

    public class AddIncomeViewModel
    {
        [Required]
        public string Source { get; set; } = string.Empty;

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public DateTime IncomeDate { get; set; }

        public string? Description { get; set; }
    }
}
