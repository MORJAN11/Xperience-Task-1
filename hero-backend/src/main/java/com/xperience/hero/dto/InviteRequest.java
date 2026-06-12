package com.xperience.hero.dto;

public class InviteRequest {
    private String[] emails;

    public InviteRequest() {}

    public InviteRequest(String[] emails) {
        this.emails = emails;
    }

    public String[] getEmails() { return emails; }
    public void setEmails(String[] emails) { this.emails = emails; }
}
