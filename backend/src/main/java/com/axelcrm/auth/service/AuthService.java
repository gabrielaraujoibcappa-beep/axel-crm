package com.axelcrm.auth.service;

import com.axelcrm.auth.dto.AuthRequest;
import com.axelcrm.auth.dto.LoginResponse;
import com.axelcrm.auth.dto.RegisterRequest;
import com.axelcrm.auth.entity.User;
import com.axelcrm.auth.repository.OrganizationRepository;
import com.axelcrm.auth.repository.UserRepository;
import com.axelcrm.auth.security.JwtUtil;
import com.axelcrm.commons.entity.Organization;
import com.axelcrm.commons.entity.enums.Role;
import com.axelcrm.commons.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Remove espacos acidentais em volta do e-mail informado (colagem no campo de login).
     * Nao aplica lowercase: a coluna users.email e case-sensitive e ha registros distintos
     * que diferem apenas pela caixa.
     */
    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim();
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.findByEmailAndDeletedAtIsNull(request.email()).isPresent()) {
            throw new BadRequestException("E-mail ja cadastrado");
        }

        Organization org = new Organization();
        org.setName(request.organizationName());
        org = organizationRepository.save(org);

        User user = new User();
        user.setName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setOrganization(org);
        user.setRole(Role.ADMIN);
        user.setActive(true);
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                org.getId(),
                org.getName()
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse login(AuthRequest request) {
        String email = normalizeEmail(request.username());

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha invalidos"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("E-mail ou senha invalidos");
        }

        if (!user.isActive()) {
            throw new BadRequestException("Usuario inativo");
        }

        String token = jwtUtil.generateToken(user);
        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getOrganization().getId(),
                user.getOrganization().getName()
        );
    }
}