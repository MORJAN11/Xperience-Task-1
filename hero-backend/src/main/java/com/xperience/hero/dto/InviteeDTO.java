package com.xperience.hero.dto;

public class InviteeDTO {
    private Long id;
    private Long eventId;
    private String email;
    private String uniqueToken;

    public InviteeDTO() {}

    public InviteeDTO(Long id, Long eventId, String email, String uniqueToken) {
        this.id = id;
        this.eventId = eventId;
        this.email = email;
        this.uniqueToken = uniqueToken;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUniqueToken() { return uniqueToken; }
    public void setUniqueToken(String uniqueToken) { this.uniqueToken = uniqueToken; }
}
