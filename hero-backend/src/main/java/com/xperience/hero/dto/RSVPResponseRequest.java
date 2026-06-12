package com.xperience.hero.dto;

import com.xperience.hero.entity.RSVPStatus;

public class RSVPResponseRequest {
    private RSVPStatus status;

    public RSVPResponseRequest() {}

    public RSVPResponseRequest(RSVPStatus status) {
        this.status = status;
    }

    public RSVPStatus getStatus() { return status; }
    public void setStatus(RSVPStatus status) { this.status = status; }
}
