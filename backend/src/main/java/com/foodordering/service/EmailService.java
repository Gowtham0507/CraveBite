package com.foodordering.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

/**
 * Email notification service for sending registration, order confirmation,
 * and order cancellation emails using JavaMailSender (Gmail SMTP).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private String getHtmlTemplate(String title, String heading, String bodyContent, String buttonText, String buttonLink) {
        return "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; }" +
                ".container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }" +
                ".header { background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 40px 20px; text-align: center; color: white; }" +
                ".header h1 { margin: 0; font-size: 28px; font-weight: 800; }" +
                ".header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }" +
                ".content { padding: 40px; color: #374151; }" +
                ".content h2 { margin-top: 0; color: #111827; font-size: 24px; }" +
                ".box { background: #fff5f5; border: 1px solid #fee2e2; border-radius: 12px; padding: 20px; margin: 20px 0; }" +
                ".button-container { text-align: center; margin-top: 30px; }" +
                ".button { display: inline-block; background: linear-gradient(to right, #f97316, #ef4444); color: white; padding: 14px 32px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); }" +
                ".footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }" +
                "</style></head><body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1> CraveBite</h1>" +
                "<p>Your favorite food, delivered fast</p>" +
                "</div>" +
                "<div class='content'>" +
                "<h2>" + heading + "</h2>" +
                bodyContent +
                (buttonText != null ? "<div class='button-container'><a href='" + buttonLink + "' class='button'>" + buttonText + " &rarr;</a></div>" : "") +
                "</div>" +
                "<div class='footer'>" +
                "You received this email because of your activity on CraveBite.<br>&copy; 2026 CraveBite. All rights reserved." +
                "</div></div></body></html>";
    }

    @Async
    public void sendRegistrationEmail(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "CraveBite");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to CraveBite! Your account is ready ");
            
            String body = "<p>We're thrilled to have you join the CraveBite family. Your account is now active and you're ready to explore hundreds of restaurants, discover new cuisines, and get your favorite meals delivered right to your door.</p>" +
                          "<div class='box'>" +
                          "<h3 style='margin-top:0; color:#ef4444; font-size: 16px;'> What you can do now:</h3>" +
                          "<ul style='list-style:none; padding:0; line-height: 2; font-size: 14px;'>" +
                          "<li> Browse restaurants near you</li>" +
                          "<li> Add items to your cart & place orders</li>" +
                          "<li> Track your delivery in real time</li>" +
                          "<li>⭐ Rate your experience</li>" +
                          "</ul></div>";
                          
            helper.setText(getHtmlTemplate("Welcome to CraveBite", "Welcome aboard, " + userName + "! ", body, "Start Ordering Now", "http://localhost:5173"), true);
            
            mailSender.send(message);
            log.info("Registration HTML email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send registration email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String userName, String orderId, Double totalAmount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "CraveBite");
            helper.setTo(toEmail);
            helper.setSubject("Yay! Order Confirmed - #" + orderId);
            
            String body = "<p>Your order has been placed and confirmed successfully! We are already working on preparing your delicious food.</p>" +
                          "<div class='box'>" +
                          "<h3 style='margin-top:0; color:#111827; font-size: 16px;'> Order Details:</h3>" +
                          "<p style='margin:5px 0;'><strong>Order ID:</strong> " + orderId + "</p>" +
                          "<p style='margin:5px 0;'><strong>Total Amount:</strong> ₹" + String.format("%.2f", totalAmount) + "</p>" +
                          "<p style='margin:5px 0;'><strong>Status:</strong> PREPARING</p>" +
                          "</div>" +
                          "<p>Thank you for choosing CraveBite. You can check the live status of your order in your dashboard.</p>";
                          
            helper.setText(getHtmlTemplate("Order Confirmed", "Yay, " + userName + "! Your order is confirmed ", body, "Track Order", "http://localhost:5173/orders"), true);
            
            mailSender.send(message);
            log.info("Order confirmation HTML email sent to: {} for order: {}", toEmail, orderId);
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendOrderCancellationEmail(String toEmail, String userName, String orderId, Double totalAmount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "CraveBite");
            helper.setTo(toEmail);
            helper.setSubject("Order Cancelled - #" + orderId);
            
            String body = "<p>We're sorry, but your order has been cancelled.</p>" +
                          "<div class='box'>" +
                          "<h3 style='margin-top:0; color:#111827; font-size: 16px;'> Cancellation Details:</h3>" +
                          "<p style='margin:5px 0;'><strong>Order ID:</strong> " + orderId + "</p>" +
                          "<p style='margin:5px 0;'><strong>Refund Amount:</strong> ₹" + String.format("%.2f", totalAmount) + "</p>" +
                          "</div>" +
                          "<p>If you've already paid online, the refund will be processed to your original payment method within 3-5 business days. If this was a mistake, you can place a new order anytime.</p>";
                          
            helper.setText(getHtmlTemplate("Order Cancelled", "Order Cancelled, " + userName, body, "Order Again", "http://localhost:5173"), true);
            
            mailSender.send(message);
            log.info("Order cancellation HTML email sent to: {} for order: {}", toEmail, orderId);
        } catch (Exception e) {
            log.warn("Failed to send cancellation email to {}: {}", toEmail, e.getMessage());
        }
    }
}
