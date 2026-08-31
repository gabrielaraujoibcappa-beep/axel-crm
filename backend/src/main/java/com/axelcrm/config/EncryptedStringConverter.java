package com.axelcrm.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/** AES-GCM converter for integration secrets; the key is supplied by the environment. */
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    private static final String PREFIX = "enc:v1:";
    private static final int TAG_BITS = 128;
    private final SecretKeySpec key;

    public EncryptedStringConverter() {
        String configured = System.getenv().getOrDefault("AXEL_CREDENTIALS_KEY", "axel-development-key-change-me");
        try { key = new SecretKeySpec(MessageDigest.getInstance("SHA-256").digest(configured.getBytes(StandardCharsets.UTF_8)), "AES"); }
        catch (GeneralSecurityException e) { throw new IllegalStateException(e); }
    }

    @Override public String convertToDatabaseColumn(String value) {
        if (value == null || value.isBlank() || value.startsWith(PREFIX)) return value;
        try {
            byte[] iv = new byte[12]; new java.security.SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            return PREFIX + Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(cipher.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) { throw new IllegalStateException("Unable to encrypt integration credentials", e); }
    }
    @Override public String convertToEntityAttribute(String value) {
        if (value == null || !value.startsWith(PREFIX)) return value;
        try {
            String[] parts = value.substring(PREFIX.length()).split(":", 2);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, Base64.getDecoder().decode(parts[0])));
            return new String(cipher.doFinal(Base64.getDecoder().decode(parts[1])), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | RuntimeException e) { throw new IllegalStateException("Unable to decrypt integration credentials", e); }
    }
}
