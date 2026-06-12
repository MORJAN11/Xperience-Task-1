package com.xperience.hero.controller;

import com.xperience.hero.dto.*;
import com.xperience.hero.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5171")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody CreateEventRequest request) {
        try {
            EventDTO event = eventService.createEvent(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(event);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEvent(@PathVariable Long id) {
        try {
            EventDTO event = eventService.getEvent(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<java.util.List<InviteeDTO>> inviteAttendees(@PathVariable Long id, @RequestBody InviteRequest request) {
        try {
            java.util.List<InviteeDTO> invitees = eventService.inviteAttendees(id, request.getEmails());
            return ResponseEntity.ok(invitees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}/invitees")
    public ResponseEntity<java.util.List<InviteeDTO>> getInvitees(@PathVariable Long id, @RequestParam String hostEmail) {
        try {
            java.util.List<InviteeDTO> invitees = eventService.getInvitees(id, hostEmail);
            return ResponseEntity.ok(invitees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelEvent(@PathVariable Long id, @RequestParam String hostEmail) {
        try {
            eventService.cancelEvent(id, hostEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> closeEvent(@PathVariable Long id, @RequestParam String hostEmail) {
        try {
            eventService.closeEvent(id, hostEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Long id, @RequestParam String hostEmail) {
        try {
            DashboardDTO dashboard = eventService.getDashboard(id, hostEmail);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
