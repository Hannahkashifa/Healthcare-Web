using System.ComponentModel.DataAnnotations;

namespace PersonalHealthcareExpense.Web.ViewModels.Expense
{
    public class ExpenseViewModel
    {
        public int ExpenseId { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? Description { get; set; }
    }

    public class AddExpenseViewModel
    {
        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public DateTime ExpenseDate { get; set; }

        public string? Description { get; set; }
    }
}
