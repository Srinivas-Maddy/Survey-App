package com.surveyapp.tests;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

public class ApiTest {

    private static final String API_BASE = "http://localhost:3000/api";
    private final Gson gson = new Gson();

    private HttpClient createClient() {
        return HttpClient.newBuilder()
                .cookieHandler(new CookieManager())
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    private HttpResponse<String> post(HttpClient client, String url, Object body) throws IOException, InterruptedException {
        String json = gson.toJson(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(HttpClient client, String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> patch(HttpClient client, String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .method("PATCH", HttpRequest.BodyPublishers.noBody())
                .header("Content-Type", "application/json")
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> delete(HttpClient client, String url) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .DELETE()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test(priority = 1)
    public void testGetAuthMeReturns401WhenNotAuthenticated() throws IOException, InterruptedException {
        HttpClient client = createClient();
        HttpResponse<String> res = get(client, API_BASE + "/auth/me");
        Assert.assertEquals(res.statusCode(), 401, "Should return 401 when not authenticated");
    }

    @Test(priority = 2)
    public void testRegisterCreatesUser() throws IOException, InterruptedException {
        HttpClient client = createClient();
        Map<String, String> body = Map.of(
                "name", "API Test User",
                "email", "api_test_" + System.currentTimeMillis() + "@example.com",
                "password", "Test@1234"
        );
        HttpResponse<String> res = post(client, API_BASE + "/auth/register", body);
        Assert.assertEquals(res.statusCode(), 200, "Register should return 200");
        JsonObject data = gson.fromJson(res.body(), JsonObject.class);
        Assert.assertTrue(data.has("user"), "Response should have user field");
        Assert.assertEquals(data.getAsJsonObject("user").get("name").getAsString(), "API Test User");
    }

    @Test(priority = 3)
    public void testRegisterRejectsDuplicateEmail() throws IOException, InterruptedException {
        HttpClient client = createClient();
        String email = "dup_" + System.currentTimeMillis() + "@example.com";
        Map<String, String> body = Map.of("name", "User One", "email", email, "password", "Test@1234");

        post(client, API_BASE + "/auth/register", body);

        // Duplicate
        HttpClient client2 = createClient();
        HttpResponse<String> res = post(client2, API_BASE + "/auth/register", body);
        Assert.assertEquals(res.statusCode(), 400, "Duplicate email should return 400");
    }

    @Test(priority = 4)
    public void testLoginWithValidCredentials() throws IOException, InterruptedException {
        HttpClient client = createClient();
        String email = "login_" + System.currentTimeMillis() + "@example.com";
        post(client, API_BASE + "/auth/register",
                Map.of("name", "Login User", "email", email, "password", "Test@1234"));

        HttpResponse<String> res = post(client, API_BASE + "/auth/login",
                Map.of("email", email, "password", "Test@1234"));
        Assert.assertEquals(res.statusCode(), 200, "Login should return 200");
        JsonObject data = gson.fromJson(res.body(), JsonObject.class);
        Assert.assertTrue(data.has("user"), "Response should have user field");
    }

    @Test(priority = 5)
    public void testLoginWithWrongPasswordReturns401() throws IOException, InterruptedException {
        HttpClient client = createClient();
        HttpResponse<String> res = post(client, API_BASE + "/auth/login",
                Map.of("email", "nonexist@example.com", "password", "wrong"));
        Assert.assertEquals(res.statusCode(), 401, "Wrong password should return 401");
    }

    @Test(priority = 6)
    public void testGetSurveysRequiresAuth() throws IOException, InterruptedException {
        HttpClient client = createClient();
        HttpResponse<String> res = get(client, API_BASE + "/surveys");
        Assert.assertEquals(res.statusCode(), 401, "Surveys endpoint should require auth");
    }

    @Test(priority = 7)
    public void testFullSurveyLifecycle() throws IOException, InterruptedException {
        HttpClient client = createClient();
        String email = "lifecycle_" + System.currentTimeMillis() + "@example.com";

        // Register
        HttpResponse<String> regRes = post(client, API_BASE + "/auth/register",
                Map.of("name", "Lifecycle User", "email", email, "password", "Test@1234"));
        Assert.assertEquals(regRes.statusCode(), 200);

        // Create survey
        Map<String, Object> surveyBody = Map.of(
                "title", "API Test Survey",
                "description", "Created via API test",
                "questions", List.of(
                        Map.of("id", "q1", "type", "text", "label", "Your name?", "required", true, "options", List.of()),
                        Map.of("id", "q2", "type", "rating", "label", "Rate us", "required", false, "options", List.of()),
                        Map.of("id", "q3", "type", "phone", "label", "Phone number?", "required", false, "options", List.of()),
                        Map.of("id", "q4", "type", "email", "label", "Email address?", "required", false, "options", List.of())
                )
        );
        HttpResponse<String> createRes = post(client, API_BASE + "/surveys", surveyBody);
        Assert.assertEquals(createRes.statusCode(), 201, "Create survey should return 201");
        JsonObject createData = gson.fromJson(createRes.body(), JsonObject.class);
        JsonObject survey = createData.getAsJsonObject("survey");
        String surveyId = survey.get("_id").getAsString();
        String publicId = survey.get("publicId").getAsString();
        Assert.assertEquals(survey.get("title").getAsString(), "API Test Survey");

        // List surveys
        HttpResponse<String> listRes = get(client, API_BASE + "/surveys");
        Assert.assertEquals(listRes.statusCode(), 200);
        JsonObject listData = gson.fromJson(listRes.body(), JsonObject.class);
        Assert.assertTrue(listData.getAsJsonArray("surveys").size() > 0);

        // Get public survey
        HttpResponse<String> pubRes = get(client, API_BASE + "/public/" + publicId);
        Assert.assertEquals(pubRes.statusCode(), 200);

        // Submit response
        HttpResponse<String> submitRes = post(client, API_BASE + "/public/" + publicId,
                Map.of("answers", Map.of("q1", "John Doe", "q2", "4", "q3", "+1234567890", "q4", "john@example.com")));
        Assert.assertEquals(submitRes.statusCode(), 201);

        // Get survey with responses
        HttpResponse<String> detailRes = get(client, API_BASE + "/surveys/" + surveyId);
        Assert.assertEquals(detailRes.statusCode(), 200);
        JsonObject detailData = gson.fromJson(detailRes.body(), JsonObject.class);
        Assert.assertEquals(detailData.getAsJsonArray("responses").size(), 1);

        // Toggle inactive
        HttpResponse<String> toggleRes = patch(client, API_BASE + "/surveys/" + surveyId + "/toggle");
        Assert.assertEquals(toggleRes.statusCode(), 200);
        JsonObject toggleData = gson.fromJson(toggleRes.body(), JsonObject.class);
        Assert.assertFalse(toggleData.getAsJsonObject("survey").get("isActive").getAsBoolean());

        // Public survey should be unavailable
        HttpResponse<String> pubInactiveRes = get(client, API_BASE + "/public/" + publicId);
        Assert.assertEquals(pubInactiveRes.statusCode(), 404);

        // Delete survey
        HttpResponse<String> delRes = delete(client, API_BASE + "/surveys/" + surveyId);
        Assert.assertEquals(delRes.statusCode(), 200);
    }

    @Test(priority = 8)
    public void testQrCodeEndpointReturnsDataUrl() throws IOException, InterruptedException {
        HttpClient client = createClient();
        String email = "qr_" + System.currentTimeMillis() + "@example.com";
        post(client, API_BASE + "/auth/register",
                Map.of("name", "QR User", "email", email, "password", "Test@1234"));

        Map<String, Object> surveyBody = Map.of(
                "title", "QR Survey",
                "description", "",
                "questions", List.of(
                        Map.of("id", "q1", "type", "text", "label", "Test?", "required", false, "options", List.of())
                )
        );
        HttpResponse<String> createRes = post(client, API_BASE + "/surveys", surveyBody);
        JsonObject survey = gson.fromJson(createRes.body(), JsonObject.class).getAsJsonObject("survey");
        String surveyId = survey.get("_id").getAsString();
        String publicId = survey.get("publicId").getAsString();

        HttpResponse<String> qrRes = get(client, API_BASE + "/surveys/" + surveyId + "/qrcode");
        Assert.assertEquals(qrRes.statusCode(), 200);
        JsonObject qrData = gson.fromJson(qrRes.body(), JsonObject.class);
        Assert.assertTrue(qrData.get("qrDataUrl").getAsString().contains("data:image/png;base64"));
        Assert.assertTrue(qrData.get("publicUrl").getAsString().contains("/s/" + publicId));
    }
}
