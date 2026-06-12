package com.xperience.hero.controller;

import com.xperience.hero.dto.RSVPDTO;
import com.xperience.hero.dto.RSVPResponseRequest;
import com.xperience.hero.service.RSVPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rsvp")
@CrossOrigin(origins = "http://localhost:5171")
public class RSVPController {

    @Autowired
    private RSVPService rsvpService;

    @PostMapping("/{token}")
    public ResponseEntity<RSVPDTO> respondToRSVP(@PathVariable String token, @RequestBody RSVPResponseRequest request) {
        try {
            RSVPDTO rsvp = rsvpService.respondToRSVP(token, request);
            return ResponseEntity.ok(rsvp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{token}")
    public ResponseEntity<RSVPDTO> getRSVP(@PathVariable String token) {
        try {
            RSVPDTO rsvp = rsvpService.getRSVPByToken(token);
            return ResponseEntity.ok(rsvp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{token}")
    public ResponseEntity<RSVPDTO> updateRSVP(@PathVariable String token, @RequestBody RSVPResponseRequest request) {
        try {
            RSVPDTO rsvp = rsvpService.respondToRSVP(token, request);
            return ResponseEntity.ok(rsvp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
