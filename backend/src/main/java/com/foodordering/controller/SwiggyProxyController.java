package com.foodordering.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/swiggy")
public class SwiggyProxyController {
    private static final Logger log = LoggerFactory.getLogger(SwiggyProxyController.class);

    @GetMapping("/restaurants")
    public ResponseEntity<String> getRestaurants(
            @RequestParam String lat,
            @RequestParam String lng) {
        
        String url = "https://www.swiggy.com/dapi/restaurants/list/v5?lat=" + lat + "&lng=" + lng + "&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING";
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
        headers.set("Accept", "application/json");
        headers.set("Origin", "https://www.swiggy.com");
        headers.set("Referer", "https://www.swiggy.com/");
        
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        
        try {
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(res.getBody());
        } catch(Exception e) {
            log.error("Failed to fetch restaurants from Swiggy proxy", e);
            return ResponseEntity.status(500)
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body("{\"error\":\"Failed to fetch data from Swiggy\"}");
        }
    }

    @GetMapping("/menu")
    public ResponseEntity<String> getMenu(
            @RequestParam String lat,
            @RequestParam String lng,
            @RequestParam String restaurantId) {
        String url = "https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=" + lat + "&lng=" + lng + "&restaurantId=" + restaurantId;
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
        headers.set("Accept", "application/json");
        headers.set("Origin", "https://www.swiggy.com");
        headers.set("Referer", "https://www.swiggy.com/");
        
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        
        try {
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(res.getBody());
        } catch(Exception e) {
            log.error("Failed to fetch menu from Swiggy proxy", e);
            return ResponseEntity.status(500)
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body("{\"error\":\"Failed to fetch menu from Swiggy\"}");
        }
    }
}
