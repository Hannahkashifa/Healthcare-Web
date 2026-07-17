using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;

namespace PersonalHealthcareExpense.Web.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApiService(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        private void AddToken()
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
            var token = _httpContextAccessor.HttpContext?.Session.GetString("Token");
            if (!string.IsNullOrEmpty(token))
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public async Task<HttpResponseMessage> GetAsync(string url)
        {
            AddToken();
            return await _httpClient.GetAsync(url);
        }

        public async Task<HttpResponseMessage> PostAsync(string url, HttpContent content)
        {
            AddToken();
            return await _httpClient.PostAsync(url, content);
        }

        public async Task<HttpResponseMessage> PutAsync(string url, HttpContent content)
        {
            AddToken();
            return await _httpClient.PutAsync(url, content);
        }

        public async Task<HttpResponseMessage> DeleteAsync(string url)
        {
            AddToken();
            return await _httpClient.DeleteAsync(url);
        }

        public async Task<HttpResponseMessage> PostAnonymousAsync(string url, HttpContent content)
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
            return await _httpClient.PostAsync(url, content);
        }
    }
}
