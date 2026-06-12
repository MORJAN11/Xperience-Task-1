package com.xperience.hero.dto;

import java.time.LocalDateTime;

public class CreateEventRequest {
    private String title;
    private String description;
    private String location;
    private LocalDateTime startDateTime;
    private Integer maxCapacity;
    private String hostEmail;

    // Constructors
    public CreateEventRequest() {}

    public CreateEventRequest(String title, String description, String location, LocalDateTime startDateTime,
                             Integer maxCapacity, String hostEmail) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.startDateTime = startDateTime;
        this.maxCapacity = maxCapacity;
        this.hostEmail = hostEmail;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public String getHostEmail() { return hostEmail; }
    public void setHostEmail(String hostEmail) { this.hostEmail = hostEmail; }
}
