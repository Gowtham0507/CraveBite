package com.foodordering.repository;

import com.foodordering.model.Restaurant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends MongoRepository<Restaurant, String> {
    List<Restaurant> findByLocationContainingIgnoreCase(String location);
    Optional<Restaurant> findByExternalId(String externalId);
}
