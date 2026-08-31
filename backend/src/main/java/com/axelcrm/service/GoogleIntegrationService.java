package com.axelcrm.service;

import com.axelcrm.auth.entity.User;
import com.axelcrm.auth.repository.UserRepository;
import com.axelcrm.auth.security.TenantContext;
import com.axelcrm.commons.exception.BadRequestException;
import com.axelcrm.commons.exception.ResourceNotFoundException;
import com.axelcrm.entity.GoogleToken;
import com.axelcrm.repository.GoogleTokenRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoogleIntegrationService {
    private final GoogleTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final Map<String, OAuthState> pendingStates = new ConcurrentHashMap<>();

    @Value("${google.client-id:}") private String clientId;
    @Value("${google.client-secret:}") private String clientSecret;
    @Value("${google.redirect-uri:http://localhost:8080/api/v1/integrations/google/callback}") private String redirectUri;

    private static final String SCOPES = "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/gmail.send";

    public boolean configured() { return !clientId.isBlank() && !clientSecret.isBlank(); }

    public Map<String, Object> status(UUID organizationId, UUID userId) {
        return tokenRepository.findByUser_IdAndOrganization_IdAndDeletedAtIsNull(userId, organizationId)
                .map(token -> Map.<String, Object>of("connected", true, "email", token.getEmail() == null ? "" : token.getEmail()))
                .orElseGet(() -> Map.of("connected", false, "email", ""));
    }

    public String authorizationUrl(UUID organizationId, UUID userId) {
        requireConfigured();
        String state = UUID.randomUUID().toString();
        pendingStates.put(state, new OAuthState(organizationId, userId, System.currentTimeMillis() + 10 * 60 * 1000));
        return "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&response_type=code"
                + "&client_id=" + enc(clientId) + "&redirect_uri=" + enc(redirectUri)
                + "&scope=" + enc(SCOPES) + "&state=" + enc(state);
    }

    @Transactional
    public UUID completeAuthorization(String code, String state) {
        OAuthState oauthState = pendingStates.remove(state);
        if (oauthState == null || oauthState.expiresAt < System.currentTimeMillis()) throw new BadRequestException("OAuth state inválido ou expirado");
        try {
            String body = "code=" + enc(code) + "&client_id=" + enc(clientId) + "&client_secret=" + enc(clientSecret)
                    + "&redirect_uri=" + enc(redirectUri) + "&grant_type=authorization_code";
            JsonNode tokenJson = request("https://oauth2.googleapis.com/token", "application/x-www-form-urlencoded", body, null);
            User user = userRepository.findById(oauthState.userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", oauthState.userId));
            GoogleToken token = tokenRepository.findByUser_IdAndOrganization_IdAndDeletedAtIsNull(oauthState.userId, oauthState.organizationId).orElseGet(GoogleToken::new);
            token.setOrganization(user.getOrganization());
            token.setUser(user);
            token.setAccessToken(tokenJson.path("access_token").asText());
            if (tokenJson.hasNonNull("refresh_token")) token.setRefreshToken(tokenJson.path("refresh_token").asText());
            token.setExpiresAt(LocalDateTime.now().plusSeconds(tokenJson.path("expires_in").asLong(3600)));
            token.setScopes(SCOPES);
            token.setEmail(request("https://www.googleapis.com/oauth2/v3/userinfo", null, null, token.getAccessToken()).path("email").asText(user.getEmail()));
            tokenRepository.save(token);
            return oauthState.userId;
        } catch (Exception ex) {
            throw new BadRequestException("Não foi possível concluir a autorização Google");
        }
    }

    @Transactional
    public void disconnect(UUID organizationId, UUID userId) {
        tokenRepository.findByUser_IdAndOrganization_IdAndDeletedAtIsNull(userId, organizationId).ifPresent(token -> {
            token.setDeletedAt(LocalDateTime.now());
            tokenRepository.save(token);
        });
    }

    public JsonNode calendar(UUID organizationId, UUID userId) { return googleGet(organizationId, userId, "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&singleEvents=true&orderBy=startTime"); }
    public JsonNode contacts(UUID organizationId, UUID userId) { return googleGet(organizationId, userId, "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=100"); }

    public void sendGmail(UUID organizationId, UUID userId, String to, String subject, String body) {
        String raw = "To: " + to + "\r\nSubject: " + subject + "\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + body;
        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        googlePost(organizationId, userId, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", "{\"raw\":\"" + encoded + "\"}");
    }

    private JsonNode googleGet(UUID organizationId, UUID userId, String url) { return requestWithToken(organizationId, userId, "GET", url, null); }
    private void googlePost(UUID organizationId, UUID userId, String url, String body) { requestWithToken(organizationId, userId, "POST", url, body); }

    private JsonNode requestWithToken(UUID organizationId, UUID userId, String method, String url, String body) {
        GoogleToken token = tokenRepository.findByUser_IdAndOrganization_IdAndDeletedAtIsNull(userId, organizationId).orElseThrow(() -> new BadRequestException("Conta Google não conectada"));
        try {
            if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(LocalDateTime.now().plusMinutes(1)) && token.getRefreshToken() != null) refresh(token);
            return request(url, "application/json", body, token.getAccessToken(), method);
        } catch (Exception ex) { throw new BadRequestException("Falha ao acessar o serviço Google"); }
    }

    private void refresh(GoogleToken token) throws Exception {
        String body = "client_id=" + enc(clientId) + "&client_secret=" + enc(clientSecret) + "&refresh_token=" + enc(token.getRefreshToken()) + "&grant_type=refresh_token";
        JsonNode json = request("https://oauth2.googleapis.com/token", "application/x-www-form-urlencoded", body, null);
        token.setAccessToken(json.path("access_token").asText());
        token.setExpiresAt(LocalDateTime.now().plusSeconds(json.path("expires_in").asLong(3600)));
        tokenRepository.save(token);
    }

    private JsonNode request(String url, String contentType, String body, String accessToken) throws Exception { return request(url, contentType, body, accessToken, body == null ? "GET" : "POST"); }
    private JsonNode request(String url, String contentType, String body, String accessToken, String method) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url)).header("Accept", "application/json");
        if (accessToken != null) builder.header("Authorization", "Bearer " + accessToken);
        if (body != null) builder.header("Content-Type", contentType).method(method, HttpRequest.BodyPublishers.ofString(body)); else builder.method(method, HttpRequest.BodyPublishers.noBody());
        HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("Google HTTP " + response.statusCode());
        return response.body().isBlank() ? objectMapper.createObjectNode() : objectMapper.readTree(response.body());
    }
    private void requireConfigured() { if (!configured()) throw new BadRequestException("Google OAuth não configurado: defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET"); }
    private static String enc(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private record OAuthState(UUID organizationId, UUID userId, long expiresAt) {}
}
