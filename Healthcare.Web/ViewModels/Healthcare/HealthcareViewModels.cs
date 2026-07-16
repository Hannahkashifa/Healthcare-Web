using System.ComponentModel.DataAnnotations;

namespace PersonalHealthcareExpense.Web.ViewModels.Healthcare
{
    public class HealthcareViewModel
    {
        public int HealthcareId { get; set; }
        public string HospitalName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public decimal ConsultationFee { get; set; }
        public string? Notes { get; set; }
    }

    public class AddHealthcareViewModel
    {
        [Required]
        [Display(Name = "Hospital Name")]
        public string HospitalName { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Doctor Name")]
        public string DoctorName { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Visit Date")]
        public DateTime VisitDate { get; set; }

        [Required]
        public string Diagnosis { get; set; } = string.Empty;

        [Display(Name = "Consultation Fee")]
        public decimal ConsultationFee { get; set; }

        public string? Notes { get; set; }
    }
}
