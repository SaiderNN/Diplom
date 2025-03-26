package com.example.SSH_client.auth;




import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/authorize")
    public ResponseEntity<AuthResponse> authorize(
            @RequestBody AuthRequest request
    ){
        return ResponseEntity.ok(authService.authorize(request));
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        var accessToken = authService.refreshToken(request, response);
        return ResponseEntity.ok(accessToken); // Возвращаем новый токен в JSON
    }
}
