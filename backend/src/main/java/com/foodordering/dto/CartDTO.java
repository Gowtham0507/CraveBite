package com.foodordering.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDTO {
    private String id;
    private String userId;
    private List<CartItemDTO> items;
}
