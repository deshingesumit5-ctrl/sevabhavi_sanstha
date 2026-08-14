package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.MembershipPlan;
import com.SevabhaviSanstha.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/membership-plans")
public class MembershipPlanController {

    private final PaymentService paymentService;

    public MembershipPlanController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Public: get all plans
    @GetMapping
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        return ResponseEntity.ok(paymentService.getAllMembershipPlans());
    }

    // Public: get plan by planCode (annual / lifetime)
    @GetMapping("/{planCode}")
    public ResponseEntity<?> getPlanByCode(@PathVariable String planCode) {
        try {
            return ResponseEntity.ok(paymentService.getMembershipPlanByCode(planCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: update plan amount
    @PutMapping("/{planCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updatePlanAmount(
            @PathVariable String planCode,
            @RequestBody Map<String, Object> body) {

        try {
            Object rawAmount = body.get("amount");
            if (rawAmount == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "रक्कम आवश्यक आहे"));
            }
            BigDecimal amount = new BigDecimal(rawAmount.toString());
            String updatedBy = SecurityContextHolder.getContext().getAuthentication().getName();

            MembershipPlan updated = paymentService.updateMembershipPlanAmount(planCode, amount, updatedBy);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "सर्वर त्रुटी: " + e.getMessage()));
        }
    }
}
