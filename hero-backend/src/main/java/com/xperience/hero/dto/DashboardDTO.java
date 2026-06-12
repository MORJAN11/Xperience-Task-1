package com.xperience.hero.dto;

import java.util.List;

public class DashboardDTO {
    private EventDTO event;
    private long yesCount;
    private long noCount;
    private long maybeCount;
    private long waitlistCount;
    private List<RSVPDTO> attendees;

    public DashboardDTO() {}

    public DashboardDTO(EventDTO event, long yesCount, long noCount, long maybeCount, long waitlistCount, List<RSVPDTO> attendees) {
        this.event = event;
        this.yesCount = yesCount;
        this.noCount = noCount;
        this.maybeCount = maybeCount;
        this.waitlistCount = waitlistCount;
        this.attendees = attendees;
    }

    // Getters and Setters
    public EventDTO getEvent() { return event; }
    public void setEvent(EventDTO event) { this.event = event; }

    public long getYesCount() { return yesCount; }
    public void setYesCount(long yesCount) { this.yesCount = yesCount; }

    public long getNoCount() { return noCount; }
    public void setNoCount(long noCount) { this.noCount = noCount; }

    public long getMaybeCount() { return maybeCount; }
    public void setMaybeCount(long maybeCount) { this.maybeCount = maybeCount; }

    public long getWaitlistCount() { return waitlistCount; }
    public void setWaitlistCount(long waitlistCount) { this.waitlistCount = waitlistCount; }

    public List<RSVPDTO> getAttendees() { return attendees; }
    public void setAttendees(List<RSVPDTO> attendees) { this.attendees = attendees; }
}
