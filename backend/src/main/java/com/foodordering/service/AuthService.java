package com.foodordering.service;

import com.foodordering.dto.AuthRequest;
import com.foodordering.dto.AuthResponse;
import com.foodordering.model.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(User userRequest);
}
