using System.ComponentModel.DataAnnotations;

namespace PersonalHealthcareExpense.Web.ViewModels.Medicine
{
    public class MedicineViewModel
    {
        public int MedicineId { get; set; }
        public int HealthcareId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int MorningDose { get; set; }
        public int AfternoonDose { get; set; }
        public int NightDose { get; set; }
        public int DurationInDays { get; set; }
        public decimal Price { get; set; }
    }

    public class AddMedicineViewModel
    {
        [Required]
        [Display(Name = "Healthcare Visit ID")]
        public int HealthcareId { get; set; }

        [Required]
        [Display(Name = "Medicine Name")]
        public string MedicineName { get; set; } = string.Empty;

        [Display(Name = "Morning Dose")]
        public int MorningDose { get; set; }

        [Display(Name = "Afternoon Dose")]
        public int AfternoonDose { get; set; }

        [Display(Name = "Night Dose")]
        public int NightDose { get; set; }

        [Display(Name = "Duration (Days)")]
        public int DurationInDays { get; set; }

        public decimal Price { get; set; }
    }
}
