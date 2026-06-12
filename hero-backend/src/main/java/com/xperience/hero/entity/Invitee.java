package com.xperience.hero.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "invitees", schema = "hero", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "email"})
})
public class Invitee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String email;

    @Column(name = "unique_token", nullable = false, unique = true)
    private String uniqueToken;

    // Constructors
    public Invitee() {
        this.uniqueToken = UUID.randomUUID().toString();
    }

    public Invitee(Event event, String email) {
        this.event = event;
        this.email = email;
        this.uniqueToken = UUID.randomUUID().toString();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUniqueToken() {
        return uniqueToken;
    }

    public void setUniqueToken(String uniqueToken) {
        this.uniqueToken = uniqueToken;
    }
}
