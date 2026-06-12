package com.xperience.hero.dto;

import com.xperience.hero.entity.RSVPStatus;
import java.time.LocalDateTime;

public class RSVPDTO {
    private Long id;
    private Long inviteeId;
    private Long eventId;
    private String email;
    private RSVPStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public RSVPDTO() {}

    public RSVPDTO(Long id, Long inviteeId, Long eventId, String email, RSVPStatus status,
                   LocalDateTime respondedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.inviteeId = inviteeId;
        this.eventId = eventId;
        this.email = email;
        this.status = status;
        this.respondedAt = respondedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInviteeId() { return inviteeId; }
    public void setInviteeId(Long inviteeId) { this.inviteeId = inviteeId; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public RSVPStatus getStatus() { return status; }
    public void setStatus(RSVPStatus status) { this.status = status; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
