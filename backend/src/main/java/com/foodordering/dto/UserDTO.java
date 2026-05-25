package com.foodordering.dto;

import com.foodordering.model.Role;
import lombok.Data;

@Data
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private Role role;
}
