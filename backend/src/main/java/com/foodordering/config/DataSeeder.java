package com.foodordering.config;

import com.foodordering.model.FoodItem;
import com.foodordering.model.Restaurant;
import com.foodordering.model.Role;
import com.foodordering.model.User;
import com.foodordering.repository.FoodItemRepository;
import com.foodordering.repository.RestaurantRepository;
import com.foodordering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (restaurantRepository.count() == 0) {
            Restaurant r1 = Restaurant.builder()
                    .name("Pizza Heaven")
                    .location("New York")
                    .latitude(40.7128)
                    .longitude(-74.0060)
                    .rating(4.8)
                    .imageUrl("https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80")
                    .build();
            Restaurant r2 = Restaurant.builder()
                    .name("Burger Joint")
                    .location("Los Angeles")
                    .latitude(34.0522)
                    .longitude(-118.2437)
                    .rating(4.5)
                    .imageUrl("https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=800&q=80")
                    .build();
            Restaurant r3 = Restaurant.builder()
                    .name("Sushi Master")
                    .location("Hyderabad")
                    .latitude(17.3850)
                    .longitude(78.4867)
                    .rating(4.9)
                    .imageUrl("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80")
                    .build();
            Restaurant r4 = Restaurant.builder()
                    .name("Vijayawada Spice Express")
                    .location("Vijayawada")
                    .latitude(16.5062)
                    .longitude(80.6480)
                    .rating(4.7)
                    .imageUrl("https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80")
                    .build();
            Restaurant r5 = Restaurant.builder()
                    .name("Andhra Meals & Biryani")
                    .location("Vijayawada")
                    .latitude(16.5120)
                    .longitude(80.6410)
                    .rating(4.6)
                    .imageUrl("https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80")
                    .build();

            restaurantRepository.saveAll(List.of(r1, r2, r3, r4, r5));

            FoodItem f1 = FoodItem.builder().name("Margherita Pizza").description("Classic cheese and tomato").price(12.99).category("Pizza").imageUrl("https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80").restaurant(r1).build();
            FoodItem f2 = FoodItem.builder().name("Pepperoni Blast").description("Loaded with pepperoni").price(15.99).category("Pizza").imageUrl("https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80").restaurant(r1).build();
            
            FoodItem f3 = FoodItem.builder().name("Classic Cheeseburger").description("Juicy beef patty with cheese").price(9.99).category("Burger").imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80").restaurant(r2).build();
            
            FoodItem f4 = FoodItem.builder().name("Dragon Roll").description("Eel and cucumber roll").price(18.50).category("Sushi").imageUrl("https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80").restaurant(r3).build();

            foodItemRepository.saveAll(List.of(f1, f2, f3, f4));
            
            System.out.println("Default restaurants and food items inserted!");
        }

        // Seed default admin user if none exists
        if (userRepository.findByEmail("admin@cravebite.com").isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@cravebite.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phoneNumber("1234567890")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin user created! (admin@cravebite.com / admin123)");
        }
    }
}
