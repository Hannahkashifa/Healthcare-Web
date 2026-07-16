namespace PersonalHealthcareExpense.Web.ViewModels
{
    public class DashboardViewModel
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalHealthcareExpense { get; set; }
        public decimal CurrentBalance { get; set; }
        public int TotalIncomeTransactions { get; set; }
        public int TotalExpenseTransactions { get; set; }
        public int TotalHealthcareVisits { get; set; }
        public int TotalMedicines { get; set; }
    }
}
